import { test as base, Page, expect } from '@playwright/test'

// Shared auth state — logs in once per worker
export const test = base.extend<{ authedPage: Page }>({
    authedPage: async ({ page }, use) => {
        await page.goto('/accounts/login/')
        await page.getByLabel('Username').fill('claude')
        await page.getByLabel('Password').fill('Tand00r1')
        await page.getByRole('button', { name: /sign in/i }).click()
        await expect(page).toHaveURL(/\/$/, { timeout: 10_000 })
        await use(page)
    },
})

export { expect }

// API helper that reuses the browser's session cookie
export async function api(page: Page, path: string, opts: RequestInit = {}) {
    const resp = await page.evaluate(
        async ({ path, opts }) => {
            const csrf = document.cookie
                .split(';')
                .map((c) => c.trim())
                .find((c) => c.startsWith('csrftoken='))
                ?.split('=')[1]
            const r = await fetch(path, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrf ?? '',
                    ...((opts as any).headers ?? {}),
                },
                ...opts,
            })
            const body = r.headers.get('content-type')?.includes('json') ? await r.json() : null
            return { status: r.status, body }
        },
        { path, opts },
    )
    return resp
}
