import { defineConfig, type Plugin } from "vite";
import { nitro } from "nitro/vite";
import { solidStart } from "@solidjs/start/config";
import UnoCSS from "unocss/vite";
import remarkFrontmatter from "remark-frontmatter";
import rehypeRaw from "rehype-raw";
import { nodeTypes } from "@mdx-js/mdx";
import mdx from "@mdx-js/rollup";
import remarkGfm from "remark-gfm";
import rehypeShiki from "@shikijs/rehype";
import remarkMath from "remark-math";
import contentCollections from "@content-collections/vite";

// @ts-expect-error missing types
import rehypeTypst from "@myriaddreamin/rehype-typst";

import {
	transformerNotationDiff,
	transformerNotationHighlight,
	transformerNotationFocus,
	transformerNotationErrorLevel,
	transformerNotationWordHighlight,
} from "@shikijs/transformers";

import rehypeSlug from "rehype-slug";
import rehypeAutoLinkHeadings from "rehype-autolink-headings";

/** Shift all heading levels +1 so MDX `#` becomes `<h2>` (Page.tsx provides the sole `<h1>`) */
function rehypeShiftHeadings() {
	return (tree: any) => {
		const walk = (node: any) => {
			if (node.type === "element") {
				const m = /^h([1-5])$/.exec(node.tagName);
				if (m) node.tagName = `h${parseInt(m[1]!) + 1}`;
			}
			if (node.children) node.children.forEach(walk);
		};
		walk(tree);
	};
}

const mdxPlugin = {
	...mdx({
		jsx: true,
		jsxImportSource: "solid-js",
		providerImportSource: "solid-mdx",
		rehypePlugins: [
			[
				rehypeRaw,
				{
					passThrough: nodeTypes,
				},
			],
			[rehypeSlug],
			[
				rehypeAutoLinkHeadings,
				{
					behavior: "wrap",
					properties: {
						className: "heading",
					},
				},
			],
			rehypeShiftHeadings,
			rehypeTypst,
			[
				rehypeShiki,
				{
					inline: "tailing-curly-colon",
					theme: "vitesse-light",
					defaultLanguage: "text",
					defaultColor: false,
					transformers: [
						transformerNotationFocus(),
						transformerNotationDiff({ matchAlgorithm: "v3" }),
						transformerNotationHighlight(),
						transformerNotationErrorLevel(),
						transformerNotationWordHighlight(),
					],
				},
			],
		],
		remarkPlugins: [remarkGfm, remarkMath, remarkFrontmatter],
		remarkRehypeOptions: {
			footnoteLabelTagName: "h2",
			footnoteLabel: "Footnotes",
		},
	}),
	enforce: "pre",
} satisfies Plugin;

export default defineConfig({
	optimizeDeps: {
		include: ["@jridgewell/trace-mapping"],
	},
	plugins: [
		contentCollections(),
		mdxPlugin,
		solidStart({
			middleware: "src/middleware/index.ts",
			extensions: ["mdx", "md"],
		}),
		UnoCSS(),
		nitro(),
	],
	nitro: {
		preset: "cloudflare_module",
		compatibilityDate: "2025-01-11",
		cloudflare: {
			deployConfig: true,
			nodeCompat: true,
			wrangler: {
				name: "secia-blog-nyaw-xyz",
				routes: [
					{
						pattern: "blog.nyaw.xyz",
						zone_name: "nyaw.xyz",
						custom_domain: true,
					},
				],
				placement: {
					mode: "smart",
				},
				observability: {
					enabled: false,
					head_sampling_rate: 1,
					logs: {
						enabled: true,
						head_sampling_rate: 1,
						persist: true,
						invocation_logs: true,
					},
					traces: {
						enabled: false,
						persist: true,
						head_sampling_rate: 1,
					},
				},
			},
		},
		prerender: {
			crawlLinks: true,
			ignore: [/\{\getPath}/, /.*?emojiSvg\(.*/, /.*?QuickLinks\(.*/],
		},
	},
});
