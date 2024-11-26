<template>
    <div id="app">
        <div>
            <div class="row">
                <div class="col col-md-12">
                    <b-tabs content-class="mt-3" v-model="tab_index">
                        <!-- URL Tab -->
                        <b-tab v-bind:title="$t('Website')" id="id_tab_url" active>

                            <!-- URL -->
                            <b-card no-body>
                                <b-card-header header-tag="header" class="p-1" role="tab">
                                    <b-col cols="12" md="6" offset="0" offset-md="3">
                                        <b-button block v-b-toggle.id_accordion_url variant="info">{{
                                                $t('Website')
                                            }}
                                        </b-button>
                                    </b-col>
                                </b-card-header>
                                <b-collapse id="id_accordion_url" visible accordion="url_import_accordion"
                                            role="tabpanel" v-model="collapse_visible.url">
                                    <div class="row justify-content-center p-2">
                                        <div class="col-12 col-lg-10 col-xl-8 mt-3 mb-3">
                                            <div class="row justify-content-center">
                                                <div class="col-12 justify-content-cente">
                                                    <b-checkbox v-model="import_multiple" switch><span
                                                        v-if="import_multiple"><i
                                                        class="far fa-copy fa-fw"></i> {{ $t('Multiple') }}</span><span
                                                        v-if="!import_multiple"><i
                                                        class="far fa-file fa-fw"></i> {{ $t('Single') }}</span>
                                                    </b-checkbox>
                                                </div>
                                            </div>
                                            <b-input-group class="mt-2" :class="{ bounce: empty_input }"
                                                           v-if="!import_multiple">
                                                <b-input
                                                    class="form-control form-control-lg form-control-borderless form-control-search"
                                                    v-model="website_url"
                                                    placeholder="https://..." @paste="onURLPaste"></b-input>
                                                <b-input-group-append>
                                                    <b-button variant="primary"
                                                              @click="loadRecipe(website_url,false,undefined)"><i
                                                        class="fas fa-search fa-fw"></i>
                                                    </b-button>
                                                </b-input-group-append>
                                            </b-input-group>
                                            <b-textarea rows="10" :placeholder="$t('one_url_per_line')"
                                                        v-model="website_url_list"
                                                        v-if="import_multiple">
                                            </b-textarea>

                                            <b-button class="float-right" v-if="import_multiple"
                                                      :disabled="website_url_list.length < 1"
                                                      @click="autoImport()">{{ $t('Import') }}
                                            </b-button>

                                            <!-- recent imports, nice for testing/development -->
                                            <!--                                            <div class="row mt-2"> -->
                                            <!--                                                <div class="col col-md-12">-->
                                            <!--                                                    <div v-if="!import_multiple">-->
                                            <!--                                                        <a href="#" @click="clearRecentImports()">Clear recent-->
                                            <!--                                                            imports</a>-->
                                            <!--                                                        <ul>-->
                                            <!--                                                            <li v-for="x in recent_urls" v-bind:key="x">-->
                                            <!--                                                                <a href="#"-->
                                            <!--                                                                   @click="loadRecipe(x, false, undefined)">{{-->
                                            <!--                                                                        x-->
                                            <!--                                                                    }}</a>-->
                                            <!--                                                            </li>-->
                                            <!--                                                        </ul>-->

                                            <!--                                                    </div>-->
                                            <!--                                                </div>-->
                                            <!--                                            </div>-->

                                        </div>
                                    </div>
                                </b-collapse>
                            </b-card>

                            <!-- Loading -->
                            <b-card no-body v-if="loading">
                                <loading-spinner></loading-spinner>
                            </b-card>

                            <!-- Warnings -->
                            <b-card no-body v-if="duplicateWarning" class="warning">
                                {{ duplicateWarning }}
                            </b-card>

                            <!-- OPTIONS -->
                            <b-card no-body v-if="recipe_json !== undefined">
                                <b-card-header header-tag="header" class="p-1" role="tab">
                                    <b-col cols="12" md="6" offset="0" offset-md="3">
                                        <b-button block v-b-toggle.id_accordion_add_options variant="info"
                                                  :disabled="recipe_json === undefined">{{ $t('Options') }}
                                        </b-button>
                                    </b-col>
                                </b-card-header>
                                <b-collapse id="id_accordion_add_options" accordion="url_import_accordion"
                                            role="tabpanel" v-model="collapse_visible.options">
                                    <b-card-body v-if="recipe_json !== undefined"
                                                 class="p-1 pb-md-5 pr-md-5 pl-md-5 pt-md-2">

                                        <div class="row">
                                            <div class="col-12 col-md-8 offset-0 offset-md-2">
                                                <h4 class="text-center flex-grow-1" v-b-tooltip.hover.bottom
                                                    :title="$t('Click_To_Edit')" v-if="!edit_name"
                                                    @click="edit_name = true">{{
                                                        recipe_json.name
                                                    }} <span class="text-primary"><i class="fa fa-edit"></i> </span>
                                                </h4>
                                                <b-input-group v-if="edit_name" class="mb-2">
                                                    <b-input
                                                        class="form-control form-control-borderless form-control-search"
                                                        v-model="recipe_json.name"></b-input>
                                                    <b-input-group-append>
                                                        <b-button variant="primary" @click="edit_name = false"><i
                                                            class="fas fa-save fa-fw"></i>
                                                        </b-button>
                                                    </b-input-group-append>
                                                </b-input-group>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col col-md-12 text-center">
                                                <b-img rounded fluid :src="recipe_json.image"
                                                       style="max-height: 30vh"></b-img>
                                            </div>
                                        </div>

                                        <div class="row mt-1">
                                            <div class="col col-md-12 text-center">
                                                <small class="text-muted">{{ $t('click_image_import') }}</small><br/>
                                                <span
                                                    v-if="recipe_images.length === 0">{{
                                                        $t('no_more_images_found')
                                                    }}</span>
                                                <div class="scrolling-wrapper-flexbox">
                                                    <div class="wrapper-card" v-for="i in recipe_images"
                                                         v-bind:key="i"
                                                         @click="recipe_json.image = i">
                                                        <b-img rounded thumbnail fluid :src="i"
                                                               style="max-height: 10vh"
                                                        ></b-img>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="row mt-2 mt-md-4">
                                            <div class="col-12 col-md-6 offset-0 offset-md-3">
                                                <b-card no-body>
                                                    <b-card-title>
                                                        <div class="clearfix">
                                                            <span class="float-left h5">{{ $t('Keywords') }}</span>
                                                            <b-button-group class="float-right">
                                                                <b-button class="float-right" variant="primary"
                                                                          @click="$set(recipe_json, 'keywords', recipe_json.keywords.map(x => {x.show = true; return x}))">
                                                                    <i
                                                                        class="fa fa-check-double"></i></b-button>
                                                                <b-button class="float-right" variant="secondary"
                                                                          @click="$set(recipe_json, 'keywords', recipe_json.keywords.map(x => {x.show = false; return x}))">
                                                                    <i
                                                                        class="fa fa-times"></i></b-button>
                                                            </b-button-group>
                                                        </div>
                                                    </b-card-title>
                                                    <b-card-body class="m-0 p-0 p-md-5">
                                                        <b-list-group>
                                                            <b-list-group-item
                                                                v-for="(k, index) in recipe_json.keywords"
                                                                v-bind:key="k.name" style="cursor: pointer"
                                                                v-hover v-bind:class="{ 'bg-success': k.show }"
                                                                @click="k.show = (!k.show);$set(recipe_json.keywords, index, k)">
                                                                <div class="clearfix">
                                                              <span class="float-left">{{
                                                                      k.label
                                                                  }} </span>
                                                                    <b-checkbox class="float-right" v-model="k.show"
                                                                                disabled></b-checkbox>
                                                                </div>
                                                            </b-list-group-item>
                                                        </b-list-group>
                                                    </b-card-body>
                                                </b-card>
                                            </div>
                                        </div>

                                        <import-view-step-editor :recipe="recipe_json"
                                                                 @change="recipe_json = $event"></import-view-step-editor>

                                    </b-card-body>
                                </b-collapse>
                            </b-card>

                            <!-- IMPORT -->
                            <b-card no-body
                                    v-if="recipe_json !== undefined || (imported_recipes.length > 0 || failed_imports.length>0)">
                                <b-card-header header-tag="header" class="p-1" role="tab">
                                    <b-col cols="12" md="6" offset="0" offset-md="3">
                                        <b-button block v-b-toggle.id_accordion_import variant="info"
                                                  :disabled="recipe_json === undefined">{{ $t('Import') }}
                                        </b-button>
                                    </b-col>
                                </b-card-header>
                                <b-collapse id="id_accordion_import" visible accordion="url_import_accordion"
                                            role="tabpanel" v-model="collapse_visible.import">
                                    <b-card-body class="text-center">
                                        <b-row>
                                            <b-col cols="12" md="6" xl="4" offset="0" offset-md="3" offset-xl="4"
                                                   v-if="!import_multiple">

                                                <recipe-card :recipe="recipe_json" :detailed="false"
                                                             :show_context_menu="false"
                                                ></recipe-card>
                                            </b-col>
                                            <b-col>
                                                <b-list-group>
                                                    <b-list-group-item
                                                        v-for="r in imported_recipes"
                                                        v-bind:key="r.id"
                                                        v-hover>
                                                        <div class="clearfix">
                                                            <a class="float-left" target="_blank"
                                                               rel="noreferrer nofollow"
                                                               :href="resolveDjangoUrl('view_recipe',r.id)">{{
                                                                    r.name
                                                                }}</a>
                                                            <span class="float-right">{{ $t('Imported') }}</span>
                                                        </div>
                                                    </b-list-group-item>

                                                    <b-list-group-item
                                                        v-for="u in failed_imports"
                                                        v-bind:key="u"
                                                        v-hover>
                                                        <div class="clearfix">
                                                            <a class="float-left" target="_blank"
                                                               rel="noreferrer nofollow" :href="u">{{ u }}</a>
                                                            <span class="float-right">{{ $t('Failure') }}</span>
                                                        </div>
                                                    </b-list-group-item>
                                                </b-list-group>
                                            </b-col>
                                        </b-row>
                                    </b-card-body>
                                    <b-card-footer class="text-center">
                                        <div class="d-flex justify-content-center mb-3" v-if="import_loading">
                                            <b-spinner variant="primary"></b-spinner>
                                        </div>
                                        <b-button-group>
                                            <b-button @click="importRecipe('view')" v-if="!import_multiple"
                                                      :disabled="import_loading">Import &
                                                View
                                            </b-button> <!-- TODO localize -->
                                            <b-button @click="importRecipe('edit')" variant="success"
                                                      v-if="!import_multiple" :disabled="import_loading">Import & Edit
                                            </b-button>
                                            <b-button @click="importRecipe('import')" v-if="!import_multiple"
                                                      :disabled="import_loading">Import &
                                                Restart
                                            </b-button>
                                            <b-button @click="location.reload()" :disabled="import_loading">Restart
                                            </b-button>
                                        </b-button-group>
                                    </b-card-footer>
                                </b-collapse>
                            </b-card>
                        </b-tab>
                        <!-- App Tab -->
                        <b-tab v-bind:title="$t('App')">
                            <b-container>
                                <h4>{{ $t('Select_App_To_Import') }}:</h4>
                                <b-row align-h="center" class="mt-4">
                                    <b-col cols="12" md="6" v-for="i in INTEGRATIONS_TD" :value="i.id"
                                           v-bind:key="i.id">
                                        <b-list-group>
                                            <b-list-group-item class="d-flex align-items-center" v-hover
                                                               style="cursor: pointer"
                                                               v-bind:class="{ 'bg-success': recipe_app === i.id }"
                                                               @click="recipe_app = i.id">
                                                <b-avatar class="mr-3"><i :class="i.icon"
                                                                          v-if="i.img_src === undefined"></i><img
                                                    :src="i.img_src" v-if="i.img_src !== undefined" alt="Icon">
                                                </b-avatar>
                                                <span class="mr-auto">{{ i.name }}</span>
                                                <b-badge variant="success" class="ml-1" v-b-tooltip:top
                                                         :title="$t('Import_Supported')"><i
                                                    class="fas fa-file-import fa-fw" v-if="i.import"></i></b-badge>
                                                <b-badge variant="warning" class="ml-1 text-muted" v-b-tooltip:top
                                                         :title="$t('Import_Not_Yet_Supported')"><i
                                                    class="fas fa-file-import fa-fw" v-if="!i.import"></i></b-badge>
                                                <b-badge variant="success" class="ml-1" v-b-tooltip:top
                                                         :title="$t('Export_Supported')"><i
                                                    class="fas fa-file-export fa-fw" v-if="i.export"></i></b-badge>
                                                <b-badge variant="warning" class="ml-1 text-muted" v-b-tooltip:top
                                                         :title="$t('Export_Not_Yet_Supported')"><i
                                                    class="fas fa-file-export fa-fw" v-if="!i.export"></i></b-badge>
                                            </b-list-group-item>
                                        </b-list-group>
                                    </b-col>
                                </b-row>
                                <b-row class="mt-4">
                                    <b-col cols="12" md="6" lg="4" xl="3" v-for="i in INTEGRATIONS_WO" :value="i.id" v-bind:key="i.id"
                                           class="mt-1">
                                        <b-list-group>
                                            <b-list-group-item class="d-flex align-items-center" v-hover
                                                               style="cursor: pointer"
                                                               v-bind:class="{ 'bg-success': recipe_app === i.id }"
                                                               @click="recipe_app = i.id">
                                                <b-avatar class="mr-3"><i :class="i.icon"
                                                                          v-if="i.img_src === undefined"></i><img
                                                    :src="i.img_src" v-if="i.img_src !== undefined" alt="Icon">
                                                </b-avatar>
                                                <span class="mr-auto">{{ i.name }}</span>
                                                <b-badge variant="success" class="ml-1" v-b-tooltip:top
                                                         :title="$t('Import_Supported')"><i
                                                    class="fas fa-file-import fa-fw" v-if="i.import"></i></b-badge>
                                                <b-badge variant="warning" class="ml-1 text-muted" v-b-tooltip:top
                                                         :title="$t('Import_Not_Yet_Supported')"><i
                                                    class="fas fa-file-import fa-fw" v-if="!i.import"></i></b-badge>
                                                <b-badge variant="success" class="ml-1" v-b-tooltip:top
                                                         :title="$t('Export_Supported')"><i
                                                    class="fas fa-file-export fa-fw" v-if="i.export"></i></b-badge>
                                                <b-badge variant="warning" class="ml-1 text-muted" v-b-tooltip:top
                                                         :title="$t('Export_Not_Yet_Supported')"><i
                                                    class="fas fa-file-export fa-fw" v-if="!i.export"></i></b-badge>
                                            </b-list-group-item>
                                        </b-list-group>
                                    </b-col>
                                </b-row>
                                <b-row v-if="recipe_app_info !== undefined && recipe_app_info.help_url !== ''"
                                       class="mt-3">
                                    <b-col cols="12" class="text-center">
                                        {{ $t('Importer_Help') }} <a
                                        :href="recipe_app_info.help_url"> {{ $t('Documentation') }}</a>
                                    </b-col>
                                </b-row>

                                <b-form-checkbox v-model="import_duplicates" name="check-button" switch
                                                 style="margin-top: 1vh">
                                    {{ $t('import_duplicates') }}
                                </b-form-checkbox>


                                <b-form-file
                                    class="my-2"
                                    multiple
                                    size="lg"
                                    v-model="recipe_files"
                                    :placeholder="$t('Select_File')"
                                    drop-placeholder="Drop recipe files here...">
                                </b-form-file>
                                <div class="text-center">
                                    <b-button @click="importAppRecipe()" size="lg"
                                              id="id_btn_app"><i class="fas fa-file-archive"></i> {{ $t('Import') }}
                                    </b-button>
                                </div>
                            </b-container>
                        </b-tab>
                        <!-- Source Tab -->
                        <b-tab v-bind:title="$t('Source')">

                            <div class="input-group mt-4">
                                <b-textarea class="form-control input-group-append" v-model="source_data" rows=10
                                            :placeholder="$t('paste_json')" style="font-size: 12px">
                                </b-textarea>
                            </div>
                            <b-button class="mt-2" @click="loadRecipe('',false, undefined)" variant="primary"><i
                                class="fas fa-code"></i>
                                {{ $t('Import') }}
                            </b-button>

                        </b-tab>
                        <!-- Bookmarklet Tab -->
                        <b-tab v-bind:title="$t('Bookmarklet')">
                            <b-container>
                                <b-row class="mt-4">
                                    <b-col cols="12">
                                        <!-- TODO localize -->
                                        Some pages cannot be imported from their URL, the Bookmarklet can be used to
                                        import from
                                        some of them anyway.<br/>
                                        1. Drag the following button to your bookmarks bar: <br/> <a
                                        class="btn btn-outline-info btn-sm"
                                        :href="makeBookmarklet()">Import into
                                        Tandoor</a> <br/>

                                        2. Open the page you want to import from <br/>
                                        3. Click on the bookmark to perform the import <br/>
                                    </b-col>
                                </b-row>
                            </b-container>
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

import {
    RandomIconMixin,
    resolveDjangoStatic,
    resolveDjangoUrl,
    ResolveUrlMixin,
    StandardToasts,
    ToastMixin
} from "@/utils/utils";

import axios from "axios";
import {ApiApiFactory} from "@/utils/openapi/api";
import {INTEGRATIONS} from "@/utils/integration";
import ImportViewStepEditor from "@/apps/ImportView/ImportViewStepEditor";
import RecipeCard from "@/components/RecipeCard";
import LoadingSpinner from "@/components/LoadingSpinner";

Vue.use(BootstrapVue)

export default {
    name: 'ImportView',
    mixins: [
        ResolveUrlMixin,
        ToastMixin,
        RandomIconMixin
    ],
    components: {
        LoadingSpinner,
        RecipeCard,
        ImportViewStepEditor
    },
    computed: {
        recipe_app_info: function () {
            return this.INTEGRATIONS.filter(x => x.id === this.recipe_app)[0]
        },
        INTEGRATIONS_WO: function () {
            return this.INTEGRATIONS.filter((int) => {
                return int.id !== "DEFAULT"
            })

        },
        INTEGRATIONS_TD: function () {
            return this.INTEGRATIONS.filter((int) => {
                return int.id === "DEFAULT"
            })
        }
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
            duplicateWarning: '',
            website_url: '',
            website_url_list: '',
            import_multiple: false,
            recent_urls: [],
            source_data: '',
            recipe_json: undefined,
            use_plural: false,
            import_loading: false,
            // recipe_html: undefined,
            // recipe_tree: undefined,
            recipe_images: [],
            imported_recipes: [],
            failed_imports: [],
            // App Import
            INTEGRATIONS: INTEGRATIONS,
            recipe_app: undefined,
            import_duplicates: false,
            recipe_files: [],
            loading: false,
            empty_input: false,
            edit_name: false,
            // Bookmarklet
            BOOKMARKLET_CODE: window.BOOKMARKLET_CODE,
            error: undefined
        }
    },
    mounted() {
        let local_storage_recent = JSON.parse(window.localStorage.getItem(this.LS_IMPORT_RECENT))
        this.recent_urls = local_storage_recent !== null ? local_storage_recent : []
        this.tab_index = 0 //TODO add ability to pass open tab via get parameter

        if (window.BOOKMARKLET_IMPORT_ID !== -1) {
            this.loadRecipe('', false, window.BOOKMARKLET_IMPORT_ID)
        }
        this.INTEGRATIONS.forEach((int) => {
            int.icon = this.getRandomFoodIcon()
        })
        let apiClient = new ApiApiFactory()
        apiClient.retrieveSpace(window.ACTIVE_SPACE_ID).then(r => {
            this.use_plural = r.data.use_plural
        })

        let urlParams = new URLSearchParams(window.location.search)

        if (urlParams.has("url")) {
            this.website_url = urlParams.get('url')
            this.loadRecipe(this.website_url)
        }
        if (urlParams.has("text")) {
            this.website_url = urlParams.get('text')
            this.loadRecipe(this.website_url)
        }
    },
    methods: {
        /**
         * Import recipe based on the data configured by the client
         * @param action: action to perform after import (options are: edit, view, import)
         * @param data: if parameter is passed ignore global application state and import form data variable
         * @param silent do not show any messages for imports
         */
        importRecipe: function (action, data, silent) {
            this.import_loading = true
            if (this.recipe_json !== undefined) {
                this.$set(this.recipe_json, 'keywords', this.recipe_json.keywords.filter(k => k.show))
            }

            let apiFactory = new ApiApiFactory()
            let recipe_json = data !== undefined ? data : this.recipe_json
            if (recipe_json !== undefined) {
                apiFactory.createRecipe(recipe_json).then(response => { // save recipe
                    let recipe = response.data
                    apiFactory.imageRecipe(response.data.id, undefined, recipe_json.image).then(response => { // save recipe image
                        if (!silent) {
                            StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_CREATE)
                        }
                        this.afterImportAction(action, recipe)
                    }).catch(e => {
                        if (!silent) {
                            StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE)
                        }
                        this.afterImportAction(action, recipe)
                    })
                }).catch(err => {
                    if (recipe_json.source_url !== '') {
                        this.failed_imports.push(recipe_json.source_url)
                    }
                    this.import_loading = false
                    if (!silent) {
                        StandardToasts.makeStandardToast(this, StandardToasts.FAIL_CREATE)
                    }
                })
            } else {
                console.log('cant import recipe without data')
                this.import_loading = false
                if (!silent) {
                    StandardToasts.makeStandardToast(this, StandardToasts.FAIL_CREATE)
                }
            }
        },
        /**
         * Action performed after URL import
         * @param action: action to perform after import
         *                edit: edit imported recipe
         *                view: view imported recipe
         *                import: restart the importer
         *                nothing: do nothing
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
                case 'multi_import':
                    this.imported_recipes.push(recipe)
                    break;
                case 'nothing':
                    this.import_loading = false
                    break;
            }
        },
        /**
         * Requests the recipe to be loaded form the source (url/data) from the server
         * Updates all variables to contain what they need to render either simple preview or manual mapping mode
         * @param url url to import (optional, empty string for bookmarklet imports)
         * @param silent do not open the options tab after loading the recipe
         * @param bookmarklet id of bookmarklet import to load instead of url, default undefined
         */
        loadRecipe: function (url, silent, bookmarklet) {
            // keep list of recently imported urls
            if (url !== '') {
                if (this.recent_urls.length > 5) {
                    this.recent_urls.pop()
                }
                if (this.recent_urls.filter(x => x === url).length === 0) {
                    this.recent_urls.push(url)
                }
                window.localStorage.setItem(this.LS_IMPORT_RECENT, JSON.stringify(this.recent_urls))
            }

            if (url === '' && bookmarklet === undefined && this.source_data === '') {
                this.empty_input = true
                setTimeout(() => {
                    this.empty_input = false
                }, 1000)
                return
            }

            if (!silent) {
                this.loading = true
            }

            // reset all variables
            // this.recipe_html = undefined
            this.recipe_json = undefined
            // this.recipe_tree = undefined
            this.recipe_images = []

            // load recipe
            let payload = {
                'url': url,
                'data': this.source_data,
            }

            if (bookmarklet !== undefined) {
                payload['bookmarklet'] = bookmarklet
            }

            return axios.post(resolveDjangoUrl('api_recipe_from_source'), payload,).then((response) => {
                if (response.status === 201 && 'link' in response.data) {
                    window.location = response.data.link
                    return
                }

                if ('duplicate' in response.data && response.data['duplicate']) {
                    this.duplicateWarning = "A recipe with this URL already exists.";
                } else {
                    this.duplicateWarning = "";
                }

                this.loading = false
                this.recipe_json = response.data['recipe_json'];

                this.recipe_json.keywords.map(x => {
                    if (x.id === undefined) {
                        x.show = false
                    } else {
                        x.show = true
                    }
                    return x
                })

                // this.recipe_tree = response.data['recipe_tree'];
                // this.recipe_html = response.data['recipe_html'];
                this.recipe_images = response.data['recipe_images'] !== undefined ? response.data['recipe_images'] : [];

                if (!silent) {
                    this.tab_index = 0 // open tab 0 with import wizard
                    this.collapse_visible.options = true // open options collapse
                }
                return this.recipe_json
            }).catch((err) => {
                this.loading = false
                if (url !== '') {
                    this.failed_imports.push(url)
                }
                StandardToasts.makeStandardToast(this, StandardToasts.FAIL_IMPORT, err)
            })
        },
        /**
         * Function to automatically import multiple urls
         * Takes input from website_url_list
         */
        autoImport: function () {
            this.collapse_visible.import = true
            let url_list = this.website_url_list.split('\n').filter(x => x.trim() !== '')
            if (url_list.length > 0) {
                let url = url_list.shift()
                this.website_url_list = url_list.join('\n')


                this.loadRecipe(url, true, undefined).then((recipe_json) => {
                    this.importRecipe('multi_import', recipe_json, true)
                    setTimeout(() => {
                        this.autoImport()
                    }, 2000)
                }).catch((err) => {

                })
            } else {
                this.import_loading = false
                this.loading = false
            }


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
                StandardToasts.makeStandardToast(this, StandardToasts.FAIL_IMPORT, err)
            })
        },
        /**
         * Handles pasting URLs
         */
        onURLPaste: function (evt) {
            this.loadRecipe(evt.clipboardData.getData('text'), false, undefined)
            return true;
        },
        /**loadRecipe(false,undefined)
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
                `document.body.appendChild(document.createElement("script")).src="${localStorage.getItem('BASE_PATH')}${resolveDjangoStatic('/js/bookmarklet_v3.js')}?r="+Math.floor(Math.random()*999999999)}` +
                `})()`
        },
    },
    directives: {
        hover: {
            inserted: function (el) {
                el.addEventListener("mouseenter", () => {
                    el.classList.add("shadow")
                })
                el.addEventListener("mouseleave", () => {
                    el.classList.remove("shadow")
                })
            },
        },
    },
}

</script>

<style>

.warning {
  color: rgb(255, 149, 0);
  align-items: center;
  background-color: #fff4ec;
  padding: 10px;
  border: 1px solid rgb(255, 149, 0);
  border-radius: 5px;
  margin: 10px 0;
}

.bounce {
    animation: bounce 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    transform: translate3d(0, 0, 0);
}

@keyframes bounce {
    10%,
    90% {
        transform: translate3d(-1px, 0, 0);
    }

    20%,
    80% {
        transform: translate3d(2px, 0, 0);
    }

    30%,
    50%,
    70% {
        transform: translate3d(-4px, 0, 0);
    }

    40%,
    60% {
        transform: translate3d(4px, 0, 0);
    }
}

.scrolling-wrapper-flexbox {
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
}

.wrapper-card {
    flex: 0 0 auto;
    margin-right: 3px;
}
</style>
