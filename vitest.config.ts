// @ts-ignore
import {defineConfig} from 'vitest/config';
import {readFileSync} from 'fs';

const {version} = JSON.parse(readFileSync('./package.json', 'utf8'));

export default defineConfig({
	define: {__BLOOMSIGHT_VERSION__: JSON.stringify(version)},
	test: {
		browser: {
			enabled: true,
			name: 'chrome',
			headless: true
		}
	},
})
