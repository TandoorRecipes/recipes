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
                                <div class="col col-md-6" v-if="recipe_json !== undefined">
                                    <div >
                                        <!-- start of preview card -->
                                        <div class="card card-border-primary">
                                            <div class="card-header">
                                                <h3>Recipe Preview</h3> <!-- TODO localize -->
                                                <div class='small text-muted'>Drag recipe attributes from the
                                                    right into the appropriate box below.
                                                </div>
                                            </div>
                                            <div class="card-body p-2">
                                                <div class="card mb-2">
                                                    <div class="card-header" v-b-toggle.collapse-name>
                                                        <div class="row px-3" style="justify-content:space-between;">
                                                             Name
                                                            <i class="fas fa-eraser" style="cursor:pointer;"
                                                               @click="recipe_json.name=''"
                                                               title="{% trans 'Clear Contents' %}"></i>
                                                        </div>
                                                        <div class="small text-muted">Text dragged here will
                                                            be appended to the name.
                                                        </div>
                                                    </div>
                                                    <b-collapse id="collapse-name" visible class="mt-2">
                                                        <div class="card-body drop-zone"
                                                             @drop="replacePreview('name', $event)"
                                                             @dragover.prevent @dragenter.prevent>
                                                            <div class="card-text">{{recipe_json.name}}</div>
                                                        </div>
                                                    </b-collapse>
                                                </div>

                                                <div class="card mb-2">
                                                    <div class="card-header" v-b-toggle.collapse-description>
                                                        <div class="row px-3" style="justify-content:space-between;">
                                                            {% trans 'Description' %}
                                                            <i class="fas fa-eraser" style="cursor:pointer;"
                                                               @click="recipe_json.description=''"
                                                               title="{% trans 'Clear Contents' %}"></i>
                                                        </div>
                                                        <div class="small text-muted">{% trans 'Text dragged here will
                                                            be appended to the description.' %}
                                                        </div>
                                                    </div>
                                                    <b-collapse id="collapse-description" visible class="mt-2">
                                                        <div class="card-body drop-zone"
                                                             @drop="replacePreview('description', $event)"
                                                             @dragover.prevent @dragenter.prevent>
                                                            <div class="card-text">{{recipe_json.description}}</div>
                                                        </div>
                                                    </b-collapse>
                                                </div>

                                                <div class="card mb-2">
                                                    <div class="card-header" v-b-toggle.collapse-kw>
                                                        <div class="row px-3" style="justify-content:space-between;">
                                                            {% trans 'Keywords' %}
                                                            <i class="fas fa-eraser" style="cursor:pointer;"
                                                               @click="recipe_json.keywords=[]"
                                                               title="{% trans 'Clear Contents' %}"></i>
                                                        </div>
                                                        <div class="small text-muted">{% trans 'Keywords dragged here
                                                            will be appended to current list' %}
                                                        </div>
                                                    </div>
                                                    <b-collapse id="collapse-kw" visible class="mt-2">
                                                        <div class="card-body drop-zone"
                                                             @drop="replacePreview('keywords', $event)"
                                                             @dragover.prevent @dragenter.prevent>
                                                            <div v-for="kw in recipe_json.keywords" v-bind:key="kw.id">
                                                                <div class="card-text">{{ kw.text }}</div>
                                                            </div>
                                                        </div>
                                                    </b-collapse>
                                                </div>

                                                <div class="card mb-2">
                                                    <div class="card-header" v-b-toggle.collapse-image
                                                         style="display:flex; justify-content:space-between;">
                                                        {% trans 'Image' %}
                                                        <i class="fas fa-eraser" style="cursor:pointer;"
                                                           @click="recipe_json.image=''"
                                                           title="{% trans 'Clear Contents' %}"></i>
                                                    </div>
                                                    <b-collapse id="collapse-image" visible class="mt-2">
                                                        <div class="card-body m-0 p-0 drop-zone"
                                                             @drop="replacePreview('image', $event)"
                                                             @dragover.prevent @dragenter.prevent>
                                                            <img class="card-img" v-bind:src="recipe_json.image"
                                                                 alt="Recipe Image">
                                                        </div>
                                                    </b-collapse>
                                                </div>

                                                <div class="row mb-2">
                                                    <div class="col">
                                                        <div class="card">
                                                            <div class="card-header p-1"
                                                                 style="display:flex; justify-content:space-between;">
                                                                {% trans 'Servings' %}
                                                                <i class="fas fa-eraser" style="cursor:pointer;"
                                                                   @click="recipe_json.servings=''"
                                                                   title="{% trans 'Clear Contents' %}"></i>
                                                            </div>
                                                            <div class="card-body p-2 drop-zone"
                                                                 @drop="replacePreview('servings', $event)"
                                                                 @dragover.prevent @dragenter.prevent>
                                                                <div class="card-text">{{recipe_json.servings}}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="col">
                                                        <div class="card">
                                                            <div class="card-header p-1"
                                                                 style="display:flex; justify-content:space-between;">
                                                                {% trans 'Prep Time' %}
                                                                <i class="fas fa-eraser" style="cursor:pointer;"
                                                                   @click="recipe_json.prepTime=''"
                                                                   title="{% trans 'Clear Contents' %}"></i>
                                                            </div>
                                                            <div class="card-body p-2 drop-zone"
                                                                 @drop="replacePreview('prepTime', $event)"
                                                                 @dragover.prevent @dragenter.prevent>
                                                                <div class="card-text">{{recipe_json.prepTime}}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="col">
                                                        <div class="card">
                                                            <div class="card-header p-1"
                                                                 style="display:flex; justify-content:space-between;">
                                                                {% trans 'Cook Time' %}
                                                                <i class="fas fa-eraser" style="cursor:pointer;"
                                                                   @click="recipe_json.cookTime=''"
                                                                   title="{% trans 'Clear Contents' %}"></i>
                                                            </div>
                                                            <div class="card-body p-2 drop-zone"
                                                                 @drop="replacePreview('cookTime', $event)"
                                                                 @dragover.prevent @dragenter.prevent>
                                                                <div class="card-text">{{recipe_json.cookTime}}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div class="card mb-2">
                                                    <div class="card-header" v-b-toggle.collapse-ing>
                                                        <div class="row px-3"
                                                             style="display:flex; justify-content:space-between;">
                                                            {% trans 'Ingredients' %}
                                                            <i class="fas fa-eraser" style="cursor:pointer;"
                                                               @click="recipe_json.recipeIngredient=[]"
                                                               title="{% trans 'Clear Contents' %}"></i>
                                                        </div>
                                                        <div class="small text-muted">{% trans 'Ingredients dragged here
                                                            will be appended to current list.' %}
                                                        </div>
                                                    </div>
                                                    <b-collapse id="collapse-ing" visible class="mt-2">
                                                        <div class="card-body drop-zone"
                                                             @drop="replacePreview('ingredients', $event)"
                                                             @dragover.prevent @dragenter.prevent>
                                                            <ul class="list-group list-group">
                                                                <div v-for="i in recipe_json.recipeIngredient" v-bind:key="i.id">
                                                                    <li class="row border-light">
                                                                        <div class="col-sm-1 border">{{i.amount}}</div>
                                                                        <div class="col-sm border"> {{i.unit.text}}</div>
                                                                        <div class="col-sm border">
                                                                            {{i.ingredient.text}}
                                                                        </div>
                                                                        <div class="col-sm border">{{i.note}}</div>
                                                                    </li>
                                                                </div>
                                                            </ul>
                                                        </div>
                                                    </b-collapse>
                                                </div>

                                                <div class="card mb-2">
                                                    <div class="card-header" v-b-toggle.collapse-instructions>
                                                        <div class="row px-3" style="justify-content:space-between;">
                                                            {% trans 'Instructions' %}
                                                            <i class="fas fa-eraser" style="cursor:pointer;"
                                                               @click="recipe_json.recipeInstructions=''"
                                                               title="{% trans 'Clear Contents' %}"></i>
                                                        </div>
                                                        <div class="small text-muted">{% trans 'Recipe instructions
                                                            dragged here will be appended to current instructions.' %}
                                                        </div>
                                                    </div>
                                                    <b-collapse id="collapse-instructions" visible class="mt-2">
                                                        <div class="card-body drop-zone"
                                                             @drop="replacePreview('instructions', $event)"
                                                             @dragover.prevent @dragenter.prevent>
                                                            <div class="card-text">{{recipe_json.recipeInstructions}}
                                                            </div>
                                                        </div>
                                                    </b-collapse>
                                                </div>
                                            </div>
                                        </div>
                                        <br/>
                                        <!-- end of preview card -->
                                        <button @click="showRecipe()" class="btn btn-primary shadow-none" type="button"
                                                style="margin-bottom: 2vh"
                                                id="id_btn_json"><i class="fas fa-code"></i> {% trans 'Import' %}
                                        </button>
                                    </div>
                                </div>

                            </div>


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
            recipe_data: undefined,
            recipe_json: undefined,
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
                this.recipe_images = response.data['images']; //todo change on backend as well after old view is deprecated
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
