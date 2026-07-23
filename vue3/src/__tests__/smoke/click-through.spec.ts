import { test, expect } from '@playwright/test'

/**
 * Framework-regression smoke. The scenario: user logs in, opens search,
 * clicks a recipe card, lands on the recipe view. This exercises
 * v-text-field, v-btn, form submit, v-img, router-link, v-navigation-drawer,
 * and the primary router-driven navigation path.
 *
 * Fails loudly when a framework-level change (Vuetify major, vue-router
 * major, etc.) silently breaks click event propagation or route
 * resolution — the exact class of regression that vitest + jsdom can't
 * reproduce.
 */
test('user can log in, browse search, and click a recipe card to open it', async ({ page }) => {
    await page.goto('/accounts/login/')

    await page.getByLabel('Username').fill('claude')
    await page.getByLabel('Password').fill('Tand00r1')
    await page.getByRole('button', { name: /sign in/i }).click()

    await expect(page).toHaveURL(/\/$/, { timeout: 10_000 })

    await page.goto('/advanced-search')
    await expect(page).toHaveURL(/\/advanced-search/)

    // Scope to main; the nav drawer has a /recipe/import link that is not a card.
    const firstRecipeLink = page
        .locator('main a[href^="/recipe/"]')
        .first()
    await expect(firstRecipeLink).toBeVisible({ timeout: 10_000 })

    const targetHref = await firstRecipeLink.getAttribute('href')
    expect(targetHref).toMatch(/^\/recipe\/\d+$/)

    await firstRecipeLink.click()

    // URL navigation alone isn't enough — the browser may follow an
    // <a href> natively even when Vue Router's handler doesn't fire,
    // and RecipeViewPage can mount into a broken state (skeleton
    // loaders forever) if upstream calls fail or the framework wiring
    // is subtly off. Assert the recipe view actually rendered.
    await expect(page).toHaveURL(new RegExp(`^http://127\\.0\\.0\\.1:8000${targetHref}`), {
        timeout: 5_000,
    })
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10_000 })
})
