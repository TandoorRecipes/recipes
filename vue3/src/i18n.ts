import {nextTick, isRef} from 'vue'

import type {
    I18n,
    Locale,
    VueI18n,
    Composer,
    I18nMode
} from 'vue-i18n'
import de from "../../vue/src/locales/de.json";
import {createI18n} from "vue-i18n";
import en from "../../vue/src/locales/en.json";

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
        legacy: false,
        locale: 'en',
        fallbackLocale: 'en',
        messages: {
            en
        }
    }) as I18n

    // async load user locale into existing i18n instance
    loadLocaleMessages(i18n, locale).then(r => {})

    return i18n
}


/**
 * load specified locale messages from server and set the locale as active
 * @param i18n instance of Vue i18n
 * @param locale string locale code to set (should be in SUPPORT_LOCALES)
 */
export async function loadLocaleMessages(i18n: I18n, locale: Locale) {
    // load locale messages
    const messages = await import(`./locales/${locale}.json`).then(
        getResourceMessages
    )

    // set messages for locale
    i18n.global.setLocaleMessage(locale, messages)
    // switch to given locale
    setLocale(i18n, locale)

    console.log('loaded user locale')

    return nextTick()
}


/**
 * loop trough translation files to determine for which locales a translation is available
 * @return string[] of supported locales
 */
function getSupportedLocales() {
    let supportedLocales: string[] = []
    let localeFiles = import.meta.glob('@/locales/*.json');
    for (const path in localeFiles) {
        supportedLocales.push(path.split('/').slice(-1)[0].split('.')[0]);
    }
    return supportedLocales
}

/**
 * determines something about the way Vue i18n is installed/setup?
 * @param instance
 * @param mode
 */
function isComposer(instance: VueI18n | Composer, mode: I18nMode): instance is Composer {
    return mode === 'composition' && isRef(instance.locale)
}

/**
 * get the currently active locale of Vue i18n
 * @param i18n instance of Vue i18n
 */
export function getLocale(i18n: I18n): string {
    if (isComposer(i18n.global, i18n.mode)) {
        return i18n.global.locale.value
    } else {
        return i18n.global.locale
    }
}

/**
 * set the active locale (determining which messages to show) for Vue i18n
 * @param i18n instance of Vue i18n
 * @param locale string locale code to set (should be in SUPPORT_LOCALES)
 */
export function setLocale(i18n: I18n, locale: Locale): void {
    if (isComposer(i18n.global, i18n.mode)) {
        i18n.global.locale.value = locale
    } else {
        i18n.global.locale = locale
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getResourceMessages = (r: any) => r.default || r