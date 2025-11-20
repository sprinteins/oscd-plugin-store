import { render, screen } from '@testing-library/svelte'
import { fireEvent } from '@testing-library/svelte'
import { describe, expect, it, vi } from 'vitest'
import { Checkbox } from '.'

describe('Checkbox', () => {
	it('renders', () => {
		const label = 'checking'
		const handleChange = vi.fn()

		const container = render(Checkbox, { label })
		container.component.$on('change', handleChange)

		const stuff = screen.getByText(label)
		expect(stuff).toBeTruthy()
		fireEvent.click(stuff)
		expect(handleChange).toHaveBeenCalled()
	})
})
