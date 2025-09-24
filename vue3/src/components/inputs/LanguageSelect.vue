<template>
    <v-select
            :label="$t('Language')"
            v-model="$i18n.locale"
            :items="availableLocalizations"
            item-title="language"
            item-value="code"
            @update:model-value="updateLanguage()"
        ></v-select>
</template>

<script setup lang="ts">

import {onMounted, ref} from "vue";
import {ApiApi, Localization} from "@/openapi";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore.ts";
import {useI18n} from "vue-i18n";
import {SUPPORT_LOCALES} from "@/i18n.ts";

const availableLocalizations = ref([] as Localization[])
const {locale} = useI18n()


onMounted(() => {
    const api = new ApiApi()

    api.apiLocalizationList().then(r => {
        availableLocalizations.value = r
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    })

    // console.log(locale.value)
    // const regionNames = new Intl.DisplayNames([locale.value], { type: "language" });
    //
    // availableLocalizations.value = []
    // SUPPORT_LOCALES.forEach(locale => {
    //     const lang = new Intl.Locale(locale.replace('_', '-'))
    //     console.log(lang)
    //     availableLocalizations.value.push({
    //         code: lang.baseName,
    //         language: `${regionNames.of(lang.baseName)} [${lang.baseName}]`
    //     } as Localization)
    // })
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