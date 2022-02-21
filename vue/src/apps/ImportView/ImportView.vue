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

                            <b-card no-body>
                                <b-card-header header-tag="header" class="p-1" role="tab">
                                    <b-button block v-b-toggle.id_accordion_url variant="info">Website</b-button>
                                </b-card-header>
                                <b-collapse id="id_accordion_url" visible accordion="url_import_accordion" role="tabpanel">
                                    <b-card-body>
                                        <b-input-group>
                                            <b-input v-model="website_url" placeholder="Website URL"
                                                     @paste="loadRecipe()"></b-input>
                                            <b-input-group-append>
                                                <b-button variant="primary" @click="loadRecipe()"><i
                                                    class="fas fa-search"></i>
                                                </b-button>
                                            </b-input-group-append>
                                        </b-input-group>

                                        <a href="#" @click="clearRecentImports()">Clear recent imports</a>
                                        <ul>
                                            <li v-for="x in recent_urls" v-bind:key="x">
                                                <a href="#" @click="website_url=x; loadRecipe()">{{ x }}</a>
                                            </li>
                                        </ul>
                                    </b-card-body>
                                </b-collapse>
                            </b-card>

                            <b-card no-body>
                                <b-card-header header-tag="header" class="p-1" role="tab">
                                    <b-button block v-b-toggle.id_accordion_add_options variant="info">Additional Options</b-button>
                                </b-card-header>
                                <b-collapse id="id_accordion_add_options" accordion="url_import_accordion" role="tabpanel">
                                    <b-card-body v-if="recipe_json !== undefined"> <!-- TODO disable/show message if not imported yet -->

                                        <div class="row">
                                            <div class="col col-md-12 text-center">
                                                <b-img rounded fluid :src="recipe_json.image"
                                                       style="max-height: 30vh"></b-img>
                                            </div>
                                        </div>

                                        <div class="row mt-1">
                                            <div class="col col-md-12 text-center">
                                                <small class="text-muted">Click the image you want to import for this
                                                    recipe</small> <!-- TODO localize -->
                                            </div>
                                            <div class="col col-md-12 text-center">
                                                <b-img v-for="i in recipe_images" rounded thumbnail fluid :src="i"
                                                       style="max-height: 10vh" v-bind:key="i"
                                                       @click="recipe_json.image = i"></b-img>
                                            </div>
                                        </div>

                                        <div class="row mt-2">
                                            <div class="col col-6">
                                                <b-card title="Used Keywords">

                                                    <b-list-group>
                                                        <draggable :list="recipe_json.keywords" group="keywords"
                                                                   :empty-insert-threshold="10">
                                                            <b-list-group-item v-for="k in recipe_json.keywords"
                                                                               v-bind:key="k.name">{{
                                                                    k.label
                                                                }}
                                                            </b-list-group-item>
                                                        </draggable>

                                                    </b-list-group>
                                                </b-card>
                                            </div>
                                            <div class="col col-6">
                                                <b-card title="Unused Keywords">
                                                    <b-list-group>
                                                        <draggable :list="recipe_json.unused_keywords" group="keywords"
                                                                   :empty-insert-threshold="10">
                                                            <b-list-group-item v-for="k in recipe_json.unused_keywords"
                                                                               v-bind:key="k.name">{{
                                                                    k.label
                                                                }}
                                                            </b-list-group-item>
                                                        </draggable>
                                                    </b-list-group>
                                                </b-card>
                                            </div>
                                        </div>

                                        Steps
                                        <div class="row">
                                            <div class="col col-md-12">
                                                <b-button @click="splitSteps('\n')">Split</b-button>
                                                <b-list-group>
                                                    <b-list-group-item v-for="s in recipe_json.steps"
                                                                       v-bind:key="s.instruction"><span
                                                        style="white-space: pre-wrap">{{ s.instruction }}</span>
                                                    </b-list-group-item>
                                                </b-list-group>
                                            </div>

                                        </div>

                                    </b-card-body>
                                </b-collapse>
                            </b-card>

                            <b-card no-body>
                                <b-card-header header-tag="header" class="p-1" role="tab">
                                    <b-button block v-b-toggle.id_accordion_import variant="info">Import</b-button>
                                </b-card-header>
                                <b-collapse id="id_accordion_import" visible accordion="url_import_accordion" role="tabpanel">
                                    <b-card-body>

                                        <b-button-group>
                                            <b-button @click="importRecipe()">Import & View</b-button>
                                            <b-button @click="importRecipe()">Import & Edit</b-button>
                                            <b-button @click="importRecipe()">Import & start new import</b-button>
                                        </b-button-group>

                                    </b-card-body>
                                </b-collapse>
                            </b-card>


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
import draggable from "vuedraggable";

Vue.use(BootstrapVue)

export default {
    name: 'ImportView',
    mixins: [
        ResolveUrlMixin,
        ToastMixin,
    ],
    components: {
        draggable
    },
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
            apiFactory.createRecipe(this.recipe_json).then(response => { // save recipe
                let recipe = response.data
                apiFactory.imageRecipe(response.data.id, undefined, this.recipe_json.image).then(response => { // save recipe image
                    StandardToasts.makeStandardToast(StandardToasts.SUCCESS_CREATE)
                    window.location = resolveDjangoUrl('edit_recipe', recipe.id)
                }).catch(e => {
                    StandardToasts.makeStandardToast(StandardToasts.FAIL_UPDATE)
                    window.location = resolveDjangoUrl('edit_recipe', recipe.id)
                })
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

                this.$set(this.recipe_json, 'unused_keywords', this.recipe_json.keywords.filter(k => k.id === undefined))
                this.$set(this.recipe_json, 'keywords', this.recipe_json.keywords.filter(k => k.id !== undefined))

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
         * Splits the steps of a given recipe at the split character (e.g. \n or \n\n)
         * @param split_character: character to split steps at
         */
        splitSteps: function (split_character) {
            let steps = []
            this.recipe_json.steps.forEach(step => {
                step.instruction.split(split_character).forEach(part => {
                    steps.push({'instruction': part, 'ingredients': []})
                })
            })
            this.recipe_json.steps.forEach(step => {
                if (step.ingredients.length > 0) {
                    console.log('found ingredients', step.ingredients)
                    steps[0].ingredients = steps[0].ingredients.concat(step.ingredients)
                }
            })
            this.recipe_json.steps = steps
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
