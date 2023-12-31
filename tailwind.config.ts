import { type Config } from 'tailwindcss'

export default {
	content: ['./src/**/*.tsx'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['var(--font-inter)'],
				mono: ['var(--font-roboto-mono)'],
			},
		},
	},
	plugins: [require('@tailwindcss/forms')],
} satisfies Config
