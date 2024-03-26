<template>
    <div v-if="user_preferences !== undefined">

        <b-form-group :label="$t('Default_Unit')">
            <b-form-input v-model="user_preferences.default_unit" @change="updateSettings(false)"></b-form-input>
        </b-form-group>

        <b-form-group :label="$t('Decimals')">
            <b-form-input type="number" min="0" max="4" step="1" v-model="user_preferences.ingredient_decimals"
                          @change="updateSettings(false)"></b-form-input>
        </b-form-group>

        <b-form-group :description="$t('Use_Fractions_Help')">
            <b-form-checkbox v-model="user_preferences.use_fractions" @change="updateSettings(false)">
                {{ $t('Use_Fractions') }}
            </b-form-checkbox>
        </b-form-group>

        <b-form-group>
            <b-form-checkbox v-model="user_preferences.use_kj" @change="updateSettings(false);">{{ $t('Use_Kj') }}
            </b-form-checkbox>
        </b-form-group>
        <b-form-group>
            <b-form-checkbox v-model="user_preferences.comments" @change="updateSettings(false);">
                {{ $t('Comments_setting') }}
            </b-form-checkbox>
        </b-form-group>
        <b-form-group :description="$t('left_handed_help')">
            <b-form-checkbox v-model="user_preferences.left_handed" @change="updateSettings(false);">
                {{ $t('left_handed') }}
            </b-form-checkbox>
        </b-form-group>

        <b-form-group :description="$t('show_step_ingredients_setting_help')">
            <b-form-checkbox v-model="user_preferences.show_step_ingredients" @change="updateSettings(false);">
                {{ $t('show_step_ingredients_setting') }}
            </b-form-checkbox>
        </b-form-group>

        <b-form-group :label="$t('DefaultPage')">
            <b-form-select v-model="user_preferences.default_page" @change="updateSettings(true);">
                <b-form-select-option value="SEARCH">{{$t('Search')}}</b-form-select-option>
                <b-form-select-option value="SHOPPING">{{$t('Shopping')}}</b-form-select-option>
                <b-form-select-option value="PLAN">{{$t('Meal_Plan')}}</b-form-select-option>
                <b-form-select-option value="BOOKS">{{$t('Books')}}</b-form-select-option>
            </b-form-select>

        </b-form-group>

        <hr/>

        <b-form-group :label="$t('Language')">
            <b-form-select v-model="$i18n.locale" @change="updateLanguage">
                <b-form-select-option v-bind:key="l[0]" v-for="l in languages" :value="l[1]">{{ l[0] }} ({{
                        l[1]
                    }})
                </b-form-select-option>
            </b-form-select>

        </b-form-group>

        <b-alert variant="warning" show><i class="fas fa-exclamation-triangle"></i> {{ $t('Space_Cosmetic_Settings') }}</b-alert>

        <b-form-group :label="$t('Theme')">
            <b-form-select v-model="user_preferences.theme" @change="updateSettings(true);">
                <b-form-select-option value="TANDOOR">Tandoor</b-form-select-option>
                <b-form-select-option value="TANDOOR_DARK">Tandoor Dark (Beta)</b-form-select-option>
                <b-form-select-option value="BOOTSTRAP">Bootstrap</b-form-select-option>
                <b-form-select-option value="DARKLY">Darkly</b-form-select-option>
                <b-form-select-option value="FLATLY">Flatly</b-form-select-option>
                <b-form-select-option value="SUPERHERO">Superhero</b-form-select-option>
            </b-form-select>

        </b-form-group>

        <b-form-group :label="$t('Nav_Color')" :description="$t('Nav_Color_Help')">
            <b-input-group>
                <b-form-input type="color" v-model="user_preferences.nav_bg_color" @change="updateSettings(true);"></b-form-input>
                <b-input-group-append>
                    <b-button @click="user_preferences.nav_bg_color = '#ddbf86'; updateSettings(true);">{{ $t('Reset') }}</b-button>
                </b-input-group-append>
            </b-input-group>
        </b-form-group>

        <b-form-group :label="$t('Nav_Text_Mode')" :description="$t('Nav_Text_Mode_Help')">
            <b-form-select v-model="user_preferences.nav_text_color" @change="updateSettings(true);">
                <b-form-select-option value="LIGHT">Light</b-form-select-option>
                <b-form-select-option value="DARK">Dark</b-form-select-option>
            </b-form-select>
        </b-form-group>

        <b-form-group :description="$t('Show_Logo_Help')">
            <b-form-checkbox v-model="user_preferences.nav_show_logo" @change="updateSettings(true);">
                {{ $t('Show_Logo') }}
            </b-form-checkbox>
        </b-form-group>

        <b-form-group :description="$t('Sticky_Nav_Help')">
            <b-form-checkbox v-model="user_preferences.nav_sticky" @change="updateSettings(true);">
                {{ $t('Sticky_Nav') }}
            </b-form-checkbox>
        </b-form-group>


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
        this.$i18n.locale = window.CUSTOM_LOCALE

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
                if (reload) {
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