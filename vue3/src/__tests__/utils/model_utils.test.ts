import {describe, it, expect} from 'vitest'
import {parseBooleanAnnotation} from '@/utils/model_utils'

// The backend annotates existence checks (shopping_status, has_inventory_status)
// via Exists() → CharField, which serializes to the strings "True"/"False".
// parseBooleanAnnotation normalizes those (and a native boolean) to a boolean.
describe('parseBooleanAnnotation', () => {
    it.each([true, 'True', 'true'])('treats %s as true', (v) => {
        expect(parseBooleanAnnotation(v)).toBe(true)
    })

    it.each([false, 'False', 'false', '', undefined, null, 0, 'anything'])('treats %s as false', (v) => {
        expect(parseBooleanAnnotation(v)).toBe(false)
    })
})
