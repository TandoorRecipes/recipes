import { test, expect } from './fixtures'

/**
 * UAT: Structural / visual tests (Pass B overflow, Pass C components).
 *
 * These catch layout regressions that unit tests and API tests miss:
 * - Horizontal overflow at mobile/tablet/desktop viewports
 * - Touch target sizes
 * - Context menu availability and behavior
 */

const VIEWPORTS = [
    { name: '390px (mobile)', width: 390, height: 844 },
    { name: '768px (tablet)', width: 768, height: 1024 },
    { name: '1366px (desktop)', width: 1366, height: 768 },
]

/** Check for horizontal overflow using the same JS as the audit */
async function checkOverflow(page: any) {
    return page.evaluate(() => {
        const vw = window.innerWidth
        const offenders = [...document.querySelectorAll('*')].filter((el) => {
            const r = el.getBoundingClientRect()
            if (r.right <= vw + 4 || r.width === 0) return false
            if (el.closest('.v-navigation-drawer') && !el.closest('.v-navigation-drawer--active')) return false
            if (el.closest('.v-overlay') && !el.closest('.v-overlay--active')) return false
            return true
        })
        return {
            scrollWidth: document.body.scrollWidth,
            vw,
            hasOverflow: document.body.scrollWidth > vw,
            offenders: offenders
                .slice(0, 5)
                .map((e) => ({
                    tag: e.tagName,
                    text: e.textContent?.trim().slice(0, 40),
                    right: Math.round(e.getBoundingClientRect().right),
                })),
        }
    })
}

test.describe('Pass B — viewport overflow', () => {
    for (const vp of VIEWPORTS) {
        test.describe(`${vp.name}`, () => {
            test.use({ viewport: { width: vp.width, height: vp.height } })

            test(`home page / has no horizontal overflow at ${vp.name}`, async ({ authedPage }) => {
                await authedPage.goto('/')
                await authedPage.waitForSelector('main', { timeout: 10_000 })
                const { hasOverflow, offenders } = await checkOverflow(authedPage)
                expect(hasOverflow, `Overflow at ${vp.name}: ${JSON.stringify(offenders)}`).toBe(false)
            })

            test(`/recipe/4 has no horizontal overflow at ${vp.name}`, async ({ authedPage }) => {
                await authedPage.goto('/recipe/4')
                await authedPage.waitForSelector('main h1, main h2', { timeout: 10_000 })
                const result = await checkOverflow(authedPage)
                // Known issue: URL link overflows. Assert on page-level scroll, not individual elements.
                const pageScrolls = await authedPage.evaluate(
                    () => document.body.scrollWidth > window.innerWidth,
                )
                expect(pageScrolls, `Page scrolls horizontally at ${vp.name}`).toBe(false)
            })

            test(`/book/2 has no horizontal overflow at ${vp.name}`, async ({ authedPage }) => {
                await authedPage.goto('/book/2')
                await authedPage.waitForSelector('main', { timeout: 10_000 })
                const { hasOverflow, offenders } = await checkOverflow(authedPage)
                expect(hasOverflow, `Overflow at ${vp.name}: ${JSON.stringify(offenders)}`).toBe(false)
            })
        })
    }
})

test.describe('Pass C — RecipeContextMenu', () => {
    test.use({ viewport: { width: 1366, height: 768 } })

    test.beforeEach(async ({ authedPage }) => {
        // Close any open overlays from prior test
        await authedPage.keyboard.press('Escape').catch(() => {})
        await authedPage.goto('/advanced-search')
        // Wait for recipe cards — grid loads after API call completes
        await authedPage.waitForSelector('main a[href^="/recipe/"]', { timeout: 30_000 })
    })

    /** Click the first 3-dot button on a recipe card (below the filter toolbar). */
    async function clickCardDotButton(page: any) {
        // Recipe card buttons are positioned below the filter toolbar (top > 130px).
        // Using evaluate to find and click the first one, since Playwright doesn't
        // support position-based filtering in locators.
        const clicked = await page.evaluate(() => {
            const main = document.querySelector('main')
            const btn = [...(main?.querySelectorAll('button') ?? [])].find((b) => {
                const r = b.getBoundingClientRect()
                return r.top > 130 && r.width > 0 && r.height > 0
            })
            if (btn) { btn.click(); return true }
            return false
        })
        if (!clicked) throw new Error('No recipe card button found below filter toolbar')
    }

    test('context menu opens on recipe card', async ({ authedPage }) => {
        const page = authedPage

        await clickCardDotButton(page)

        // Context menu should appear with items
        await expect(page.locator('.v-overlay--active .v-list-item').first()).toBeVisible({ timeout: 3_000 })
    })

    test('context menu items are at least 44px tall (touch target)', async ({ authedPage }) => {
        const page = authedPage

        await clickCardDotButton(page)
        await page.locator('.v-overlay--active .v-list-item').first().waitFor()

        const heights = await page.evaluate(() =>
            [...document.querySelectorAll('.v-overlay--active .v-list-item')].map((li) =>
                Math.round(li.getBoundingClientRect().height),
            ),
        )

        expect(heights.length).toBeGreaterThan(0)
        for (const h of heights) {
            expect(h, `Menu item height ${h}px < 44px minimum`).toBeGreaterThanOrEqual(44)
        }
    })

    test('Escape closes context menu', async ({ authedPage }) => {
        const page = authedPage

        await clickCardDotButton(page)
        await page.locator('.v-overlay--active .v-list-item').first().waitFor()

        await page.keyboard.press('Escape')
        await expect(page.locator('.v-overlay--active')).toHaveCount(0, { timeout: 2_000 })
    })

    test('Display Settings item opens card display drawer', async ({ authedPage }) => {
        const page = authedPage

        await clickCardDotButton(page)
        await page.locator('.v-overlay--active .v-list-item').filter({ hasText: 'Display Settings' }).click()

        // Card display drawer should open
        await expect(
            page.locator('.v-navigation-drawer--active').filter({ hasText: 'Card display' }),
        ).toBeVisible({ timeout: 3_000 })

        // Close
        await page.keyboard.press('Escape')
    })
})

test.describe('Pass C — ModelEditorBase Save & Close', () => {
    test.use({ viewport: { width: 1366, height: 768 } })

    test('Save & Close fires PATCH before navigating away from food editor', async ({ authedPage }) => {
        const page = authedPage

        await page.goto('/edit/Food/61')
        await page.waitForSelector('main input[type=text]', { timeout: 10_000 })

        // Make a trivial change
        const nameInput = page.locator('main input[type=text]').first()
        await nameInput.fill('7-Up test')

        // Intercept network — expect PATCH to fire before navigation
        const [patchReq] = await Promise.all([
            page.waitForRequest(
                (req) => req.url().includes('/api/food/') && req.method() === 'PATCH',
                { timeout: 5_000 },
            ).catch(() => null),
            page.locator('button', { hasText: 'Save & Close' }).click(),
        ])

        // PATCH should have fired
        expect(patchReq, 'Save & Close must send PATCH before navigating').not.toBeNull()

        // Restore
        if (patchReq) {
            // Navigate completed; restore via API
            await page.evaluate(async () => {
                const csrf = document.cookie
                    .split(';')
                    .map((c) => c.trim())
                    .find((c) => c.startsWith('csrftoken='))
                    ?.split('=')[1]
                await fetch('/api/food/61/', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrf ?? '' },
                    body: JSON.stringify({ name: '7-Up' }),
                    credentials: 'include',
                })
            })
        }
    })
})
