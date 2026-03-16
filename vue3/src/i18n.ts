import type {
    I18n,
    Locale,
} from 'vue-i18n'

import {createI18n} from "vue-i18n";
import en from "@/locales/en.json";
import {TANDOOR_PLUGINS} from "@/types/Plugins.ts";
import qualifiedLocales from 'virtual:locale-coverage'

/**
 * lazy loading of translation, resources:
 * https://vue-i18n.intlify.dev/guide/advanced/lazy.html
 * https://github.com/intlify/vue-i18n/blob/master/examples/lazy-loading/vite/src/i18n.ts
 */

/**
 * Build a map from lowercase Django locale codes to the actual filename stems.
 * e.g. 'nb-no' → 'nb_NO', 'zh-hans' → 'zh_Hans', 'en' → 'en'
 * When checkCoverage is true (default for main app), locales below the
 * coverage threshold (set in vite.config.ts) are excluded.
 * Plugin locales skip coverage checks since they have independent translations.
 */
function buildLocaleMap(localeFiles = import.meta.glob('@/locales/*.json'), checkCoverage = true): Map<string, string> {
    const map = new Map<string, string>()
    for (const path in localeFiles) {
        const filename = path.split('/').slice(-1)[0].split('.')[0]
        if (checkCoverage && filename !== 'en' && !qualifiedLocales.has(filename)) {
            continue
        }
        const djangoCode = filename.replaceAll('_', '-').toLowerCase()
        map.set(djangoCode, filename)
    }
    return map
}

const LOCALE_MAP = buildLocaleMap()
export const SUPPORT_LOCALES = Array.from(LOCALE_MAP.keys())

// Django locale codes that map to different frontend locale codes
// (Weblate directory name differs from frontend filename)
const LOCALE_ALIASES: Record<string, string> = {
    'zh-cn': 'zh-hans',
}

/**
 * Resolve a Django/browser locale code to a supported locale key.
 * Fallback chain: exact → alias → prefix → base language.
 */
export function resolveLocale(code: string): string | null {
    const lc = code.toLowerCase()
    if (LOCALE_MAP.has(lc)) return lc                                    // exact: 'nb-no' → 'nb-no'
    const alias = LOCALE_ALIASES[lc]
    if (alias && LOCALE_MAP.has(alias)) return alias                     // alias: 'zh-cn' → 'zh-hans'
    const prefix = SUPPORT_LOCALES.find(l => l.startsWith(lc + '-'))
    if (prefix) return prefix                                            // prefix: 'nb' → 'nb-no'
    const base = lc.split('-')[0]
    if (LOCALE_MAP.has(base)) return base                                // base: 'hu-hu' → 'hu'
    return null
}

export function setupI18n() {
    const htmlLang = document.querySelector('html')!.getAttribute('lang')
    let locale = htmlLang ? resolveLocale(htmlLang) : null
    if (!locale) {
        if (htmlLang && htmlLang !== 'en') {
            console.warn('Falling back to locale en because', htmlLang, 'is not supported.')
        }
        locale = 'en'
    }

    // load i18n with locale en by default (Legacy mode — locale is a plain string, not a Ref)
    const i18n = createI18n({
        locale: 'en',
        fallbackLocale: 'en',
        messages: {
            en,
        },
    }) as I18n

    // async load plugin default locales
    TANDOOR_PLUGINS.forEach(plugin => {
        plugin.defaultLocale.then(pluginMessages => {
            i18n.global.mergeLocaleMessage('en', pluginMessages)
        })
    })

    // async load user locale into existing i18n instance
    loadLocaleMessages(i18n, locale).then()

    return i18n
}

/**
 * load specified locale messages from server and set the locale as active
 * @param i18n instance of Vue i18n
 * @param locale string locale code to set (should be in SUPPORT_LOCALES)
 */
export async function loadLocaleMessages(i18n: I18n, locale: Locale) {
    // load locale messages, clone to avoid mutating the imported module object
    let messages = {...en}
    if (locale != 'en') {
        const filename = LOCALE_MAP.get(locale) || locale
        const mod = await import(`./locales/${filename}.json`).then((r: any) => r.default || r)
        messages = {...mod}
    }

    // remove empty strings
    Object.entries(messages).forEach(([key, value]) => {
        if (value === '') {
            delete messages[key]
        }
    })

    // set messages for locale
    i18n.global.setLocaleMessage(locale, messages)

    // async load and merge messages from plugins (skip coverage — plugin translations are independent)
    TANDOOR_PLUGINS.forEach(plugin => {
        const pluginLocaleMap = buildLocaleMap(plugin.localeFiles, false)
        const pluginFilename = pluginLocaleMap.get(locale)
        if (pluginFilename) {
            import(`@/plugins/${plugin.basePath}/locales/${pluginFilename}.json`).then((r: any) => {
                const pluginMessages = {...(r.default || r)}

                // remove empty strings
                Object.entries(pluginMessages).forEach(([key, value]) => {
                    if (value === '') {
                        delete pluginMessages[key]
                    }
                })

                i18n.global.mergeLocaleMessage(locale, pluginMessages)
            })
        }
    })

    // switch to given locale
    setLocale(i18n, locale)
}

/**
 * set the active locale (determining which messages to show) for Vue i18n
 * @param i18n instance of Vue i18n
 * @param locale string locale code to set (should be in SUPPORT_LOCALES)
 */
export function setLocale(i18n: I18n, locale: Locale): void {
    i18n.global.locale = locale
}
