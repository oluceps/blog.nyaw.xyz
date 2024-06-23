import fs from "fs/promises";
import path from "path";

const baseURL = "https://blog.nyaw.xyz";

const readData = async () => {
	const filePath = path.resolve("src/routes/data.ts");
	const data = (await fs.readFile(filePath, "utf-8")).slice(15, -10);
	return JSON.parse(data);
};

const generateSitemap = (data) => {
	const urls = data
		.filter((item) => !item.draft)
		.map((item) => `${baseURL}/${item.path}`)
		.join("\n");

	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
		.split("\n")
		.map((url) => `  <url>\n    <loc>${url}</loc>\n  </url>`)
		.join("\n")}\n</urlset>`;
};

const generateAndSaveSitemap = async () => {
	try {
		const data = await readData();
		const sitemap = generateSitemap(data);
		await fs.writeFile("public/sitemap.xml", sitemap);
		console.log("Sitemap generated and saved as sitemap.xml");
	} catch (error) {
		console.error("Error generating sitemap:", error);
	}
};

generateAndSaveSitemap();
