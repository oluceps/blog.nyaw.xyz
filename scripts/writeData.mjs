import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";

const ROUTES_DIR = "./src/routes";
const POSTS_DIR = path.join(ROUTES_DIR, "post");

/**
 * Helper function to read and parse frontmatter from a file
 * @param {string} filePath - Absolute or relative path to the file
 * @returns {Promise<{path: string, data: any} | null>}
 */
async function parseMdxFile(filePath) {
	try {
		const file = await fs.readFile(filePath, "utf-8");
		const frontMatterData = matter(file).data;
		return { filePath, data: frontMatterData };
	} catch (error) {
		console.warn(`Warning: Failed to process ${filePath}`, error);
		return null;
	}
}

/**
 * Normalizes the raw frontmatter data into the standard shape
 * @param {object} rawData - The raw frontmatter data
 * @param {string} routePath - The final web route path (e.g., "post/my-post" or "project-name")
 */
function normalizeData(rawData, routePath) {
	return {
		date: rawData.date ? new Date(rawData.date).toISOString() : "",
		description: rawData.description || "",
		categories: rawData.categories || [],
		tags: rawData.tags || [],
		toc: rawData.toc || false,
		title: rawData.title || "",
		path: routePath,
		draft: rawData.draft || false,
		hideLevel: rawData.hideLevel ?? 10,
		author: rawData.author || "",
		math: rawData.math || false,
		featured_image: rawData.featured_image || "",
	};
}

/**
 * Scans src/routes/post for flat .mdx files and subdirectories with index.mdx
 * Maps: /post/filename.mdx -> path: "post/filename"
 * Maps: /post/subdir/index.mdx -> path: "post/subdir"
 */
async function getPostFiles() {
	try {
		const files = await fs.readdir(POSTS_DIR);
		
		// First: handle flat .mdx files
		const flatMdxFiles = files.filter((file) => path.extname(file) === ".mdx");

		const flatPromises = flatMdxFiles.map(async (filename) => {
			const filePath = path.join(POSTS_DIR, filename);
			const result = await parseMdxFile(filePath);
			if (!result) return null;

			// Logic: /post/filename
			const routePath = "post/" + filename.replace(".mdx", "");
			return normalizeData(result.data, routePath);
		});

		// Second: handle subdirectories with index.mdx
		const subdirs = files.filter((file) => {
			return fs.access(path.join(POSTS_DIR, file)).then(() => true).catch(() => false);
		});
		
		const subdirPromises = subdirs.map(async (subdir) => {
			const indexPath = path.join(POSTS_DIR, subdir, "index.mdx");
			try {
				await fs.access(indexPath);
			} catch {
				return null;
			}
			
			const result = await parseMdxFile(indexPath);
			if (!result) return null;
			
			const routePath = "post/" + subdir;
			return normalizeData(result.data, routePath);
		});

		const [flatResults, subdirResults] = await Promise.all([
			Promise.all(flatPromises),
			Promise.all(subdirPromises)
		]);

		return [...flatResults, ...subdirResults].filter((item) => item !== null);
	} catch (error) {
		console.error("Error reading posts directory:", error);
		return [];
	}
}

/**
 * Scans directories inside src/routes (excluding 'post')
 * Looks for index.mdx inside them.
 * Maps: /routes/folder/index.mdx -> path: "folder"
 */
async function getRouteDirectories() {
	try {
		const entries = await fs.readdir(ROUTES_DIR, { withFileTypes: true });
		
		// Filter only directories and exclude 'post' or strictly internal folders like 'api' if needed
		const dirs = entries.filter((entry) => 
			entry.isDirectory() && 
			entry.name !== "post" && 
			entry.name !== "api"
		);

		const promises = dirs.map(async (dirEntry) => {
			const dirName = dirEntry.name;
			const indexFilePath = path.join(ROUTES_DIR, dirName, "index.mdx");

			// Check if index.mdx exists
			try {
				await fs.access(indexFilePath);
			} catch {
				// index.mdx does not exist, skip this folder
				return null;
			}

			const result = await parseMdxFile(indexFilePath);
			if (!result) return null;

			// Logic: use the folder name as the route
			const routePath = dirName;
			return normalizeData(result.data, routePath);
		});

		const results = await Promise.all(promises);
		return results.filter((item) => item !== null);
	} catch (error) {
		console.error("Error reading routes directory:", error);
		return [];
	}
}

// Main execution
async function main() {
	console.log("Scanning files...");

	const [posts, routes] = await Promise.all([
		getPostFiles(),
		getRouteDirectories()
	]);

	const allContent = [...posts, ...routes];

	// Sort by date in descending order (latest to oldest)
	allContent.sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
	);

	const tsOutput = `export default ${JSON.stringify(allContent, null, 2)} as const;`;

	await fs.writeFile("./src/routes/data.ts", tsOutput);
	console.log(`Successfully indexed ${allContent.length} items to data.ts`);
}

main().catch((error) => {
	console.error("Fatal Error:", error);
});
