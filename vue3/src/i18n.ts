import {nextTick} from 'vue'

import type {
    I18n,
    Locale,
} from 'vue-i18n'

import {createI18n} from "vue-i18n";
import en from "../../vue3/src/locales/en.json";
import {TANDOOR_PLUGINS} from "@/types/Plugins.ts";

/**
 * lazy loading of translation, resources:
 * https://vue-i18n.intlify.dev/guide/advanced/lazy.html
 * https://github.com/intlify/vue-i18n/blob/master/examples/lazy-loading/vite/src/i18n.ts
 */

/**
 * constant list of supported locales for app to check if requested locale is supported
 */
export const SUPPORT_LOCALES = getSupportedLocales()

export function setupI18n() {
    let locale = document.querySelector('html')!.getAttribute('lang')
    if (locale == null || !SUPPORT_LOCALES.includes(locale)) {
        console.warn('Falling back to locale en because ', locale, ' is not supported as a locale.')
        locale = 'en'
    }

    // load i18n as with locale en by default
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
    // load locale messages
    let messages = en
    if (locale != 'en') {
        messages = await import(`./locales/${locale}.json`).then((r: any) => r.default || r)
    }

    // remove empty strings
    Object.entries(messages).forEach(([key, value]) => {
        if (value === '') {
            delete messages[key]
        }
    })

    // set messages for locale
    i18n.global.setLocaleMessage(locale, messages)

    // async load and merge messages from plugins
    TANDOOR_PLUGINS.forEach(plugin => {
        let pluginLocales = getSupportedLocales(plugin.localeFiles)
        if (pluginLocales.includes(locale)) {
            import(`@/plugins/${plugin.basePath}/locales/${locale}.json`).then((r: any) => {
                let pluginMessages = r.default || r

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
 * loop trough translation files to determine for which locales a translation is available
 * @return string[] of supported locales
 * @param localeFiles module import of locale files to loop trough
 */
function getSupportedLocales(localeFiles = import.meta.glob('@/locales/*.json')) {
    let supportedLocales: string[] = []

    for (const path in localeFiles) {
        supportedLocales.push(path.split('/').slice(-1)[0].split('.')[0]);
    }
    return supportedLocales
}

/**
 * set the active locale (determining which messages to show) for Vue i18n
 * @param i18n instance of Vue i18n
 * @param locale string locale code to set (should be in SUPPORT_LOCALES)
 */
export function setLocale(i18n: I18n, locale: Locale): void {
    i18n.global.locale = locale
}