import { test, expect, api } from './fixtures'

/**
 * UAT: User preference settings tests (CS-series).
 *
 * Each test:
 *   1. Navigates to the settings page
 *   2. Changes the setting via the actual UI control
 *   3. Verifies the API received the correct value (network interception)
 *   4. Reloads and verifies the DOM reflects the new value
 *   5. Restores original value
 */

test.describe('Cosmetic settings — /settings/cosmetic', () => {
    test.beforeEach(async ({ authedPage }) => {
        await authedPage.goto('/settings/cosmetic')
        await authedPage.waitForSelector('main', { timeout: 10_000 })
    })

    /**
     * CS-01/02: Theme toggle — TANDOOR (light) ↔ TANDOOR_DARK
     */
    test('CS-02: theme dark changes app to dark color scheme', async ({ authedPage }) => {
        const page = authedPage

        // Capture the PATCH request when theme changes
        const [patchReq] = await Promise.all([
            page.waitForRequest((req) => req.url().includes('/api/user-preference/') && req.method() === 'PATCH'),
            // Click the TANDOOR_DARK option in the Method select
            page.locator('.v-select').filter({ hasText: /Theme/ }).click().then(async () => {
                await page.getByRole('option', { name: /dark/i }).click()
            }),
        ])

        const body = JSON.parse(patchReq.postData() ?? '{}')
        expect(body.theme).toBe('TANDOOR_DARK')

        // Reload and verify dark theme applied
        await page.reload()
        await page.waitForSelector('.v-application')
        const appClass = await page.locator('.v-application').getAttribute('class')
        expect(appClass).toContain('dark')

        // Restore
        await api(page, '/api/user-preference/2/', {
            method: 'PATCH',
            body: JSON.stringify({ theme: 'TANDOOR' }),
        })
    })

    /**
     * CS-08: Show Logo toggle — logo appears/disappears in nav bar
     */
    test('CS-09: show logo OFF hides Tandoor logo from nav bar', async ({ authedPage }) => {
        const page = authedPage

        // Find the "Show Logo" switch and toggle it OFF
        const logoSwitch = page.locator('.v-switch').filter({ hasText: /Show Logo/i })
        const isOn = await logoSwitch.locator('input').isChecked()

        if (isOn) {
            const [patchReq] = await Promise.all([
                page.waitForRequest((req) => req.url().includes('/api/user-preference/') && req.method() === 'PATCH'),
                logoSwitch.locator('label').click(),
            ])
            const body = JSON.parse(patchReq.postData() ?? '{}')
            expect(body.nav_show_logo).toBe(false)
        }

        // Navigate home and verify logo is gone
        await page.goto('/')
        await page.waitForSelector('.v-app-bar')
        // Nav bar should not have the Tandoor logo link with visible width
        const logoLink = page.locator('.v-app-bar a').first()
        const logoWidth = await logoLink.evaluate((el) => el.getBoundingClientRect().width)
        expect(logoWidth).toBe(0)

        // Restore
        await api(page, '/api/user-preference/2/', {
            method: 'PATCH',
            body: JSON.stringify({ nav_show_logo: true }),
        })
    })

    /**
     * CS-13/14: Use Fractions toggle — amounts show as ¾ vs 0.75
     */
    test('CS-14: use fractions OFF shows decimal amounts on recipe page', async ({ authedPage }) => {
        const page = authedPage

        // Find and toggle Use Fractions OFF
        const fracSwitch = page.locator('.v-switch').filter({ hasText: /Use Fractions/i })
        const isOn = await fracSwitch.locator('input').isChecked()

        if (isOn) {
            const [patchReq] = await Promise.all([
                page.waitForRequest((req) => req.url().includes('/api/user-preference/') && req.method() === 'PATCH'),
                fracSwitch.locator('label').click(),
            ])
            const body = JSON.parse(patchReq.postData() ?? '{}')
            expect(body.use_fractions).toBe(false)
        }

        // Navigate to recipe 4 and verify decimal amounts
        await page.goto('/recipe/4')
        await page.waitForSelector('main', { timeout: 10_000 })
        const bodyText = await page.locator('main').textContent()
        expect(bodyText).toContain('0.75')
        expect(bodyText).not.toContain('3⁄4')

        // Restore
        await api(page, '/api/user-preference/2/', {
            method: 'PATCH',
            body: JSON.stringify({ use_fractions: true }),
        })
    })
})

test.describe('Search settings — /settings/search', () => {
    test.beforeEach(async ({ authedPage }) => {
        await authedPage.goto('/settings/search')
        await authedPage.waitForSelector('main', { timeout: 10_000 })
    })

    /**
     * SS-03: Phrase search method
     */
    test('SS-03: phrase search method returns fewer results for exact phrase', async ({ authedPage }) => {
        const page = authedPage

        // Get baseline count with simple search
        const baselineResp = await api(page, '/api/recipe/?query=chicken&page_size=1')
        const baseline = baselineResp.body.count

        // Change method to Phrase via the Method select
        const methodSelect = page.locator('.v-select').filter({ hasText: /Method|Simple/i }).first()
        const [patchReq] = await Promise.all([
            page.waitForRequest((req) =>
                req.url().includes('/api/search-preference/') && req.method() === 'PATCH',
            ),
            methodSelect.click().then(() => page.getByRole('option', { name: /phrase/i }).click()),
        ])
        const body = JSON.parse(patchReq.postData() ?? '{}')
        expect(body.search).toBe('phrase')

        // With phrase mode, "chicken breast" should return fewer results than "chicken"
        const phraseResp = await api(page, '/api/recipe/?query=chicken+breast&page_size=1')
        expect(phraseResp.body.count).toBeLessThan(baseline)

        // Restore
        await api(page, '/api/search-preference/2/', {
            method: 'PATCH',
            body: JSON.stringify({ search: 'plain' }),
        })
    })
})
