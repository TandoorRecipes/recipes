import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

// D170: SpaceSetupPage.vue was an empty stub on a route nothing linked to —
// the real space-setup flow is WelcomePage (Tandoor.vue redirects there when
// space_setup_completed is false). Guard that the dead route and its empty
// page stay removed.
describe('D170 — dead /space-setup route is removed', () => {
    const main = readFileSync(resolve(__dirname, '../../apps/tandoor/main.ts'), 'utf-8')

    it('does not register the /space-setup route', () => {
        expect(main).not.toContain('space-setup')
        expect(main).not.toContain('SpaceSetupPage')
    })

    it('the empty SpaceSetupPage stub no longer exists', () => {
        expect(existsSync(resolve(__dirname, '../../pages/SpaceSetupPage.vue'))).toBe(false)
    })
})
