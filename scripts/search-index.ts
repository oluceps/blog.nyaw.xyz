import { nanoid } from 'nanoid';
import { promises as fs } from 'fs';
import { join } from 'path';
import data from '../src/routes/data';
import matter from "gray-matter";
import ky from "ky";

async function processEntries(prefixPath: string) {
  try {
    const entries = data;

    const processed = await Promise.all(entries.map(async entry => {
      const id = nanoid();

      const filePath = join(prefixPath, `${entry.path}.mdx`);

      const content = matter(await fs.readFile(filePath, 'utf-8')).content;

      return {
        ...entry,
        id,
        content
      };
    }));

    await deleteAllDocuments()

    // upload
    const resp = await ky.post(`${MEILI_HOST}/indexes/blog/documents?primaryKey=path`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(processed)
    })
    console.log(resp)

    console.log(`complete! all ${processed.length}`);

  } catch (error) {
    console.error(error);
  }
}
const MEILI_HOST = 'https://ms.nyaw.xyz';
const INDEX_NAME = 'blog';
const API_KEY = process.env.MS_KEY;

async function deleteAllDocuments() {
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

    const result = await response.json();
    console.log(JSON.stringify(result, null, 2));

    return result;
  } catch (error: any) {
    if (error.response) {
      const body = await error.response.json();
      console.error('Meilisearch API error:', {
        status: error.response.status,
        message: body.message || body
      });
    } else {
      console.error('req fail:', error.message);
    }
    throw error;
  }
}

const PREFIX_PATH = './src/routes/';

processEntries(PREFIX_PATH);
