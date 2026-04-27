import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright smoke tests.
 *
 * Minimal critical-path coverage: login, search, click a recipe card,
 * verify navigation. Run against a live Django + Vite stack (the standard
 * dev environment on http://127.0.0.1:8000) — not mocked. Purpose is to
 * catch framework-level regressions (e.g. Vuetify 4 breaking router-link
 * clicks on recipe cards) that unit tests in jsdom don't reproduce.
 *
 * Run locally:
 *   cd vue3 && yarn test:smoke
 *
 * Requires the dev server at 127.0.0.1:8000 and user `claude`/`Tand00r1`
 * per .claude/data/dev-environment.md.
 */
export default defineConfig({
    testDir: './tests/smoke',
    timeout: 30_000,
    retries: 0,
    workers: 1,
    reporter: [['list']],
    use: {
        baseURL: 'http://127.0.0.1:8000',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        channel: 'chrome',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
})
