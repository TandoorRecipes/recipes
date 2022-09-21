<template>
    <div>

        <div v-if="user !== undefined">
            <b-form-group :label="$t('Username')">
                <b-form-input v-model="user.username" @change="updateUser(false)" disabled></b-form-input>
            </b-form-group>

            <b-form-group :label="$t('First_name')">
                <b-form-input v-model="user.first_name" @change="updateUser(false)" :placeholder="$t('First_name')"></b-form-input>
            </b-form-group>

            <b-form-group :label="$t('Last_name')">
                <b-form-input v-model="user.last_name" @change="updateUser(false)" :placeholder="$t('Last_name')"></b-form-input>
            </b-form-group>

        </div>

        <b-button-toolbar>
            <b-button-group class="mx-1">
                <a :href="resolveDjangoUrl('account_email')" class="btn btn-primary">{{ $t('Manage_Emails') }}</a>
            </b-button-group>
            <b-button-group class="mx-1">
                <a :href="resolveDjangoUrl('account_change_password')" class="btn btn-primary">{{ $t('Change_Password') }}</a>
            </b-button-group>
            <b-button-group class="mx-1">
                <a :href="resolveDjangoUrl('socialaccount_connections')" class="btn btn-primary">{{ $t('Social_Authentication') }}</a>
            </b-button-group>
        </b-button-toolbar>

    </div>
</template>

<script>
import {ApiApiFactory} from "@/utils/openapi/api";
import {ResolveUrlMixin, StandardToasts} from "@/utils/utils";

import axios from "axios";

axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = "X-CSRFTOKEN"

export default {
    name: "AccountSettingsComponent",
    mixins: [ResolveUrlMixin],
    props: {
        user_id: Number,
    },
    data() {
        return {
            user_preferences: undefined,
            user: undefined,
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
            apiFactory.retrieveUser(this.user_id.toString()).then(result => {
                this.user = result.data
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
        updateUser: function (reload) {
            let apiFactory = new ApiApiFactory()
            apiFactory.partialUpdateUser(this.user_id.toString(), this.user).then(result => {
                StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_UPDATE)
                if (reload) {
                    location.reload()
                }
            }).catch(err => {
                StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
            })
        },
    }
}
</script>

<style scoped>

</style>