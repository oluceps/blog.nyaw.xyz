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
	const mdxFiles = files.filter((file) => path.extname(file) === ".mdx");
	const mdxFilePaths = mdxFiles.map((file) => path.join(dirPath, file));
	const frontMatterDataArray = [];

	for (const filePath of mdxFilePaths) {
		const frontMatterData = await getFrontMatterData(filePath);
		frontMatterDataArray.push(frontMatterData);
	}

	return frontMatterDataArray;
}

const directoryPath = "./src/routes";

getAllMdxFiles(directoryPath)
	.then((frontMatterDataArray) => {
		const output = frontMatterDataArray.map((data) => {
			const frontMatter = data.data;

			// Populate missing fields with default values
			return {
				date: frontMatter.date ? new Date(frontMatter.date).toISOString() : "",
				description: frontMatter.description || "",
				categories: frontMatter.categories || [],
				tags: frontMatter.tags || [],
				toc: frontMatter.toc || false,
				title: frontMatter.title || "",
				path: data.path.split("/").pop()?.replace(".mdx", "") || "",
				draft: frontMatter.draft || false,
				hideLevel: frontMatter.hideLevel ?? 10, // Use nullish coalescing to check for undefined or null
				author: frontMatter.author || "",
				math: frontMatter.math || false,
				featured_image: frontMatter.featured_image || "",
			};
		});

		// Sort by date in descending order (latest to oldest)
		output.sort(
			(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
		);

		const tsOutput = `export default ${JSON.stringify(output, null, 2)} as const;`;

		return fs.writeFile("./src/routes/data.ts", tsOutput);
	})
	.then(() => {
		console.log("Data successfully written to data.ts");
	})
	.catch((error) => {
		console.error("Error:", error);
	});
