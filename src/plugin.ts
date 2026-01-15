import * as pkg from '../package.json'

import { mount } from 'svelte'
import Plugin from './plugin.svelte'

export default class NewPlugin extends HTMLElement {
	private plugin!: Plugin

	connectedCallback() {
		this.attachShadow({ mode: 'open' })
		if (!this.shadowRoot) return

		this.plugin = mount(Plugin, {
			target: this.shadowRoot
		})

		const style = document.createElement('style')
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		style.innerHTML = (globalThis as any).pluginStyle[pkg.name]
		this.shadowRoot.appendChild(style)
	}

	public run() {
		return this.plugin.run()
	}
}
