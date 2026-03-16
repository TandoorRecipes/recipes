<template>
    <v-select
            :label="$t('Language')"
            v-model="$i18n.locale"
            :items="availableLocalizations"
            item-title="display"
            item-value="code"
            :hint="currentCoverage < 100 ? currentCoverage + '% ' + $t('translated') : ''"
            persistent-hint
            @update:model-value="updateLanguage()"
        >
        <template #item="{item, props: itemProps}">
            <v-list-item v-bind="itemProps">
                <template #append>
                    <span class="text-caption" :style="{color: coverageColor(item.raw.coverage)}">
                        {{ item.raw.coverage }}%
                    </span>
                </template>
            </v-list-item>
        </template>
    </v-select>
    <div class="text-caption mt-1 ms-4">
        <a href="https://translate.tandoor.dev" target="_blank" class="text-decoration-none">
            {{ $t('help_translate') }}
        </a>
    </div>
</template>

<script setup lang="ts">

import {onMounted, ref, computed} from "vue";
import {ApiApi, Localization} from "@/openapi";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore.ts";
import {useI18n} from "vue-i18n";
import {SUPPORT_LOCALES, resolveLocale, localeCoverage, LOCALE_MIN_COVERAGE} from "@/i18n.ts";

interface LocalizationWithCoverage {
    code: string
    language: string
    display: string
    coverage: number
}

const availableLocalizations = ref([] as LocalizationWithCoverage[])
const {locale} = useI18n()

const currentCoverage = computed(() => {
    const resolved = resolveLocale(locale.value)
    if (!resolved || resolved === 'en') return 100
    // Find the FE file that matches
    for (const [filename, data] of Object.entries(localeCoverage)) {
        if (filename.replaceAll('_', '-').toLowerCase() === resolved) {
            return data.fe
        }
    }
    return 0
})

function coverageColor(pct: number): string {
    if (pct >= 80) return '#4CAF50'  // green
    if (pct >= 50) return '#FB8C00'  // amber
    return '#E53935'                  // red
}

onMounted(() => {
    const api = new ApiApi()

    api.apiLocalizationList().then(r => {
        availableLocalizations.value = r.filter(l => l.code && resolveLocale(l.code) !== null)
            .map(l => {
                const resolved = resolveLocale(l.code!)!
                // Find FE coverage for this locale
                let fe = 0
                if (resolved === 'en') {
                    fe = 100
                } else {
                    for (const [filename, data] of Object.entries(localeCoverage)) {
                        if (filename.replaceAll('_', '-').toLowerCase() === resolved) {
                            fe = data.fe
                            break
                        }
                    }
                }
                return {
                    code: resolved,
                    language: l.language!,
                    display: l.language!,
                    coverage: fe
                }
            })
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    })
})

/**
 * update the django language cookie
 * this is used by django to inject the language into the template which in turn
 * sets the frontend language in i18n.ts when the frontend is initialized
 */
function updateLanguage() {
    const expires = new Date();
    expires.setTime(expires.getTime() + (100 * 365 * 24 * 60 * 60 * 1000));
    document.cookie = `django_language=${locale.value}; expires=${expires.toUTCString()}; path=/`;
    location.reload()
}

</script>


<style scoped>

</style>
