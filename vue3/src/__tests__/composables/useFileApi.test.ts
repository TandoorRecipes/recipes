import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useFileApi } from '@/composables/useFileApi'
import { makeUserFile } from '@/__tests__/factories'

// Mock cookie to return a CSRF token
vi.mock('@/utils/cookie', () => ({
    getCookie: () => 'test-csrf-token',
}))

describe('useFileApi', () => {
    beforeEach(() => {
        // Set base URI for useDjangoUrls
        const base = document.createElement('base')
        base.href = 'http://localhost:8000/'
        document.head.appendChild(base)

        vi.clearAllMocks()
    })

    describe('createOrUpdateUserFile', () => {
        it('sends POST for new file and returns UserFile', async () => {
            const mockUserFile = makeUserFile({ id: 5, name: 'photo.jpg' })
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({
                    id: 5,
                    name: 'photo.jpg',
                    file: '/media/photo.jpg',
                    file_download: '/media/photo.jpg',
                    preview: '/media/photo_preview.jpg',
                    file_size_kb: 200,
                    created_by: { id: 1, username: 'testuser', first_name: '', last_name: '', display_name: 'testuser' },
                    created_at: '2026-01-01T00:00:00Z',
                }),
            })

            const { createOrUpdateUserFile, fileApiLoading } = useFileApi()
            const file = new File(['content'], 'photo.jpg')

            const result = await createOrUpdateUserFile('photo.jpg', file)

            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('api/user-file/'),
                expect.objectContaining({ method: 'POST' }),
            )
            expect(result.name).toBe('photo.jpg')
            expect(fileApiLoading.value).toBe(false)
        })

        it('sends PUT when id is provided', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({
                    id: 3,
                    name: 'updated.jpg',
                    file_download: '',
                    preview: '',
                    file_size_kb: 100,
                    created_by: { id: 1, username: 'testuser', display_name: 'testuser' },
                    created_at: '2026-01-01T00:00:00Z',
                }),
            })

            const { createOrUpdateUserFile } = useFileApi()
            await createOrUpdateUserFile('updated.jpg', null, 3)

            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('api/user-file/3/'),
                expect.objectContaining({ method: 'PUT' }),
            )
        })

        it('sets fileApiLoading during request', async () => {
            let resolveRequest: Function
            global.fetch = vi.fn().mockReturnValue(
                new Promise(resolve => { resolveRequest = resolve })
            )

            const { createOrUpdateUserFile, fileApiLoading } = useFileApi()
            const promise = createOrUpdateUserFile('test.jpg', null)

            expect(fileApiLoading.value).toBe(true)

            resolveRequest!({
                ok: true,
                json: () => Promise.resolve({
                    id: 1, name: 'test.jpg', file_download: '', preview: '',
                    file_size_kb: 0, created_by: { id: 1, username: 'test', display_name: 'test' },
                    created_at: '2026-01-01T00:00:00Z',
                }),
            })

            await promise
            expect(fileApiLoading.value).toBe(false)
        })
    })
})
