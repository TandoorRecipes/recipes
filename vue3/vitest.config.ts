import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    plugins: [
        vue(),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./vitest.setup.ts'],
        include: ['src/**/__tests__/**/*.{test,spec}.ts'],
        exclude: ['node_modules', 'dist'],
        // Use child-process pool instead of worker_threads to avoid the
        // "Closing rpc while onUserConsoleLog was pending" teardown race
        // that floods the workers with Vue resolve-component warnings under
        // CI load. Forks have isolated stdio so the race doesn't surface.
        pool: 'forks',
        server: {
            deps: {
                inline: ['vuetify'],
            },
        },
        coverage: {
            exclude: [
                'src/openapi/**',
                'src/__tests__/**',
                'node_modules/**',
            ],
        },
    },
})
