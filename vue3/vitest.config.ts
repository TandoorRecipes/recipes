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
