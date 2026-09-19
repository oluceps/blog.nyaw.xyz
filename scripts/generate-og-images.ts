import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';
import allPosts from '../.content-collections/generated/allPosts.js';
import allAppMdxes from '../.content-collections/generated/allAppMdxes.js';
import allAppRoutes from '../.content-collections/generated/allAppRoutes.js';
import { chromium } from 'playwright-core';
import { getHtml } from './og/template.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '../public/og');
const CHROMIUM_PATH = '/run/current-system/sw/bin/chromium';

const data = [
  ...allPosts,
  ...allAppMdxes,
  ...allAppRoutes
];

async function ensureDir(dir: string) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

function getEntropy(seed: string, length: number): number[] {
  let result: number[] = [];
  let currentSeed = seed;
  
  while (result.length < length) {
    const hash = createHash('sha256').update(currentSeed).digest();
    for (let i = 0; i < hash.length; i += 4) {
      if (result.length >= length) break;
      const val = hash.readUInt32LE(i);
      result.push(val / 4294967295);
    }
    currentSeed = hash.toString('hex');
  }
  return result;
}

async function generateOGImage(browser: any, post: any) {
  const title = post.title || 'Untitled';
  const date = post.date ? new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : '';
  
  const entropy = getEntropy(post._meta.path, 300);
  const html = getHtml(title, date, entropy);

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1200, height: 630 });
  
  // Set content with baseURL to allow font loading from public directory
  const baseUrl = `file://${join(__dirname, '../public/')}`;
  await page.setContent(html, { 
    waitUntil: 'networkidle' as any,
    baseUrl: baseUrl
  });
  
  // Wait for the pattern to be drawn
  await page.waitForSelector('#shapes polygon');

  const fileName = `${post._meta.path.replace(/\//g, '-')}.png`;
  const filePath = join(OUTPUT_DIR, fileName);

  await page.screenshot({
    path: filePath,
    type: 'png',
    clip: { x: 0, y: 0, width: 1200, height: 630 }
  });
  
  await page.close();
  return fileName;
}

async function main() {
  if (process.env.SKIP_OG) {
    console.log('Skipping OG image generation (SKIP_OG is set)');
    return;
  }
  console.log('Generating Twitter/OG cards using Headless Chromium...');
  await ensureDir(OUTPUT_DIR);
  
  const posts = data.filter((p: any) => !p.draft);
  console.log(`Processing ${posts.length} posts...`);

  let browser;
  try {
    const launchOptions: any = {
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    };

    // Use NixOS specific path if it exists, otherwise let playwright find it
    try {
      await fs.access(CHROMIUM_PATH);
      launchOptions.executablePath = CHROMIUM_PATH;
      console.log(`Using Chromium at ${CHROMIUM_PATH}`);
    } catch {
      console.log('NixOS Chromium path not found, using default launch options');
    }

    browser = await chromium.launch(launchOptions);

    for (const post of posts) {
      try {
        const fileName = await generateOGImage(browser, post);
        console.log(`Generated: ${fileName}`);
      } catch (err) {
        console.error(`Failed to generate for ${post._meta.path}:`, err);
      }
    }
  } catch (err) {
    console.error('Failed to launch browser:', err);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
  
  console.log('OG image generation complete!');
}

main();
