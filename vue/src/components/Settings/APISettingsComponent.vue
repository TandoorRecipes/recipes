<template>
    <div>

        <b-alert show variant="danger">
            The API is made for developers to interact with the application.
            It is possible to break things using the API so be careful and create a backup first.
            The API definition can and will change in the future, make sure to read the changelog to spot changes early
            on.

            <b-button-toolbar>
                <b-button-group class="mx-1">
                    <a :href="resolveDjangoUrl('docs_api')" class="btn btn-info" target="_blank"
                       rel="noreferrer nofollow">Docs</a>
                </b-button-group>
                <b-button-group class="mx-1">
                    <a :href="resolveDjangoUrl('api:api-root')" class="btn btn-success" target="_blank"
                       rel="noreferrer nofollow">Interactive API Browser</a>
                </b-button-group>
            </b-button-toolbar>

        </b-alert>

        Authentication works by proving the word <code>Bearer</code> followed by an API Token as a request Authorization
        header as shown below. <br/>
        <code>Authorization: Bearer TOKEN</code> -or-<br/>
        <code>curl -X GET http://your.domain.com/api/recipes/ -H 'Authorization:
            Bearer TOKEN'</code>

        <br/>
        <br/>
        You can have multiple tokens and each token can have its own scope. Currently there is <code>read</code>, <code>write</code>
        and <code>bookmarklet</code>.
        Read and write do what the name says, the bookmarklet scope is only used for the bookmarklet to limit access to
        it.

        <b-alert show variant="info">Make sure to save your token after creation as they cannot be viewed afterwards.
        </b-alert>

        <b-list-group class="mt-3">
            <b-list-group-item v-for="t in access_tokens" v-bind:key="t.id">
                <div class="row">
                    <div class="col-9">
                        {{ t.token }}<br/>
                        <small>
                            <span class="text-muted">Scope:</span> <code>{{ t.scope }}</code> <span class="text-muted">Expires:</span>
                            {{ formatDate(t.expires) }}
                        </small>

                    </div>
                    <div class="col-3">
                        <b-button-group>
                            <b-button variant="primary" @click="active_token=t; generic_action = Actions.UPDATE;"><i
                                class="far fa-edit"></i></b-button>
                            <b-button variant="danger" @click="active_token=t; generic_action = Actions.DELETE;"><i
                                class="fas fa-trash-alt"></i></b-button>
                        </b-button-group>
                    </div>

                </div>

            </b-list-group-item>
        </b-list-group>

        <b-button class="mt-1" variant="success" @click="generic_action=Actions.CREATE">{{ $t('New') }}</b-button>

        <generic-modal-form :model="Models.ACCESS_TOKEN" :action="generic_action" :show="generic_action !== null"
                            :item1="active_token"
                            @finish-action="updateToken"/>
    </div>
</template>

<script>
import {ApiApiFactory} from "@/utils/openapi/api";
import {ApiMixin, ResolveUrlMixin, StandardToasts} from "@/utils/utils";

import axios from "axios";
import GenericModalForm from "@/components/Modals/GenericModalForm";
import moment from "moment";

axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = "X-CSRFTOKEN"

export default {
    name: "APISettingsComponent",
    components: {GenericModalForm},
    mixins: [ApiMixin, ResolveUrlMixin],
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
        formatDate: function (datetime) {
            moment.locale(window.navigator.language);
            return moment(datetime).format('L')
        },
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