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
                                    <b-col cols="12" md="6" offset="0" offset-md="3">
                                        <b-button block v-b-toggle.id_accordion_url variant="info">Website</b-button>
                                    </b-col>
                                </b-card-header>
                                <b-collapse id="id_accordion_url" visible accordion="url_import_accordion"
                                            role="tabpanel" v-model="collapse_visible.url">
                                    <div class="row justify-content-center p-2">
                                        <div class="col-12 col-lg-10 col-xl-8 mt-3 mb-3">
                                            <div class="row justify-content-center">
                                                <div class="col-12 justify-content-cente">
                                                    <b-checkbox v-model="import_multiple" switch><span
                                                        v-if="import_multiple">Multiple Recipes</span><span
                                                        v-if="!import_multiple">Single Recipe</span></b-checkbox>
                                                </div>
                                            </div>
                                            <b-input-group class="mt-2" :class="{ bounce: empty_input }">
                                                <b-input
                                                    class="form-control form-control-lg form-control-borderless form-control-search"
                                                    v-model="website_url"
                                                    placeholder="Website URL" @paste="onURLPaste"></b-input>
                                                <b-input-group-append>
                                                    <b-button variant="primary" @click="loadRecipe(false,undefined)"
                                                              v-if="!import_multiple"><i
                                                        class="fas fa-search fa-fw"></i>
                                                    </b-button>
                                                    <b-button variant="primary"
                                                              @click="addWebsiteToURLList(website_url); website_url=''"
                                                              v-if="import_multiple"><i
                                                        class="fas fa-plus fa-fw"></i>
                                                    </b-button>
                                                </b-input-group-append>
                                            </b-input-group>

                                            <div class="row mt-2">
                                                <div class="col col-md-12">
                                                    <div v-if="!import_multiple">
                                                        <a href="#" @click="clearRecentImports()">Clear recent
                                                            imports</a>
                                                        <ul>
                                                            <li v-for="x in recent_urls" v-bind:key="x">
                                                                <a href="#"
                                                                   @click="website_url=x; loadRecipe(false, undefined)">{{
                                                                        x
                                                                    }}</a>
                                                            </li>
                                                        </ul>

                                                    </div>
                                                    <div v-if="import_multiple">
                                                        <a href="#" @click="website_url_list = []"
                                                           v-if="website_url_list.length > 0">Clear import list</a>
                                                        <ul>
                                                            <li v-for="x in website_url_list" v-bind:key="x">
                                                                {{ x }}
                                                            </li>
                                                        </ul>

                                                        <b-button class="float-right"
                                                                  :disabled="website_url_list.length < 1"
                                                                  @click="autoImport()">Import
                                                        </b-button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </b-collapse>
                            </b-card>

                            <!-- Loading -->
                            <b-card no-body v-if="loading">
                                <loading-spinner></loading-spinner>
                            </b-card>

                            <!-- OPTIONS -->
                            <b-card no-body v-if="recipe_json !== undefined">
                                <b-card-header header-tag="header" class="p-1" role="tab">
                                    <b-col cols="12" md="6" offset="0" offset-md="3">
                                        <b-button block v-b-toggle.id_accordion_add_options variant="info"
                                                  :disabled="recipe_json === undefined">Options
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
                                                <small class="text-muted">Click the image you want to import for this
                                                    recipe</small> <!-- TODO localize -->
                                                <span v-if="recipe_images.length === 0">No additional images found in source.</span>
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
                                                            <span class="float-left h5">Keywords</span>
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
                            <b-card no-body v-if="recipe_json !== undefined">
                                <b-card-header header-tag="header" class="p-1" role="tab">
                                    <b-col cols="12" md="6" offset="0" offset-md="3">
                                        <b-button block v-b-toggle.id_accordion_import variant="info"
                                                  :disabled="recipe_json === undefined">Import
                                        </b-button>
                                    </b-col>
                                </b-card-header>
                                <b-collapse id="id_accordion_import" visible accordion="url_import_accordion"
                                            role="tabpanel" v-model="collapse_visible.import">
                                    <b-card-body class="text-center">
                                        <b-row>
                                            <b-col cols="12" md="6" xl="4" offset="0" offset-md="3" offset-xl="4">
                                                <recipe-card :recipe="recipe_json" :detailed="false"
                                                             :show_context_menu="false"></recipe-card>
                                            </b-col>
                                        </b-row>
                                    </b-card-body>
                                    <b-card-footer class="text-center">
                                        <b-button-group>
                                            <b-button @click="importRecipe('view')">Import & View</b-button>
                                            <b-button @click="importRecipe('edit')" variant="success">Import & Edit
                                            </b-button>
                                            <b-button @click="importRecipe('import')">Import & Restart
                                            </b-button>
                                        </b-button-group>
                                    </b-card-footer>
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

                            <a href="recipe_app_info.help_url"
                               v-if="recipe_app_info !== undefined && recipe_app_info.help_url !== ''">{{
                                    $t('Help')
                                }}</a>

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
                            <b-button @click="loadRecipe(false, undefined)" variant="primary"><i
                                class="fas fa-code"></i>
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
            website_url_list: [
                'https://madamedessert.de/schokoladenpudding-rezept-mit-echter-schokolade/',
                'https://www.essen-und-trinken.de/rezepte/58294-rzpt-schokoladenpudding',
                'https://www.chefkoch.de/rezepte/1825781296124455/Schokoladenpudding-selbst-gemacht.html'
            ],
            import_multiple: false,
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
            loading: false,
            empty_input: false,
            edit_name: false,
            // Bookmarklet
            BOOKMARKLET_CODE: window.BOOKMARKLET_CODE
        }
    },
    mounted() {
        let local_storage_recent = JSON.parse(window.localStorage.getItem(this.LS_IMPORT_RECENT))
        this.recent_urls = local_storage_recent !== null ? local_storage_recent : []
        this.tab_index = 0 //TODO add ability to pass open tab via get parameter

        if (window.BOOKMARKLET_IMPORT_ID !== -1) {
            this.loadRecipe(false, window.BOOKMARKLET_IMPORT_ID)
        }
    },
    methods: {
        /**
         * Import recipe based on the data configured by the client
         * @param action: action to perform after import (options are: edit, view, import)
         * @param data: if parameter is passed ignore global application state and import form data variable
         */
        importRecipe: function (action, data) {
            this.$set(this.recipe_json, 'keywords', this.recipe_json.keywords.filter(k => k.show))

            let apiFactory = new ApiApiFactory()
            let recipe_json = data !== undefined ? data : this.recipe_json
            apiFactory.createRecipe(recipe_json).then(response => { // save recipe
                let recipe = response.data
                apiFactory.imageRecipe(response.data.id, undefined, recipe_json.image).then(response => { // save recipe image
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
                case 'nothing':
                    break;
            }
        },
        /**
         * Requests the recipe to be loaded form the source (url/data) from the server
         * Updates all variables to contain what they need to render either simple preview or manual mapping mode
         * @param silent do not open the options tab after loading the recipe
         * @param bookmarklet id of bookmarklet import to load instead of url, default undefined
         */
        loadRecipe: function (silent, bookmarklet) {
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

            if (this.website_url === '' && bookmarklet === undefined) {
                this.empty_input = true
                setTimeout(() => {
                    this.empty_input = false
                }, 1000)
                return
            }

            this.loading = true

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

            return axios.post(resolveDjangoUrl('api_recipe_from_source'), payload,).then((response) => {
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

                this.recipe_tree = response.data['recipe_tree'];
                this.recipe_html = response.data['recipe_html'];
                this.recipe_images = response.data['recipe_images'] !== undefined ? response.data['recipe_images'] : [];

                if (!silent) {
                    this.tab_index = 0 // open tab 0 with import wizard
                    this.collapse_visible.options = true // open options collapse
                }
                return this.recipe_json
            }).catch((err) => {
                StandardToasts.makeStandardToast(StandardToasts.FAIL_FETCH, err.response.data.msg)
            })
        },
        /**
         * Function to automatically import multiple urls
         * Takes input from website_url_list
         */
        autoImport: function () {
            this.website_url_list.forEach(r => {
                this.website_url = r
                this.loadRecipe(true, undefined).then((recipe_json) => {
                    this.importRecipe('nothing', recipe_json) //TODO handle feedback of what was imported and what not
                })
            })
            this.website_url_list = []
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
         * Adds Website to url list, prevents duplicates
         */
        addWebsiteToURLList: function (url) {
            if (this.website_url_list.indexOf(url) === -1 && url !== '') {
                this.website_url_list.push(url)
            }
        },
        /**
         * Handles pasting URLs
         */
        onURLPaste: function (evt) {
            this.website_url = evt.clipboardData.getData('text')
            this.loadRecipe(false, undefined)
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
                `document.body.appendChild(document.createElement("script")).src="${localStorage.getItem('BASE_PATH')}${resolveDjangoStatic('/js/bookmarklet.js')}?r="+Math.floor(Math.random()*999999999)}` +
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
