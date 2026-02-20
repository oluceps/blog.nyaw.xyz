// @ts-ignore
const base_url = import.meta.env.DEV ? "http://localhost:3000" : "https://blog.nyaw.xyz";
export default {
	base_url,
	title: "Tabula Rasa",
	obj_store: "https://s3.nyaw.xyz/blog-assets",
	author: "Secirian",
	minisign_pubkey: "untrusted comment: minisign public key 74B2AF4537744B9\n" +
		"RWS5RHdT9CpLB37kQdM+tHwW8xwOSwsA3xExt6PUt1X3VR0w3e7DRE9/",
	heartrate_endpoint : "wss://heartrate.nyaw.xyz/ws",
	taxonomies: [
		{
			feed: true,
			name: "tags",
		},
		{
			feed: true,
			name: "categories",
		},
	],
	description: "Secirian's blog. Place to place myself",
	hideLevel: 0,
	license: "CC BY-SA 4.0",
	menu: [
		{
			name: "我?",
			url: "/me",
		},
		{
			name: "分类",
			url: "/taxonomy",
		},
		{
			name: "搜寻",
			url: "/search",
		},
		{
			name: "首頁",
			url: "/",
		},
	],
	about: {
		tags: [
			"恋词癖",
			"业余画师",
			"时区待定",
			"互联网考古爱好者",
		],
		lorem: ["循此苦旅 以达星辰", "廿一世紀 末日未接近時出生"]
	}
};
