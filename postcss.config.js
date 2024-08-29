export default {
	plugins: {
		tailwindcss: {},
		autoprefixer: {},
		...(process.env.NODE_ENV === 'production' ? {
			cssnano: { preset: 'default' },
			// '@fullhuman/postcss-purgecss': {
			// 	content: [
			// 		'./src/**/*.{js,jsx,ts,tsx}',
			// 	],
			// }
		} : {})
	},
};
