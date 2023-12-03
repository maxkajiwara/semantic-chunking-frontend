/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').options} */
const config = {
	plugins: ['prettier-plugin-tailwindcss'],
	printWidth: 100,
	semi: false,
	singleQuote: true,
	tabWidth: 2,
	trailingComma: 'es5',
	useTabs: true,
	jsxSingleQuote: true,
	bracketSpacing: true,
	arrowParens: 'always',
}

export default config
