import fs from 'node:fs/promises'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		svelte(),
		cssInjectedByJsPlugin({
			styleId: process.env.npm_package_name,
			injectCodeFunction: function injectCodeCustomRunTimeFunction(
				cssCode: string,
				// biome-ignore lint/suspicious/noExplicitAny: There is no type export for InjectCodeOptions
				options: any
			) {
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				const globalWithPluginStyle = globalThis as any
				if (!globalWithPluginStyle.pluginStyle) {
					globalWithPluginStyle.pluginStyle = {}
				}
				globalWithPluginStyle.pluginStyle[options.styleId] = cssCode
			}
		}),
		{
			name: 'index-html-config',
			async transformIndexHtml() {
				if (process.env.VITE_EXTERNAL_PLUGINS !== 'true') {
					return await fs.readFile('index-restricted.html', 'utf-8')
				}
			}
		}
	],
	server: {
		port: 54187
	},
	preview: {
		port: 54187,
		cors: true
	},
	build: {
		lib: {
			entry: 'src/plugin.ts',
			fileName:
				process.env.VITE_EXTERNAL_PLUGINS === 'true'
					? 'index'
					: 'index-restricted',
			formats: ['es']
		}
	}
})
