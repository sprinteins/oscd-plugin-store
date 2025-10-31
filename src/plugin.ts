import * as pkg from '../package.json'

import Plugin from './plugin.svelte'
import type { Component } from 'svelte'

import { mount } from "svelte";

export default (Plugin as Component).element

// export default class NewPlugin extends HTMLElement {
// 	private plugin!: Plugin

// 	connectedCallback() {
// 		this.attachShadow({ mode: 'open' })
// 		if (!this.shadowRoot) return;
		
// 		this.plugin = mount(Plugin, {
// 			target: this.shadowRoot
// 		})

// 		const style = document.createElement('style')
// 		style.innerHTML = (globalThis as any).pluginStyle[pkg.name]
// 		this.shadowRoot.appendChild(style)
// 	}

// 	public run() {
// 		return this.plugin.run()
// 	}
// }
