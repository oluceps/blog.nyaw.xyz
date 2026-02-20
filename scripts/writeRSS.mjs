// scripts/writeRss.mjs
import fs from "fs/promises";
import path from "path";
import { Feed } from "feed"; // 假设您已安装 'feed'

const baseURL = "https://blog.nyaw.xyz";
const readData = async () => {
	const filePath = path.resolve("src/routes/data.ts");
	const data = (await fs.readFile(filePath, "utf-8")).slice(15, -10);
	return JSON.parse(data);
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
        .filter((item) => !item.draft) // 过滤草稿
        .forEach((item) => {
            feed.addItem({
                title: item.title,
                id: `${baseURL}/${item.path}`,
                link: `${baseURL}/${item.path}`,
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
