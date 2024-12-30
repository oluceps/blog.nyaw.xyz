// @ts-ignore
const base_url = import.meta.env.DEV ? "http://localhost:3000" : "https://blog.nyaw.xyz";
export default {
	base_url,
	title: "紙",
	obj_store: "https://pub-54793cba1fde4e8aaa0e7872d8eeb3d2.r2.dev",
	author: "Secirian",
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
			name: "留言",
			url: "https://github.com/oluceps/oluceps/issues/new",
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
			"互联网考古学爱好者",
		]
	}
};
