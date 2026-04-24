// scripts/writeRss.mjs
import fs from "fs/promises";
import path from "path";
import { Feed } from "feed";

const baseURL = "https://blog.nyaw.xyz";

const readData = async () => {
	const module = await import("../.content-collections/generated/allPosts.js");
	return module.default;
};

const generateRss = (data) => {
    // 初始化 Feed
    const feed = new Feed({
        title: "lyophylla's blog",
        description: "",
        id: baseURL,
        link: baseURL,
        language: "zh-CN",
        favicon: `${baseURL}/favicon.svg`,
        copyright: `All rights reserved ${new Date().getFullYear()}, lyophylla`,
        author: {
            name: "lyophylla",
        }
    });

    data
        .filter((item) => !item.draft)
        .forEach((item) => {
            feed.addItem({
                title: item.title,
                id: `${baseURL}/${item._meta.path}`,
                link: `${baseURL}/${item._meta.path}`,
                description: item.description,
                date: new Date(item.date),
            });
        });

    return feed.rss2();
};

const generateAndSaveRss = async () => {
	try {
		const data = await readData();
		const rss = generateRss(data);
		await fs.writeFile("public/rss.xml", rss);
		console.log("RSS feed generated and saved as rss.xml");
	} catch (error) {
		console.error("Error generating RSS feed:", error);
	}
};

generateAndSaveRss();
