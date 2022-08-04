<template>
    <div>
        <code>Authorization: Bearer TOKEN</code> or<br/>
        <code>curl -X GET http://your.domain.com/api/recipes/ -H 'Authorization:
            Bearer TOKEN'</code>

        <b-list-group class="mt-3">
            <b-list-group-item v-for="t in access_tokens" v-bind:key="t.id">{{ t.token }}<br/><small class="text-muted">{{
                    t.scope
                }}
                - {{ t.expires }}</small>
                <b-button @click="active_token=t; generic_action = Actions.UPDATE;">Edit</b-button>
                <b-button @click="active_token=t; generic_action = Actions.DELETE;">Delete</b-button>
            </b-list-group-item>
        </b-list-group>

        <b-button @click="generic_action=Actions.CREATE">NEW</b-button>

        <generic-modal-form :model="Models.ACCESS_TOKEN" :action="generic_action" :show="generic_action !== null"
                            :item1="active_token"
                            @finish-action="updateToken"/>
    </div>
</template>

<script>
import {ApiApiFactory} from "@/utils/openapi/api";
import {ApiMixin, StandardToasts} from "@/utils/utils";

import axios from "axios";
import GenericModalForm from "@/components/Modals/GenericModalForm";

axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = "X-CSRFTOKEN"

export default {
    name: "APISettingsComponent",
    components: {GenericModalForm},
    mixins: [ApiMixin,],
    props: {
        user_id: Number,
    },
    data() {
        return {
            access_tokens: [],
            active_token: null,
            generic_action: null,
        }
    },
    mounted() {
        this.user_preferences = this.preferences
        this.languages = window.AVAILABLE_LANGUAGES
        this.loadTokens()
    },
    methods: {
        loadTokens: function () {
            let apiFactory = new ApiApiFactory()
            apiFactory.listAccessTokens().then(result => {
                this.access_tokens = result.data
            }).catch(err => {
                StandardToasts.makeStandardToast(this, StandardToasts.FAIL_FETCH, err)
            })
        },
        updateToken: function (arg) {
            if (arg !== 'cancel') {
                if (this.generic_action === this.Actions.UPDATE) {
                    this.access_tokens[this.access_tokens.indexOf(this.active_token)] = arg.item
                } else if (this.generic_action === this.Actions.CREATE) {
                    this.access_tokens.push(arg.item)
                } else if (this.generic_action === this.Actions.DELETE) {
                    this.access_tokens.splice(this.access_tokens.indexOf(this.active_token), 1)
                }
            }

            this.generic_action = null
        },
    }
}
</script>

<style scoped>

</style>