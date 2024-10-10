// uno.config.ts
import {
	defineConfig,
	presetTypography,
	presetUno,
	transformerDirectives,
	transformerCompileClass,
	presetIcons,
} from "unocss";
import presetWind from "@unocss/preset-wind";
import presetRemToPx from "@unocss/preset-rem-to-px";



export default defineConfig({
	transformers: [transformerCompileClass(), transformerDirectives()],
	shortcuts: {
		btn: "py-2 px-4 font-semibold rounded-lg shadow-md",
	},

	theme: {
		fontSize: {
			sm: "15px",
		},

		fontFamily: {
			sans: ["PingFang SC", "Hiragino Sans GB", "Microsoft YaHei"],
			serif: ["PingFang SC", "Hiragino Sans GB", "Microsoft YaHei"],
			mono: ["Geist Mono", "PingFang SC", "Hiragino Sans GB"],
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
			"accordion-down": "accordion-down 0.2s ease-out",
			"accordion-up": "accordion-up 0.2s ease-out",
			shaking: "tilt-n-move-shaking 0.4s ease-in-out infinite",
		},
		keyframes: {
			"tilt-n-move-shaking": {
				"0%": { transform: `translate(0, 0) rotate(0deg);` },
				"25%": { transform: `translate(2px, 2px) rotate(2deg);` },
				"50%": { transform: `translate(0, 0) rotate(0deg);` },
				"75%": { transform: `translate(-2px, 2px) rotate(-2deg);` },
				"100%": { transform: `translate(0, 0) rotate(0deg);` },
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
		},
	},
	presets: [
		// presetAttributify(), // required when using attributify mode
		presetUno(), // required
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
				'p code': {
					"background-color": "#e4ecdb",
					padding: "3px 2px 3px 2px",
					color: "#182013",
					"border-radius": "4px",
					margin: "0px 2px 0px 2px",
					"vertical-align": "text-top",
				},
				a: {
					"text-decoration-color": "#6f9052",
				},
				h1: {
					margin: "1rem 0", // h1 is always at the top of the page, so only margin 1 * root font size
					"font-size": "1.65em",
				},
				h2: {
					margin: "1.75em 0 .5em",
					"font-size": "1.55em",
				},
				h3: {
					margin: "1.5em 0 .5em",
					"font-size": "1.375em",
				},
				h4: {
					margin: "1em 0",
					"font-size": "1.125em",
				},
			},
		}),
		presetWind(),
		presetRemToPx(),
		presetIcons()
	],
});
