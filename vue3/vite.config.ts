import {fileURLToPath, URL} from 'node:url'

import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
    base: '/static/vue3/',
    plugins: [
        vue({}),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        },
        extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue',],
    },
    clearScreen: false,
    build: {
        outDir: '../cookbook/static/vue3/',
        // generate manifest.json in outDir
        manifest: 'manifest.json',
        rollupOptions: {
            // overwrite default .html entry
            input: [
                'src/apps/tandoor/main.ts',
            ],
        },
    },
    server: {
        host: '0.0.0.0', // only needed to expose dev server to network bound IPs
        origin: 'http://localhost:5173',
    }
})
