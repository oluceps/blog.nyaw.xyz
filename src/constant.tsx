export default {
	base_url: "https://blog.nyaw.xyz",
	title: "紙",
	obj_store: "https://pub-54793cba1fde4e8aaa0e7872d8eeb3d2.r2.dev",
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
	extra: {
		author: "secirian",
		description: "secirian's blog",
		hideLevel: 0,
		license: "CC BY-SA 4.0 Deed",
		menu: [
			{
				name: "关于",
				url: "/about",
				weight: 4,
			},
			{
				name: "留言",
				url: "https://github.com/oluceps/oluceps/issues/new",
				weight: 3,
			},
		],
	},
};
