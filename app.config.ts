import { defineConfig } from "@solidjs/start/config";
import remarkFrontmatter from "remark-frontmatter";
import rehypeRaw from "rehype-raw";
import { nodeTypes } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import remarkExpressiveCode from 'remark-expressive-code'
import { ExpressiveCodeTheme } from "remark-expressive-code";
import rehypeSlug from "rehype-slug";
import rehypeAutoLinkHeadings from "rehype-autolink-headings";
// import rehypeKatex from 'rehype-katex'
// import remarkMath from 'remark-math'

/* @ts-ignore */
import pkg from "@vinxi/plugin-mdx";

const { default: mdx } = pkg;


const remarkExpressiveCodeOptions = {
  themes: [
    "min-light",
    "rose-pine"
  ],
  themeCSSSelector: (theme: ExpressiveCodeTheme) =>
    `[data-theme="${theme.name}"]`,
  // I dont like dark mode
  useDarkModeMediaQuery: false,
  styleOverrides: {
    frames: {
      shadowColor: 'rgb(0 0 0 / 1%)',
    },
  },
}


export default defineConfig({
  extensions: ["mdx", "md", "tsx"],
  vite: {
    plugins: [
      mdx.withImports({})({
        define: {
          "import.meta.env": `'import.meta.env'`,
        },

        jsx: true,
        jsxImportSource: "solid-js",
        providerImportSource: "solid-mdx",
        rehypePlugins: [
          // rehypeKatex,
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
          // remarkMath
        ],
      }),
      { enforce: "pre" },
    ],
  },
  server: {
    preset: "vercel",
  },
});
