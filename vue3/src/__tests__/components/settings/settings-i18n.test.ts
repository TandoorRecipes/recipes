import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import en from '@/locales/en.json'

// D168/D169: the meal-plan and shopping settings rendered a Household help alert
// with $t('HouseholdSettingsHelp'), a key that doesn't exist in en.json, so the
// raw key leaked into the UI. Guard that these components reference only keys
// that resolve, so an i18n leak can't silently reappear.
const COMPONENTS = ['MealPlanSettings.vue', 'ShoppingSettings.vue']
const enKeys = en as Record<string, unknown>

describe('settings i18n — help-alert keys resolve', () => {
    it.each(COMPONENTS)('%s references only existing en locale keys', (file) => {
        const src = readFileSync(resolve(__dirname, `../../../components/settings/${file}`), 'utf-8')
        const keys = [...src.matchAll(/\$t\(['"]([^'"]+)['"]\)/g)].map(m => m[1])
        const missing = keys.filter(k => !(k in enKeys))
        expect(missing, `missing en keys in ${file}: ${missing.join(', ')}`).toEqual([])
    })
})
