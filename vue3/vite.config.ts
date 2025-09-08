import {fileURLToPath, pathToFileURL, URL} from 'node:url'

import {readdirSync} from "fs"
import {resolve, join} from "path"
import 'esbuild-register/dist/node'

import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify, {transformAssetUrls} from 'vite-plugin-vuetify'
import {VitePWA} from "vite-plugin-pwa";
import {PluginModule} from "./src/types/Plugins";
import {readFileSync} from "node:fs";

// https://vitejs.dev/config/
export default defineConfig(async ({command, mode, isSsrBuild, isPreview}) => {
    const buildInputs = await collectBuildInputs()

    return {
        base: mode == 'development' ? '/static/vue3/' : './',
        plugins: [
            vue({
                template: {transformAssetUrls}
            }),
            vuetify({
                autoImport: true,
            }),
            VitePWA({
                //registerType: 'autoUpdate',
                strategies: 'injectManifest',
                srcDir: 'src',
                filename: 'service-worker.ts',
            })
        ],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
                vue: fileURLToPath(new URL("./node_modules/vue/dist/vue.esm-bundler.js", import.meta.url)),
            },
            extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue',],
            preserveSymlinks: true
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
                ].concat(buildInputs),
            },
        },
        server: {
            host: '0.0.0.0', // only needed to expose dev server to network bound IPs
            origin: 'http://localhost:5173',
        }
    }
})

/**
 * function to load plugin configs and find additional build inputs
 */
async function collectBuildInputs() {
    try {
        const pluginsDir = resolve(__dirname, "src/plugins")
        const buildInputs: string[] = []

        for (const dir of readdirSync(pluginsDir, {withFileTypes: true})) {
            if (!dir.isDirectory() && !dir.isSymbolicLink()) continue

            const pluginPath = join(pluginsDir, dir.name, "plugin.ts")
            try {
                const code = readFileSync(pluginPath, "utf-8")
                // Regex to capture buildInputs: [ ... ]
                const match = code.match(/buildInputs\s*:\s*(\[[^\]]*\])/s)
                if (match) {
                    const arr = [eval][0](match[1]) as string[]
                    buildInputs.push(...arr)
                }
            } catch (err) {
                console.warn(`Failed to parse plugin at ${pluginPath}:`, err)
            }
        }

        console.log('Tandoor Plugin build inputs: ', buildInputs)
        return buildInputs
    } catch (err) {
        return []
    }
}


