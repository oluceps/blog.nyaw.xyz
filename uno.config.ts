// uno.config.ts
import {
	defineConfig,
	presetTypography,
	transformerDirectives,
	presetIcons,
	presetWebFonts,
	transformerVariantGroup,
	presetWind3,
	type Preset
} from "unocss";
import { presetScrollbar } from 'unocss-preset-scrollbar'
import presetCorvu from '@corvu/unocss'


export default defineConfig({
	transformers: [transformerDirectives(), transformerVariantGroup()],
	shortcuts: {
		btn: "py-2 px-4 font-semibold rounded-lg shadow-md",
	},

	theme: {
		fontSize: {
			sm: "15px",
			md: "17px",
		},

		fontFamily: {
			sans: ["PingFang SC", "Hiragino Sans GB", "Wotfard", "TsangerYunHei W04"],
			serif: ["PingFang SC", "Hiragino Sans GB", "Wotfard", "Microsoft YaHei"],
			mono: ["Microsoft YaHei"]
		},

		breakpoints: {
			sm: "640px",
			md: "768px",
			lg: "1024px",
			xl: "1280px",
			"2xl": "1440px",
			"3xl": "1920px",
			"4xl": "2560px",
		},
		animation: {
			keyframes: {
				expand: '{0% { height: 0px; } 100% { height: var(--corvu-disclosure-content-height); }}',
				collapse: '{0% { height: var(--corvu-disclosure-content-height); } 100% { height: 0px; }}'
			},
			durations: {
				expand: "300ms",
				collapse: "200ms"
			},
			timingFns: {
				expand: "cubic-bezier(0.32,0.72,0,0.75)",
				collapse: "cubic-bezier(0.32,0.72,0,0.75)"
			},
		},
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
			chill: {
				50: "#f2f9f9",
				100: "#ddeff0",
				200: "#bfe0e2",
				300: "#92cace",
				400: "#5faab1",
				500: "#438e96",
				600: "#3b757f",
				700: "#356169",
				800: "#325158",
				900: "#2d464c",
				950: "#1a2c32",
			},
			ouchi: {
				50: "#f8f7fb",
				100: "#f0f0f7",
				200: "#e5e4f0",
				300: "#d0cde5",
				400: "#b7b0d5",
				500: "#9b90c2",
				600: "#8776b1",
				700: "#75649d",
				800: "#625384",
				900: "#52466c",
				950: "#342d48",
			},
			corvu: {
				bg: '#f3f1fe',
				100: '#e6e2fd',
				200: '#d4cbfb',
				300: '#bcacf6',
				400: '#a888f1',
				text: '#180f24',
			},
			cerise: {
				50: "#fef2f4",
				100: "#fde6e9",
				200: "#fbd0d9",
				300: "#f7aab9",
				400: "#f27a93",
				500: "#e63f66",
				600: "#d42a5b",
				700: "#b21e4b",
				800: "#951c45",
				900: "#801b40",
				950: "#470a1f",
			},
		},
	},
	presets: [
		presetWind3(),
		presetTypography({
			cssExtend: {
				"blockquote p:first-of-type::before": { content: "none" },
				"blockquote p:first-of-type::after": { content: "none" },
				"code::before": {
					content: "none",
				},
				"code::after": {
					content: "none",
				},
				a: {
					"text-decoration-color": "#b5caa0",
				},
				h1: {
					margin: "1rem 0", // h1 is always at the top of the page, so only margin 1 * root font size
					"font-size": "1.65em",
				},
				h2: {
					margin: "1.75em 0 .5em",
					"font-size": "1.55em",
				},
			},
		}),
		presetCorvu() as unknown as Preset<any>,
		presetIcons(),
		presetScrollbar({}),
		presetWebFonts({
			provider: 'bunny',
			fonts: {
				mono: ['Fira Code:300,500'],
				serif: ['spectral']
			},
		}),
	],
});
