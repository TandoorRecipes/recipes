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
                    <b-tabs content-class="mt-3" v-model="tab_index">
                        <!-- URL Tab -->
                        <b-tab v-bind:title="$t('Website')" id="id_tab_url" active>

                            <!-- URL -->
                            <b-card no-body>
                                <b-card-header header-tag="header" class="p-1" role="tab">
                                    <b-button block v-b-toggle.id_accordion_url variant="info">Website</b-button>
                                </b-card-header>
                                <b-collapse id="id_accordion_url" visible accordion="url_import_accordion"
                                            role="tabpanel" v-model="collapse_visible.url">
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

                            <!-- OPTIONS -->
                            <b-card no-body>
                                <b-card-header header-tag="header" class="p-1" role="tab">
                                    <b-button block v-b-toggle.id_accordion_add_options variant="info"
                                              :disabled="recipe_json === undefined">Options
                                    </b-button>
                                </b-card-header>
                                <b-collapse id="id_accordion_add_options" accordion="url_import_accordion"
                                            role="tabpanel" v-model="collapse_visible.options">
                                    <b-card-body v-if="recipe_json !== undefined">

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
                                                <span v-if="recipe_images.length === 0">No additional images found in source.</span>
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

                                        <import-view-step-editor :recipe="recipe_json"
                                                                 @change="recipe_json = $event"></import-view-step-editor>

                                    </b-card-body>
                                </b-collapse>
                            </b-card>

                            <!-- ADVANCED OPTIONS -->
                            <b-card no-body>
                                <b-card-header header-tag="header" class="p-1" role="tab">
                                    <b-button block v-b-toggle.id_accordion_advanced_options variant="info"
                                              :disabled="recipe_json === undefined">Advanced Options
                                    </b-button>
                                </b-card-header>
                                <b-collapse id="id_accordion_advanced_options" visible accordion="url_import_accordion"
                                            role="tabpanel" v-model="collapse_visible.advanced_options">
                                    <b-card-body v-if="recipe_json !== undefined">

                                        <import-view-advanced-mapping :recipe="recipe_json" :recipe_tree="recipe_tree" :recipe_images="recipe_images" :recipe_html="recipe_html"
                                                                      @change="recipe_json = $event"></import-view-advanced-mapping>

                                    </b-card-body>
                                </b-collapse>
                            </b-card>

                            <!-- IMPORT -->
                            <b-card no-body>
                                <b-card-header header-tag="header" class="p-1" role="tab">
                                    <b-button block v-b-toggle.id_accordion_import variant="info"
                                              :disabled="recipe_json === undefined">Import
                                    </b-button>
                                </b-card-header>
                                <b-collapse id="id_accordion_import" visible accordion="url_import_accordion"
                                            role="tabpanel" v-model="collapse_visible.import">
                                    <b-card-body class="text-center">

                                        <b-button-group>
                                            <b-button @click="importRecipe('view')">Import & View</b-button>
                                            <b-button @click="importRecipe('edit')">Import & Edit</b-button>
                                            <b-button @click="importRecipe('import')">Import & start new import
                                            </b-button>
                                        </b-button-group>

                                    </b-card-body>
                                </b-collapse>
                            </b-card>

                        </b-tab>
                        <!-- App Tab -->
                        <b-tab v-bind:title="$t('App')">

                            <select class="form-control" v-model="recipe_app">
                                <option v-for="i in INTEGRATIONS" :value="i.id" v-bind:key="i.id">{{ i.name }}</option>
                            </select>

                            <b-form-checkbox v-model="import_duplicates" name="check-button" switch
                                             style="margin-top: 1vh">
                                {{ $t('import_duplicates') }}
                            </b-form-checkbox>

                            <b-form-file
                                class="my-2"
                                multiple
                                v-model="recipe_files"
                                :placeholder="$t('Select_File')"
                                drop-placeholder="Drop recipe files here...">
                            </b-form-file>
                            <button @click="importAppRecipe()" class="btn btn-primary shadow-none" type="button"
                                    id="id_btn_app"><i class="fas fa-file-archive"></i> {{ $t('Import') }}
                            </button>
                        </b-tab>
                        <!-- Source Tab -->
                        <b-tab v-bind:title="$t('Source')">

                            <div class="input-group mt-4">
                                <b-textarea class="form-control input-group-append" v-model="source_data" rows=10
                                            :placeholder="$t('paste_json')" style="font-size: 12px">
                                </b-textarea>
                            </div>
                            <b-button @click="loadRecipe()" variant="primary"><i class="fas fa-code"></i>
                                {{ $t('Import') }}
                            </b-button>

                        </b-tab>
                        <!-- Bookmarklet Tab -->
                        <b-tab v-bind:title="$t('Bookmarklet')">
                            <!-- TODO localize -->
                            Some pages cannot be imported from their URL, the Bookmarklet can be used to import from
                            some of them anyway.<br/>
                            1. Drag the following button to your bookmarks bar <a class="btn btn-outline-info btn-sm"
                                                                                  :href="makeBookmarklet()">Import into
                            Tandoor</a> <br/>

                            2. Open the page you want to import from <br/>
                            3. Click on the bookmark to perform the import <br/>

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

import {resolveDjangoStatic, resolveDjangoUrl, ResolveUrlMixin, StandardToasts, ToastMixin} from "@/utils/utils";
import axios from "axios";
import {ApiApiFactory} from "@/utils/openapi/api";
import draggable from "vuedraggable";
import {INTEGRATIONS} from "@/utils/integration";
import ImportViewStepEditor from "@/apps/ImportView/ImportViewStepEditor";
import ImportViewAdvancedMapping from "@/apps/ImportView/ImportViewAdvancedMapping";

Vue.use(BootstrapVue)

export default {
    name: 'ImportView',
    mixins: [
        ResolveUrlMixin,
        ToastMixin,
    ],
    components: {
        ImportViewAdvancedMapping,
        ImportViewStepEditor,
        draggable,
    },
    data() {
        return {
            tab_index: 0,
            collapse_visible: {
                url: true,
                options: false,
                advanced_options: false,
                import: false,
            },
            // URL import
            LS_IMPORT_RECENT: 'import_recent_urls', //TODO use central helper to manage all local storage keys (and maybe even access)
            website_url: '',
            recent_urls: [],
            source_data: '',
            recipe_json: undefined,
            recipe_html: undefined,
            recipe_tree: undefined,
            recipe_images: [],
            // App Import
            INTEGRATIONS: INTEGRATIONS,
            recipe_app: undefined,
            import_duplicates: false,
            recipe_files: [],
            // Bookmarklet
            BOOKMARKLET_CODE: window.BOOKMARKLET_CODE
        }
    },
    mounted() {
        let local_storage_recent = JSON.parse(window.localStorage.getItem(this.LS_IMPORT_RECENT))
        this.recent_urls = local_storage_recent !== null ? local_storage_recent : []
        this.tab_index = 0 //TODO add ability to pass open tab via get parameter

        if (window.BOOKMARKLET_IMPORT_ID !== -1) {
            this.loadRecipe(window.BOOKMARKLET_IMPORT_ID)
        }
    },
    methods: {
        /**
         * Import recipe based on the data configured by the client
         * @param action: action to perform after import (options are: edit, view, import)
         */
        importRecipe: function (action) {
            let apiFactory = new ApiApiFactory()
            apiFactory.createRecipe(this.recipe_json).then(response => { // save recipe
                let recipe = response.data
                apiFactory.imageRecipe(response.data.id, undefined, this.recipe_json.image).then(response => { // save recipe image
                    StandardToasts.makeStandardToast(StandardToasts.SUCCESS_CREATE)
                    this.afterImportAction(action, recipe)
                }).catch(e => {
                    StandardToasts.makeStandardToast(StandardToasts.FAIL_UPDATE)
                    this.afterImportAction(action, recipe)
                })
            }).catch(err => {
                StandardToasts.makeStandardToast(StandardToasts.FAIL_CREATE)
            })
        },
        /**
         * Action performed after URL import
         * @param action: action to perform after import
         *                edit: edit imported recipe
         *                view: view imported recipe
         *                import: restart the importer
         * @param recipe: recipe that was imported
         */
        afterImportAction: function (action, recipe) {
            switch (action) {
                case 'edit':
                    window.location = resolveDjangoUrl('edit_recipe', recipe.id)
                    break;
                case 'view':
                    window.location = resolveDjangoUrl('view_recipe', recipe.id)
                    break;
                case 'import':
                    location.reload();
                    break;
            }
        },
        /**
         * Requests the recipe to be loaded form the source (url/data) from the server
         * Updates all variables to contain what they need to render either simple preview or manual mapping mode
         */
        loadRecipe: function (bookmarklet) {
            console.log(this.website_url)
            // keep list of recently imported urls
            if (this.website_url !== '') {
                if (this.recent_urls.length > 5) {
                    this.recent_urls.pop()
                }
                if (this.recent_urls.filter(x => x === this.website_url).length === 0) {
                    this.recent_urls.push(this.website_url)
                }
                window.localStorage.setItem(this.LS_IMPORT_RECENT, JSON.stringify(this.recent_urls))
            }

            // reset all variables
            this.recipe_html = undefined
            this.recipe_json = undefined
            this.recipe_tree = undefined
            this.recipe_images = []

            // load recipe
            let payload = {
                'url': this.website_url,
                'data': this.source_data,
            }

            if (bookmarklet !== undefined) {
                payload['bookmarklet'] = bookmarklet
            }

            axios.post(resolveDjangoUrl('api_recipe_from_source'), payload,).then((response) => {
                this.recipe_json = response.data['recipe_json'];

                this.$set(this.recipe_json, 'unused_keywords', this.recipe_json.keywords.filter(k => k.id === undefined))
                this.$set(this.recipe_json, 'keywords', this.recipe_json.keywords.filter(k => k.id !== undefined))

                this.recipe_tree = response.data['recipe_tree'];
                this.recipe_html = response.data['recipe_html'];
                this.recipe_images = response.data['recipe_images'] !== undefined ? response.data['recipe_images'] : [];

                this.tab_index = 0 // open tab 0 with import wizard
                this.collapse_visible.options = true // open options collapse
            }).catch((err) => {
                StandardToasts.makeStandardToast(StandardToasts.FAIL_FETCH, err.response.data.msg)
            })
        },
        /**
         * Import recipes with uploaded files and app integration
         */
        importAppRecipe: function () {
            let formData = new FormData();
            formData.append('type', this.recipe_app);
            formData.append('duplicates', this.import_duplicates)
            for (let i = 0; i < this.recipe_files.length; i++) {
                formData.append('files', this.recipe_files[i]);
            }
            axios.post(resolveDjangoUrl('view_import'), formData, {headers: {'Content-Type': 'multipart/form-data'}}).then((response) => {
                window.location.href = resolveDjangoUrl('view_import_response', response.data['import_id'])
            }).catch((err) => {
                console.log(err)
                StandardToasts.makeStandardToast(StandardToasts.FAIL_CREATE)
            })
        },
        /**
         * Clear list of recently imported recipe urls
         */
        clearRecentImports: function () {
            window.localStorage.setItem(this.LS_IMPORT_RECENT, JSON.stringify([]))
            this.recent_urls = []
        },
        /**
         * Create the code required for the bookmarklet
         * @returns {string} javascript:// protocol code to be loaded into href attribute of link that can be bookmarked
         */
        makeBookmarklet: function () {
            return 'javascript:(function(){' +
                'if(window.bookmarkletTandoor!==undefined){' +
                'bookmarkletTandoor();' +
                '} else {' +
                `localStorage.setItem("importURL", "${localStorage.getItem('BASE_PATH')}${this.resolveDjangoUrl('api:bookmarkletimport-list')}");` +
                `localStorage.setItem("redirectURL", "${localStorage.getItem('BASE_PATH')}${this.resolveDjangoUrl('data_import_url')}");` +
                `localStorage.setItem("token", "${window.API_TOKEN}");` +
                `document.body.appendChild(document.createElement("script")).src="${localStorage.getItem('BASE_PATH')}${resolveDjangoStatic('/js/bookmarklet.js')}?r="+Math.floor(Math.random()*999999999)}` +
                `})()`
        }
    }
}

</script>

<style>


</style>
