import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";

async function getFrontMatterData(entryPath) {
  const file = await fs.readFile(entryPath, "utf-8");
  const frontMatterData = matter(file).data;
  return { path: entryPath, data: frontMatterData };
}

async function getAllMdxFiles(dirPath) {
  const files = await fs.readdir(dirPath);
  const mdxFiles = files.filter(file => path.extname(file) === '.mdx');
  const mdxFilePaths = mdxFiles.map(file => path.join(dirPath, file));
  const frontMatterDataArray = [];

  for (const filePath of mdxFilePaths) {
    const frontMatterData = await getFrontMatterData(filePath);
    frontMatterDataArray.push(frontMatterData);
  }

  return frontMatterDataArray;
}

const directoryPath = './src/routes';

getAllMdxFiles(directoryPath)
  .then(frontMatterDataArray => {
    const output = [];
    frontMatterDataArray.forEach(data => {
      // Assuming date is stored in the front matter under the key 'date'
      if (data.data.date) {
        data.data.date = new Date(data.data.date); // Convert date string to Date object
      }
      output.push({ ...data.data, path: data.path.split("/").pop()?.replace(".mdx", "") });
    });

    // Sort by date in descending order (latest to oldest)
    output.sort((a, b) => new Date(b.date) - new Date(a.date));

    const jsonOutput = JSON.stringify(output, null, 2); // Pretty-print JSON with 2 spaces indentation

    return fs.writeFile('./src/routes/data.json', jsonOutput);
  })
  .then(() => {
    console.log('Data successfully written to data.json');
  })
  .catch(error => {
    console.error('Error:', error);
  });

