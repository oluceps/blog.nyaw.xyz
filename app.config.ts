import { defineConfig } from "@solidjs/start/config";
import UnoCSS from 'unocss/vite'
import remarkFrontmatter from "remark-frontmatter";
import rehypeRaw from "rehype-raw";
import { nodeTypes } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import remarkExpressiveCode from "remark-expressive-code";
import type { ExpressiveCodeTheme } from "remark-expressive-code";
import rehypeSlug from "rehype-slug";
import rehypeAutoLinkHeadings from "rehype-autolink-headings";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

import docs from "./src/routes/data";

// @ts-expect-error missing types
import pkg from "@vinxi/plugin-mdx";

const { default: mdx } = pkg;

function docsData() {
	const virtualModuleId = "solid:collection";
	const resolveVirtualModuleId = "\0" + virtualModuleId;

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
				`;
			}
		},
	};
}
const remarkExpressiveCodeOptions = {
	themes: ["vitesse-light", "rose-pine"],
	themeCSSSelector: (theme: ExpressiveCodeTheme) =>
		`[data-theme="${theme.name}"]`,
	// I dont like dark mode
	useDarkModeMediaQuery: false,
	styleOverrides: {
		frames: {
			shadowColor: "rgb(0 0 0 / 1%)",
		},
	},
};

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
					// rehypeMathJaxSVG,
					() => rehypeKatex({ output: "html" }),
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
				],
				remarkPlugins: [
					remarkGfm,
					remarkFrontmatter,
					[remarkExpressiveCode, remarkExpressiveCodeOptions],
					remarkMath,
				],
			}),
			{ enforce: "pre" },
		],
	},
	server: {
		preset: "vercel-edge",
		prerender: {
			crawlLinks: true,
			autoSubfolderIndex: false,
			failOnError: true,
			ignore: [/\{\getPath}/, /.*?emojiSvg\(.*/],
		},
	},
});
