<template>
    <div v-if="user_preferences !== undefined">

        <b-form-input v-model="user_preferences.default_unit" @change="updateSettings"></b-form-input>

        {{ user_preferences.ingredient_decimals }}
        <b-form-input type="range" min="0" max="4" step="1" v-model="user_preferences.ingredient_decimals"
                      @change="updateSettings"></b-form-input>

        <b-form-checkbox v-model="user_preferences.use_fractions" @change="updateSettings"></b-form-checkbox>

        <hr/>
        Language
        <b-form-select v-model="$i18n.locale" @change="updateLanguage">
            <b-form-select-option v-bind:key="l[0]" v-for="l in languages" :value="l[1]">{{ l[0] }} ({{
                    l[1]
                }})
            </b-form-select-option>
        </b-form-select>

        <b-form-select v-model="user_preferences.theme" @change="updateSettings(true);">
            <b-form-select-option value="TANDOOR">Tandoor</b-form-select-option>
            <b-form-select-option value="BOOTSTRAP">Bootstrap</b-form-select-option>
            <b-form-select-option value="DARKLY">Darkly</b-form-select-option>
            <b-form-select-option value="FLATLY">Flatly</b-form-select-option>
            <b-form-select-option value="SUPERHERO">Superhero</b-form-select-option>
        </b-form-select>

        <b-form-checkbox v-model="user_preferences.sticky_navbar" @change="updateSettings(true);"></b-form-checkbox>

        <b-form-select v-model="user_preferences.nav_color" @change="updateSettings(true);">
            <b-form-select-option value="PRIMARY">Primary</b-form-select-option>
            <b-form-select-option value="SECONDARY">Secondary</b-form-select-option>
            <b-form-select-option value="SUCCESS">Success</b-form-select-option>
            <b-form-select-option value="INFO">Info</b-form-select-option>
            <b-form-select-option value="WARNING">Warning</b-form-select-option>
            <b-form-select-option value="DANGER">Danger</b-form-select-option>
            <b-form-select-option value="LIGHT">Light</b-form-select-option>
            <b-form-select-option value="DARK">Dark</b-form-select-option>
        </b-form-select>

        <hr/>

        <b-form-checkbox v-model="user_preferences.use_kj" @change="updateSettings();"></b-form-checkbox>
        <b-form-checkbox v-model="user_preferences.comments" @change="updateSettings();"></b-form-checkbox>
        <b-form-checkbox v-model="user_preferences.left_handed" @change="updateSettings();"></b-form-checkbox>

    </div>
</template>

<script>
import {ApiApiFactory} from "@/utils/openapi/api";
import {resolveDjangoUrl, StandardToasts} from "@/utils/utils";

import axios from "axios";

axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = "X-CSRFTOKEN"

export default {
    name: "CosmeticSettingsComponent",
    props: {
        user_id: Number,
    },
    data() {
        return {
            user_preferences: undefined,
            languages: [],
        }
    },
    mounted() {
        this.user_preferences = this.preferences
        this.languages = window.AVAILABLE_LANGUAGES
        this.loadSettings()
    },
    methods: {
        loadSettings: function () {
            let apiFactory = new ApiApiFactory()
            apiFactory.retrieveUserPreference(this.user_id.toString()).then(result => {
                this.user_preferences = result.data
            }).catch(err => {
                StandardToasts.makeStandardToast(this, StandardToasts.FAIL_FETCH, err)
            })
        },
        updateSettings: function (reload) {
            let apiFactory = new ApiApiFactory()
            apiFactory.partialUpdateUserPreference(this.user_id.toString(), this.user_preferences).then(result => {
                StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_UPDATE)
                if (reload !== undefined) {
                    location.reload()
                }
            }).catch(err => {
                StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
            })
        },
        updateLanguage: function () {
            axios.post(resolveDjangoUrl('set_language'), new URLSearchParams({'language': this.$i18n.locale})).then(result => {
                StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_UPDATE)
                location.reload()
            }).catch(err => {
                StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
            })
        }
    }
}
</script>

<style scoped>

</style>