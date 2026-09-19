import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import data from '../.content-collections/generated/allPosts.js';
import matter from 'gray-matter';

const __dirname = dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = join(__dirname, '../src/routes/(post)');
const OUTPUT_FILE = join(__dirname, '../src/generated/updates.json');

interface Update {
  date: string;
  content: string;
  postTitle: string;
  postPath: string;
}

async function ensureDir(dir: string) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

function parseDate(dateStr: string): Date | null {
  try {
    const cleaned = dateStr.replace(/\./g, '/').replace('年', '/').replace('月', '/').replace('日', ' ');
    const d = new Date(cleaned);
    if (!isNaN(d.getTime())) return d;
  } catch {}
  return null;
}

async function extractUpdatesFromFile(filePath: string, postTitle: string, postPath: string, fallbackDate: string): Promise<Update[]> {
  const content = await fs.readFile(filePath, 'utf-8');
  const { content: body } = matter(content);
  const updates: Update[] = [];

  // Match all <Update> components, optionally with a date attribute
  const regex = /<Update(?:\s+date="([^"]+)")?>([\s\S]*?)<\/Update>/gi;
  let match;

  while ((match = regex.exec(body)) !== null) {
    const dateStr = match[1]; // might be undefined if no date attribute
    let updateContent = match[2].trim();
    
    if (!updateContent) {
        updateContent = "Post updated.";
    }

    let parsedDate = dateStr ? parseDate(dateStr) : null;
    if (!parsedDate) {
        // Fallback to the post's creation date if we can't parse or find an update date
        parsedDate = new Date(fallbackDate); 
    }
    
    // Ignore invalid dates
    if (isNaN(parsedDate.getTime())) continue;

    updates.push({
      date: parsedDate.toISOString(),
      content: updateContent,
      postTitle,
      postPath
    });
  }

  return updates;
}

async function main() {
  console.log('Extracting updates from structured <Update> components...');
  const updates: Update[] = [];

  for (const post of data) {
    if (post.draft) continue;
    const entryPath = post._meta?.path || post.path;
    const filePath = join(POSTS_DIR, `${entryPath}.mdx`);
    
    try {
      await fs.access(filePath);
      const fileUpdates = await extractUpdatesFromFile(filePath, post.title, entryPath, post.date);
      updates.push(...fileUpdates);
    } catch (err) {
      const indexPath = join(POSTS_DIR, entryPath, 'index.mdx');
      try {
        await fs.access(indexPath);
        const fileUpdates = await extractUpdatesFromFile(indexPath, post.title, entryPath, post.date);
        updates.push(...fileUpdates);
      } catch (err2) {}
    }
  }

  // Sort by date descending
  const sortedUpdates = updates.toSorted((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  await ensureDir(dirname(OUTPUT_FILE));
  await fs.writeFile(OUTPUT_FILE, JSON.stringify(sortedUpdates, null, 2));
  console.log(`Extracted ${updates.length} updates to ${OUTPUT_FILE}`);
}

main();
