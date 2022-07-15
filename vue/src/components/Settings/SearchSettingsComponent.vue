<template>
    <div v-if="user_preferences !== undefined">


    </div>
</template>

<script>
import {ApiApiFactory} from "@/utils/openapi/api";
import {StandardToasts} from "@/utils/utils";

import axios from "axios";

axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = "X-CSRFTOKEN"

export default {
    name: "SearchSettingsComponent",
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
    }
}
</script>

<style scoped>

</style>