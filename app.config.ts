import { defineConfig } from "@solidjs/start/config";
import UnoCSS from "unocss/vite";
import remarkFrontmatter from "remark-frontmatter";
import rehypeRaw from "rehype-raw";
import { nodeTypes } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import rehypeShiki from "@shikijs/rehype";
import remarkMath from "remark-math";

// @ts-expect-error missing types
import rehypeTypst from "@myriaddreamin/rehype-typst";
// import rehypeABCJS from "rehype-abcjs";

import {
	transformerNotationDiff,
	transformerNotationHighlight,
	transformerNotationFocus,
	transformerNotationErrorLevel,
	transformerNotationWordHighlight,
} from "@shikijs/transformers";

// import rehypeExpressiveCode from "rehype-expressive-code";
import rehypeSlug from "rehype-slug";
import rehypeAutoLinkHeadings from "rehype-autolink-headings";

import docs from "./src/routes/data";

// @ts-expect-error missing types
import pkg from "@vinxi/plugin-mdx";

const { default: mdx } = pkg;

function docsData() {
	const virtualModuleId = "solid:collection";
	const resolveVirtualModuleId = "\0" + virtualModuleId;

	const docsMap = new Map(docs.map(d => [d.path, d]));

	return {
		name: "solid:collection",
		resolveId(id: string) {
			if (id === virtualModuleId) {
				return resolveVirtualModuleId;
			}
		},
		async load(id: string) {
			if (id === resolveVirtualModuleId) {
				return `
				export const docsData = ${JSON.stringify(docs, null, 2)}
				export const docsMap = ${JSON.stringify(Object.fromEntries(docsMap), null, 2)}
				`;
			}
		},
	};
}

export default defineConfig({
	middleware: "src/middleware/index.ts",
	extensions: ["mdx", "md", "tsx"],
	vite: {
		plugins: [
			UnoCSS(),
			docsData(),
			mdx.withImports({})({
				define: {
					"import.meta.env": `'import.meta.env'`,
				},

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
								transformerNotationDiff({ matchAlgorithm: 'v3', }),
								transformerNotationHighlight(),
								transformerNotationErrorLevel(),
								transformerNotationWordHighlight(),
							],
						},
					],
				],
				remarkPlugins: [remarkGfm, remarkMath,
					// rehypeABCJS,
					remarkFrontmatter],
				remarkRehypeOptions: {
					footnoteLabelTagName: "h1",
					footnoteLabel: "Footnotes"
				}
			}),
			{ enforce: "pre" },
		],
	},
	server: {
		preset: "cloudflare_module",
		compatibilityDate: '2025-01-11',
		cloudflare: {
			deployConfig: true,
			nodeCompat: true,
			wrangler: {
				name: "secia-blog-nyaw-xyz",
				routes: [
					{
						pattern: "blog.nyaw.xyz",
						zone_name: "nyaw.xyz",
						custom_domain: true
					}
				],
				placement: {
					mode: "smart"
				},
				"observability": {
					"enabled": false,
					"head_sampling_rate": 1,
					"logs": {
						"enabled": true,
						"head_sampling_rate": 1,
						"persist": true,
						"invocation_logs": true
					},
					"traces": {
						"enabled": false,
						"persist": true,
						"head_sampling_rate": 1
					}
				}
			}
		},
		// rollupConfig: {
		// 	external: ["__STATIC_CONTENT_MANIFEST", "node:async_hooks"],
		// },
		prerender: {
			crawlLinks: true,
			ignore: [/\{\getPath}/, /.*?emojiSvg\(.*/, /.*?QuickLinks\(.*/],
		},
	},
});
