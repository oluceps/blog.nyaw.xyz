import fs from "fs/promises";

const baseURL = "https://blog.nyaw.xyz";

const readData = async () => {
	const module = await import("../.content-collections/generated/allPosts.js");
	return module.default;
};

const generateSitemap = (data) => {
	const urls = data
		.filter((item) => !item.draft)
		.map((item) => `${baseURL}/${item._meta.path}`)
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
