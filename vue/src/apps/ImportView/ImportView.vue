<template>
    <div id="app">
        <div>
            <div class="row">
                <div class="col col-md-12">
                    <h2>{{ $t('Import') }}</h2>
                </div>
            </div>

            <div class="row">
                <div class="col col-md-12">
                    <b-tabs content-class="mt-3">
                        <b-tab v-bind:title="$t('Website')" active>
                            <h6>Website</h6>

                            <b-input-group>
                                <b-input v-model="website_url" placeholder="Website URL"
                                         @paste="loadRecipe()"></b-input>
                                <b-input-group-append>
                                    <b-button variant="primary" @click="loadRecipe()"><i class="fas fa-search"></i>
                                    </b-button>
                                </b-input-group-append>
                            </b-input-group>

                            <a href="#" @click="clearRecentImports()">Clear recent imports</a>
                            <ul>
                                <li v-for="x in recent_urls" v-bind:key="x">
                                    <a href="#" @click="website_url=x; loadRecipe()">{{ x }}</a>
                                </li>
                            </ul>

                            <h6>Options</h6>
                            <!-- preview column -->
                            <div class="row">
                                <div class="col col-md-12" v-if="recipe_json !== undefined">
                                    Images
                                    Keywords
                                    <ul>
                                       <li v-for="k in recipe_json.keywords" v-bind:key="k">{{k}}</li>
                                    </ul>
                                    Steps
                                    <ul>
                                       <li v-for="s in recipe_json.steps" v-bind:key="s">{{s}}</li>
                                    </ul>
                                </div>
                            </div>

                            <h6>Import</h6>
                            <b-button @click="importRecipe()">Import</b-button>

                        </b-tab>
                        <b-tab v-bind:title="$t('App')">
                            <!-- TODO implement app import -->
                        </b-tab>
                        <b-tab v-bind:title="$t('Source')">
                            <!-- TODO implement source import -->
                        </b-tab>
                        <b-tab v-bind:title="$t('Bookmarklet')">
                            <!-- TODO get code for bookmarklet here and provide some instructions -->
                            <a class="btn btn-outline-info btn-sm" href="#">
                                Bookmark Text </a>
                        </b-tab>

                    </b-tabs>
                </div>
            </div>


        </div>
    </div>


</template>

<script>
import Vue from 'vue'
import {BootstrapVue} from 'bootstrap-vue'

import 'bootstrap-vue/dist/bootstrap-vue.css'

import {resolveDjangoUrl, ResolveUrlMixin, StandardToasts, ToastMixin} from "@/utils/utils";
import axios from "axios";
import {ApiApiFactory} from "@/utils/openapi/api";

Vue.use(BootstrapVue)

export default {
    name: 'ImportView',
    mixins: [
        ResolveUrlMixin,
        ToastMixin,
    ],
    components: {},
    data() {
        return {
            LS_IMPORT_RECENT: 'import_recent_urls', //TODO use central helper to manage all local storage keys (and maybe even access)
            website_url: '',
            recent_urls: [],
            source_data: '',
            recipe_json: undefined,
            recipe_data: undefined,
            recipe_tree: undefined,
            recipe_images: [],
            automatic: true,
            error: undefined,
            loading: false,
            preview: false,
        }
    },
    mounted() {
        let local_storage_recent = JSON.parse(window.localStorage.getItem(this.LS_IMPORT_RECENT))
        this.recent_urls = local_storage_recent !== null ? local_storage_recent : []

    },
    methods: {
        /**
         * Import recipe based on the data configured by the client
         */
        importRecipe: function () {
            let apiFactory = new ApiApiFactory()
            apiFactory.createRecipe(this.recipe_json).then(response => {
                StandardToasts.makeStandardToast(StandardToasts.SUCCESS_CREATE)
                window.location = resolveDjangoUrl('edit_recipe', response.data.id)
            }).catch(err => {
                StandardToasts.makeStandardToast(StandardToasts.FAIL_CREATE)
            })
        },
        /**
         * Requests the recipe to be loaded form the source (url/data) from the server
         * Updates all variables to contain what they need to render either simple preview or manual mapping mode
         */
        loadRecipe: function () {
            console.log(this.website_url)
            if (this.website_url !== '') {
                if (this.recent_urls.length > 5) {
                    this.recent_urls.pop()
                }
                if (this.recent_urls.filter(x => x === this.website_url).length === 0) {
                    this.recent_urls.push(this.website_url)
                }
                window.localStorage.setItem(this.LS_IMPORT_RECENT, JSON.stringify(this.recent_urls))
            }
            this.recipe_data = undefined
            this.recipe_json = undefined
            this.recipe_tree = undefined
            this.recipe_images = []
            this.error = undefined
            this.loading = true
            this.preview = false
            axios.post(resolveDjangoUrl('api_recipe_from_source'), {
                'url': this.website_url,
                'data': this.source_data,
                'auto': this.automatic,
                'mode': this.mode
            },).then((response) => {
                this.recipe_json = response.data['recipe_json'];
                this.recipe_tree = response.data['recipe_tree'];
                this.recipe_html = response.data['recipe_html'];
                this.recipe_images = response.data['recipe_images']; //todo change on backend as well after old view is deprecated
                if (this.automatic) {
                    this.recipe_data = this.recipe_json;
                    this.preview = false
                } else {
                    this.preview = true
                }
                this.loading = false
            }).catch((err) => {
                this.error = err.data
                this.loading = false
                console.log(err.response)
                StandardToasts.makeStandardToast(StandardToasts.FAIL_FETCH, err.response.data.msg)
            })
        },
        /**
         * Clear list of recently imported recipe urls
         */
        clearRecentImports: function () {
            window.localStorage.setItem(this.LS_IMPORT_RECENT, JSON.stringify([]))
            this.recent_urls = []
        }
    }
}

</script>

<style>


</style>
