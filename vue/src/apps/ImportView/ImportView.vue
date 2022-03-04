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

                                        Steps
                                        <div class="row">
                                            <div class="col col-md-12">
                                                <b-button @click="splitAllSteps('\n')" variant="secondary"><i class="far fa-object-ungroup"></i> All</b-button>
                                                <b-button @click="mergeAllSteps()" variant="primary"><i class="far fa-object-group"></i> all</b-button>
                                            </div>
                                        </div>
                                        <div class="row mt-2" v-for="(s, index) in recipe_json.steps"
                                             v-bind:key="index">
                                            <div class="col col-md-4">
                                                <draggable :list="s.ingredients" group="ingredients"
                                                           :empty-insert-threshold="10">
                                                    <b-list-group-item v-for="i in s.ingredients"
                                                                       v-bind:key="i.original_text"><i
                                                        class="far fa-arrows"></i> {{ i.original_text }}
                                                    </b-list-group-item>
                                                </draggable>
                                            </div>
                                            <div class="col col-md-8">
                                                <b-input-group>
                                                    <b-textarea
                                                        style="white-space: pre-wrap" v-model="s.instruction"
                                                        max-rows="10"></b-textarea>
                                                    <b-input-group-append>
                                                        <b-button variant="secondary" @click="splitStep(s,'\n')"><i class="far fa-object-ungroup"></i></b-button>
                                                        <b-button variant="danger"
                                                            @click="recipe_json.steps.splice(recipe_json.steps.findIndex(x => x === s),1)">
                                                            <i class="fas fa-trash-alt"></i>
                                                        </b-button>

                                                    </b-input-group-append>
                                                </b-input-group>


                                                <b-button @click="mergeStep(s)" variant="primary"
                                                          v-if="index + 1 < recipe_json.steps.length"><i class="far fa-object-group"></i>
                                                </b-button>

                                                <b-button variant="success"
                                                    @click="recipe_json.steps.splice(recipe_json.steps.findIndex(x => x === s) +1,0,{ingredients:[], instruction: ''})">
                                                    <i class="fas fa-plus"></i>
                                                </b-button>


                                            </div>
                                        </div>

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
                                    <b-card-body>


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
                                    <b-card-body>

                                        <b-button-group>
                                            <b-button disabled>Import & View</b-button>
                                            <b-button @click="importRecipe()">Import & Edit</b-button>
                                            <b-button disabled>Import & start new import</b-button>
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
                            <!-- TODO get code for bookmarklet -->
                            <!-- TODO localize -->
                            Some pages cannot be imported from their URL, the Bookmarklet can be used to import from
                            some of them anyway.
                            1. Drag the following button to your bookmarks bar <a class="btn btn-outline-info btn-sm"
                                                                                  href="#"> Bookmark Text </a>
                            2. Open the page you want to import from
                            3. Click on the bookmark to perform the import
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
import {INTEGRATIONS} from "@/utils/integration";

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
            recipe_data: undefined,
            recipe_tree: undefined,
            recipe_images: [],
            // App Import
            INTEGRATIONS: INTEGRATIONS,
            recipe_app: undefined,
            import_duplicates: false,
            recipe_files: [],

        }
    },
    mounted() {
        let local_storage_recent = JSON.parse(window.localStorage.getItem(this.LS_IMPORT_RECENT))
        this.recent_urls = local_storage_recent !== null ? local_storage_recent : []
        this.tab_index = 0 //TODO add ability to pass open tab via get parameter
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
         * utility function used by splitAllSteps and splitStep to split a single step object into multiple step objects
         * @param step: single step
         * @param split_character: character to split steps at
         * @return array of step objects
         */
        splitStepObject: function (step, split_character) {
            let steps = []
            step.instruction.split(split_character).forEach(part => {
                if (part.trim() !== '') {
                    steps.push({'instruction': part, 'ingredients': []})
                }
            })
            steps[0].ingredients = step.ingredients // put all ingredients from the original step in the ingredients of the first step of the split step list
            return steps
        },
        /**
         * Splits all steps of a given recipe at the split character (e.g. \n or \n\n)
         * @param split_character: character to split steps at
         */
        splitAllSteps: function (split_character) {
            let steps = []
            this.recipe_json.steps.forEach(step => {
                steps = steps.concat(this.splitStepObject(step, split_character))
            })
            this.recipe_json.steps = steps
        },
        /**
         * Splits the given step at the split character (e.g. \n or \n\n)
         * @param step: step ingredients to split
         * @param split_character: character to split steps at
         */
        splitStep: function (step, split_character) {
            let old_index = this.recipe_json.steps.findIndex(x => x === step)
            let new_steps = this.splitStepObject(step, split_character)
            this.recipe_json.steps.splice(old_index, 1, ...new_steps)
        },
        /**
         * Merge all steps of a given recipe into one
         */
        mergeAllSteps: function () {
            let step = {'instruction': '', 'ingredients': []}
            this.recipe_json.steps.forEach(s => {
                step.instruction += s.instruction + '\n'
                step.ingredients = step.ingredients.concat(s.ingredients)
            })
            this.recipe_json.steps = [step]
        },
        /**
         * Merge two steps (the given and next one)
         */
        mergeStep: function (step) {
            let step_index = this.recipe_json.steps.findIndex(x => x === step)
            let removed_steps = this.recipe_json.steps.splice(step_index, 2)

            this.recipe_json.steps.splice(step_index, 0, {
                'instruction': removed_steps.flatMap(x => x.instruction).join('\n'),
                'ingredients': removed_steps.flatMap(x => x.ingredients)
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
