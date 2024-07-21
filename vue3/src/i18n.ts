import {nextTick, isRef} from 'vue'
import {createI18n} from 'vue-i18n'

import type {
    I18n,
    I18nOptions,
    Locale,
    VueI18n,
    Composer,
    I18nMode
} from 'vue-i18n'

/**
 * lazy loading of translation, resources:
 * https://vue-i18n.intlify.dev/guide/advanced/lazy.html
 * https://github.com/intlify/vue-i18n/blob/master/examples/lazy-loading/vite/src/i18n.ts
 */

// TODO not sure why/if this is needed, comment out for now and see if anything breaks
export const SUPPORT_LOCALES = getSupportedLocales()

function getSupportedLocales() {
    let supportedLocales: string[] = []
    let localeFiles = import.meta.glob('@/locales/*.json');
    for (const path in localeFiles) {
        supportedLocales.push(path.split('/').slice(-1)[0].split('.')[0]);
    }
    return supportedLocales
}

function isComposer(
    instance: VueI18n | Composer,
    mode: I18nMode
): instance is Composer {
    return mode === 'composition' && isRef(instance.locale)
}

export function setupI18n2() {
    let locale = document.querySelector('html')!.getAttribute('lang')
    if (locale == null || !SUPPORT_LOCALES.includes(locale)) {
        locale = 'en'
    }

    const i18n = createI18n({locale: locale})



    return i18n
}

export function getLocale(i18n: I18n): string {
    if (isComposer(i18n.global, i18n.mode)) {
        return i18n.global.locale.value
    } else {
        return i18n.global.locale
    }
}

export function setLocale(i18n: I18n, locale: Locale): void {
    if (isComposer(i18n.global, i18n.mode)) {
        i18n.global.locale.value = locale
    } else {
        i18n.global.locale = locale
    }
}

export function setupI18n(options: I18nOptions = {locale: 'en'}): I18n {
    const i18n = createI18n(options)
    setI18nLanguage(i18n, options.locale!)
    return i18n
}

export function setI18nLanguage(i18n: I18n, locale: Locale): void {
    setLocale(i18n, locale)
    /**
     * NOTE:
     * If you need to specify the language setting for headers, such as the `fetch` API, set it here.
     * The following is an example for axios.
     *
     * axios.defaults.headers.common['Accept-Language'] = locale
     */

    // should be done by django
    // document.querySelector('html')!.setAttribute('lang', locale)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getResourceMessages = (r: any) => r.default || r

export async function loadLocaleMessages(i18n: I18n, locale: Locale) {
    // load locale messages
    const messages = await import(`./locales/${locale}.json`).then(
        getResourceMessages
    )

    // set locale and locale message
    i18n.global.setLocaleMessage(locale, messages)

    return nextTick()
}