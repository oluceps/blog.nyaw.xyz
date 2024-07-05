/** @type {import('tailwindcss').Config} */

const defaultTheme = require("tailwindcss/defaultTheme");
const round = (num) =>
	num
		.toFixed(7)
		.replace(/(\.[0-9]+?)0+$/, "$1")
		.replace(/\.0$/, "");
const em = (px, base) => `${round(px / base)}em`;
const rem = (px) => `${round(px / 16)}rem`

export default {
	content: [
		"./src/**/*.{js,jsx,ts,tsx,md,mdx}",
		"./content/**/*.{js,jsx,ts,tsx,md,mdx}",
	],
	darkMode: 'selector', // NO DARK
	theme: {
		extend: {
			fontSize: {
				sm: "15px",
			},
			screens: {
				"2xl": "1440px",
				"3xl": "1920px",
				"4xl": "2560px",
			},
			fontFamily: {
				sans: ["MiSans", ...defaultTheme.fontFamily.sans],
				serif: ["MiSans", ...defaultTheme.fontFamily.serif],
				display: ["var(--font-geist)", { fontFeatureSettings: '"ss01"' }],
				mono: [
					"var(--font-geist-mono)",
					"PingFang SC",
					"Hiragino Sans GB",
					"MiSans",
					...defaultTheme.fontFamily.mono,
				],
			},
			typography: (theme) => ({
				DEFAULT: {
					css: {
						maxWidth: "76ch",
						"blockquote p:first-of-type::before": { content: "none" },
						"blockquote p:first-of-type::after": { content: "none" },
						a: {
							"text-decoration-color": theme("colors.sprout[500]"),
						},
						h1: {
							marginTop: "0",
							fontSize: em(20, 14),
							marginTop: em(32, 20),
							marginBottom: em(16, 20),
							lineHeight: round(28 / 20),
						},
						h2: {
							fontSize: em(18, 14),
							marginTop: em(28, 18),
							marginBottom: em(8, 18),
							lineHeight: round(28 / 18),
						},
						h3: {
							marginTop: em(20, 14),
							marginBottom: em(8, 14),
							lineHeight: round(20 / 14),
						},
						h4: {
							marginTop: em(20, 14),
							marginBottom: em(8, 14),
							lineHeight: round(18 / 14),
						},
					},
				},
				lg: {
					css: {
						fontSize: rem(20),
						lineHeight: round(24 / 14),
					}
				}
			}),
			colors: {
				sprout: {
					50: "#f3f6ef",
					100: "#e4ecdb",
					200: "#ccdabc",
					300: "#b5caa0",
					400: "#8dab70",
					500: "#6f9052",
					600: "#55713f",
					700: "#435833",
					800: "#39472d",
					900: "#313e29",
					950: "#182013",
				},
				'chill': {
					'50': '#f2f9f9',
					'100': '#ddeff0',
					'200': '#bfe0e2',
					'300': '#92cace',
					'400': '#5faab1',
					'500': '#438e96',
					'600': '#3b757f',
					'700': '#356169',
					'800': '#325158',
					'900': '#2d464c',
					'950': '#1a2c32',
				},
				'ouchi': {
					'50': '#f8f7fb',
					'100': '#f0f0f7',
					'200': '#e5e4f0',
					'300': '#d0cde5',
					'400': '#b7b0d5',
					'500': '#9b90c2',
					'600': '#8776b1',
					'700': '#75649d',
					'800': '#625384',
					'900': '#52466c',
					'950': '#342d48',
				},

			},
		},
	},
	plugins: [
		require("@tailwindcss/typography"),
		require("daisyui")
	],
	daisyui: {
		themes: ["light"],
		darkTheme: "light", // I HATE DARK
		base: true,
		styled: true,
		utils: true,
		prefix: "",
		logs: true,
		themeRoot: ":root",
	},
};
