<template>
    <div>
        <div v-if="user !== undefined">

            <b-form-input v-model="user.username" @change="updateUser(false)" disabled></b-form-input>
            <b-form-input v-model="user.first_name" @change="updateUser(false)"></b-form-input>
            <b-form-input v-model="user.last_name" @change="updateUser(false)"></b-form-input>
        </div>

        <a :href="resolveDjangoUrl('account_email')" class="btn btn-primary">Emails</a>
        <a :href="resolveDjangoUrl('account_change_password')" class="btn btn-primary">Password</a>
        <a :href="resolveDjangoUrl('socialaccount_connections')" class="btn btn-primary">Social</a>

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