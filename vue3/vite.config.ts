import {fileURLToPath, pathToFileURL, URL} from 'node:url'

import {readdirSync} from "fs"
import {resolve, join} from "path"
import 'esbuild-register/dist/node'

import {defineConfig} from 'vite'
import type {Plugin} from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify, {transformAssetUrls} from 'vite-plugin-vuetify'
import {VitePWA} from "vite-plugin-pwa";
import {PluginModule} from "./src/types/Plugins";
import {readFileSync, existsSync} from "node:fs";

// https://vitejs.dev/config/
export default defineConfig(async ({command, mode, isSsrBuild, isPreview}) => {
    const buildInputs = await collectBuildInputs()

    return {
        base: mode == 'development' ? '/static/vue3/' : './',
        plugins: [
            localeCoveragePlugin(),
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
 * Minimum translation coverage (%) for a locale to appear in the language picker.
 * Locales below this threshold silently fall back to English.
 */
const LOCALE_MIN_COVERAGE = 25

/**
 * Vite plugin that computes translation coverage at build time and exposes
 * locale coverage data as `virtual:locale-coverage`.
 * Exports: { coverage: Record<filename, {fe, be}>, qualified: Set<filename>, minCoverage: number }
 */
function localeCoveragePlugin(): Plugin {
    const virtualModuleId = 'virtual:locale-coverage'
    const resolvedId = '\0' + virtualModuleId

    return {
        name: 'locale-coverage',
        resolveId(id) {
            if (id === virtualModuleId) return resolvedId
        },
        load(id) {
            if (id !== resolvedId) return

            // Frontend coverage: count non-empty keys vs en.json
            const localesDir = resolve(__dirname, 'src/locales')
            const en = JSON.parse(readFileSync(join(localesDir, 'en.json'), 'utf-8'))
            const totalKeys = Object.keys(en).length

            const coverage: Record<string, {fe: number, be: number}> = {}
            const qualified: string[] = []

            for (const file of readdirSync(localesDir)) {
                if (!file.endsWith('.json') || file === 'en.json') continue
                const data = JSON.parse(readFileSync(join(localesDir, file), 'utf-8'))
                const fe = Math.round(Object.values(data).filter(v => v !== '').length / totalKeys * 100)
                const filename = file.replace('.json', '')
                coverage[filename] = {fe, be: 0}
                if (fe >= LOCALE_MIN_COVERAGE) {
                    qualified.push(filename)
                }
            }

            // Backend coverage: count translated msgstr in .po files (referenced strings only)
            // Must match DIR_CODE_MAP from settings.py for Weblate/Django mismatches
            const beDirMap: Record<string, string> = {
                'hu_HU': 'hu',
                'zh_CN': 'zh_Hans',
            }
            const beLocaleDir = resolve(__dirname, '..', 'cookbook', 'locale')
            if (existsSync(beLocaleDir)) {
                for (const entry of readdirSync(beLocaleDir)) {
                    if (entry === 'en') continue  // skip source language
                    const poPath = join(beLocaleDir, entry, 'LC_MESSAGES', 'django.po')
                    if (!existsSync(poPath)) continue
                    const content = readFileSync(poPath, 'utf-8')

                    // Count referenced msgid/msgstr pairs (skip header and orphaned strings)
                    // Handles both single-line (msgstr "text") and multi-line (msgstr ""\n"text") formats
                    const blocks = content.split(/\n\n+/)
                    let referenced = 0, translated = 0
                    for (const block of blocks) {
                        if (block.includes('msgid ""') && block.includes('Project-Id')) continue
                        if (!(/^msgid ".+"/m).test(block)) continue
                        if (!(/#: /).test(block)) continue // skip orphaned (no source reference)
                        referenced++
                        // Extract all msgstr content: concatenate quoted strings after msgstr
                        const msgstrMatch = block.match(/^msgstr\s+"(.*)"([\s\S]*?)(?=\n\n|\n#|$)/m)
                        if (msgstrMatch) {
                            const firstLine = msgstrMatch[1]
                            const continuation = msgstrMatch[2] || ''
                            const extraLines = continuation.match(/^"(.+)"/gm) || []
                            const fullStr = firstLine + extraLines.map(l => l.slice(1, -1)).join('')
                            if (fullStr.length > 0) translated++
                        }
                    }
                    const be = referenced > 0 ? Math.round(translated / referenced * 100) : 0

                    // Map BE directory to FE filename (handles hu_HU→hu, zh_CN→zh_Hans)
                    const feKey = beDirMap[entry] || entry
                    if (coverage[feKey]) {
                        coverage[feKey].be = be
                    } else {
                        // Try case-insensitive match
                        const dirCode = feKey.replaceAll('_', '-').toLowerCase()
                        const feMatch = Object.keys(coverage).find(k =>
                            k.replaceAll('_', '-').toLowerCase() === dirCode
                        )
                        if (feMatch) {
                            coverage[feMatch].be = be
                        } else {
                            // BE-only locale (no FE file)
                            coverage[entry] = {fe: 0, be}
                        }
                    }
                }
            }

            return [
                `export const coverage = ${JSON.stringify(coverage)};`,
                `export const qualified = new Set(${JSON.stringify(qualified)});`,
                `export const minCoverage = ${LOCALE_MIN_COVERAGE};`,
            ].join('\n')
        }
    }
}

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


