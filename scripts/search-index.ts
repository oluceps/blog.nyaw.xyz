import { nanoid } from 'nanoid';
import { promises as fs } from 'fs';
import { join } from 'path';
// 注意：如果在 TS 环境下报错，可能需要改为 import { default as data } from ...
import data from '../src/routes/data'; 
import matter from "gray-matter";
import ky from "ky";

// 环境变量检查，防止运行时 undefined
const MEILI_HOST = 'https://ms.nyaw.xyz';
const INDEX_NAME = 'blog';
const API_KEY = process.env.MS_KEY;

if (!API_KEY) {
    console.error("Error: process.env.MS_KEY is not set.");
    process.exit(1);
}

// 辅助函数：尝试解析正确的文件路径
async function resolveFilePath(prefix: string, entryPath: string): Promise<string> {
    // 策略 1: 尝试 src/routes/post/xxx.mdx
    const mdxPath = join(prefix, `${entryPath}.mdx`);
    try {
        await fs.access(mdxPath);
        return mdxPath;
    } catch {
        // 忽略错误，继续尝试下一个策略
    }

    // 策略 2: 尝试 src/routes/xxx/index.mdx
    const indexPath = join(prefix, entryPath, 'index.mdx');
    try {
        await fs.access(indexPath);
        return indexPath;
    } catch {
        // 两个都找不到，抛出错误
        throw new Error(`Cannot find file for entry: ${entryPath} (tried .mdx and /index.mdx)`);
    }
}

async function processEntries(prefixPath: string) {
  try {
    const entries = data;

    console.log(`Found ${entries.length} entries to process.`);

    const processed = await Promise.all(entries.map(async entry => {
      // 这里的 id 虽然生成了，但 Meilisearch 使用 path 作为主键，所以 id 只是作为一个普通字段存储
      const id = nanoid();

      // --- 修改开始：智能解析文件路径 ---
      let content = "";
      try {
          const filePath = await resolveFilePath(prefixPath, entry.path);
          const fileContent = await fs.readFile(filePath, 'utf-8');
          // 只提取正文内容，去掉 frontmatter
          content = matter(fileContent).content; 
      } catch (err) {
          console.warn(`Warning: Skipping ${entry.path} due to file read error:`, err);
          return null; // 标记为失败，稍后过滤
      }
      // --- 修改结束 ---

      const { path, ...rest } = entry;
      return {
        ...rest,
        id: nanoid(),
        path, // 保留 path 但不作为主键
        content
      };
    }));

    // 过滤掉读取失败的条目
    const validDocuments = processed.filter(item => item !== null);

    if (validDocuments.length === 0) {
        console.log("No valid documents to upload.");
        return;
    }

    // 先清空旧数据
    await deleteAllDocuments();

    // upload
    console.log(`Uploading ${validDocuments.length} documents...`);
    const resp = await ky.post(`${MEILI_HOST}/indexes/${INDEX_NAME}/documents`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      json: validDocuments // ky 支持直接传 json，不需要手动 stringify
    }).json();

    console.log('Upload response:', resp);
    console.log(`Complete! Processed ${validDocuments.length} items.`);

  } catch (error) {
    console.error("Fatal Error:", error);
    process.exit(1);
  }
}

async function deleteAllDocuments() {
  console.log("Deleting all existing documents...");
  try {
    const response = await ky.delete(
      `${MEILI_HOST}/indexes/${INDEX_NAME}/documents`,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // 等待任务被接受
    const result = await response.json(); 
    console.log("Delete task accepted:", JSON.stringify(result, null, 2));

    return result;
  } catch (error: any) {
    if (error.response) {
      const body = await error.response.json().catch(() => ({}));
      console.error('Meilisearch API error:', {
        status: error.response.status,
        message: body.message || body
      });
    } else {
      console.error('Request failed:', error.message);
    }
    throw error;
  }
}

const PREFIX_PATH = './src/routes/';

processEntries(PREFIX_PATH);
