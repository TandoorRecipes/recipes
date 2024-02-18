<template>
    <div id="app" class="books col-12 col-xl-8 col-lg-10 offset-xl-2 offset-lg-1 offset">
        <div class="col-12 col-xl-8 col-lg-10 offset-xl-2 offset-lg-1">
            <div class="row">
                <div class="col col-md-12">
                    <div class="row justify-content-center">
                        <div class="col-12 col-lg-10 mt-3 mb-3">
                            <b-input-group>
                                <b-input class="form-control form-control-lg form-control-borderless form-control-search" v-model="search" v-bind:placeholder="$t('Search')"></b-input>
                                <b-input-group-append>
                                    <b-button variant="primary" v-b-tooltip.hover :title="$t('Create')" @click="createNew">
                                        <i class="fas fa-plus"></i>
                                    </b-button>
                                    <b-dropdown variant="primary" id="sortDropDown" text="Order By"  class="border-left">
                                        <b-dropdown-item @click = "orderBy('id','asc')"   :disabled= "isActiveSort('id','asc')">oldest to newest</b-dropdown-item>
                                        <b-dropdown-item @click = "orderBy('id','desc')"  :disabled= "isActiveSort('id','desc')">newest to oldest</b-dropdown-item>
                                        <b-dropdown-item @click = "orderBy('name','asc')" :disabled= "isActiveSort('name','asc')">alphabetical order</b-dropdown-item>
                                        <b-dropdown-item @click = "orderBy('order','asc')"   :disabled= "isActiveSort('order','asc')" >manually</b-dropdown-item>
                                    </b-dropdown>
                                </b-input-group-append>
                                <b-button class= "ml-2" variant="primary" v-if="isActiveSort('order','asc')" @click="handleEditButton" >
                                    {{submitText}}
                                </b-button>
                            </b-input-group>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="!isActiveSort('order','asc') || !manSubmitted">
            <div style="padding-bottom: 55px">
                <div class="mb-3" v-for="(book) in filteredBooks" :key="book.id">
                <div class="row">
                    <div class="col-md-12"> 
                        <b-card class="d-flex flex-column" v-hover  > 
                            <b-row no-gutters style="height: inherit" class="d-flex align-items-center">
                                <b-col no-gutters style="height: inherit">
                                    <b-card-body class="m-0 py-0" style="height: inherit">
                                        <b-card-text class="h-100 my-0 d-flex flex-column" style="text-overflow: ellipsis">
                                            <b-button  v-on:click="openBook(book.id)"  style="color: #000; background-color: white" variant="primary">                                        
                                                <h5 class="m-0 mt-1 text-truncate" >
                                                {{ book.name }} <span class="float-right"><i class="fa fa-book"></i></span>
                                                </h5></b-button>
                                            <div class="m-0 text-truncate">{{ book.description }}</div>
                                            <div class="mt-auto mb-1 d-flex flex-row justify-content-end"></div>
                                        </b-card-text>
                                    </b-card-body>
                                </b-col>
                            </b-row>
                        </b-card>
                    </div>
                </div>

                <loading-spinner v-if="current_book === book.id && loading"></loading-spinner>
                <transition name="slide-fade">
                    <cookbook-slider
                        :recipes="recipes"
                        :book="book"
                        :key="`slider_${book.id}`"
                        v-if="current_book === book.id && !loading"
                        v-on:refresh="refreshData"
                        @reload="openBook(current_book, true)"
                    ></cookbook-slider>
                </transition>

                </div>
            </div>
        </div>    
        <div v-else>
         <draggable 
         @change="updateManualSorting"
         :list="cookbooks" ghost-class="ghost">     
            <b-card no-body class="mt-1 list-group-item p-2"
                    style="cursor: move"
                    v-for=" (book,index) in filteredBooks"
                    v-hover
                    :key="book.id">
                <b-card-header class="p-2 border-0">
                    <div class="row">
                        <div class="col-2">
                            <button type="button"
                                    class="btn btn-lg shadow-none"><i
                                class="fas fa-arrows-alt-v"></i></button>
                        </div>
                        <div class="col-10">
                            <h5 class="mt-1 mb-1">
                                <b-badge class="float-left text-white mr-2">
                                    #{{ index + 1 }}
                                </b-badge>
                                {{ book.name }}
                            </h5>
                        </div>
                    </div>
                </b-card-header>
            </b-card>
        </draggable>
        </div>

        <bottom-navigation-bar active-view="view_books">
            <template #custom_create_functions>
                <div class="dropdown-divider" ></div>
                <h6 class="dropdown-header">{{ $t('Books')}}</h6>

                <a class="dropdown-item" @click="createNew()"><i
                                class="fa fa-book"></i> {{$t("Create")}}</a>

            </template>
        </bottom-navigation-bar>
    </div>
</template>

<script>
import Vue from "vue"
import { BootstrapVue } from "bootstrap-vue"
import draggable from "vuedraggable"
import "bootstrap-vue/dist/bootstrap-vue.css"
import { ApiApiFactory } from "@/utils/openapi/api"
import CookbookSlider from "@/components/CookbookSlider"
import LoadingSpinner from "@/components/LoadingSpinner"
import { StandardToasts, ApiMixin } from "@/utils/utils"
import BottomNavigationBar from "@/components/BottomNavigationBar.vue";

Vue.use(BootstrapVue)

export default {
    name: "CookbookView",
    mixins: [ApiMixin],
    components: { LoadingSpinner, CookbookSlider, BottomNavigationBar, draggable },
    data() {
        return {
            cookbooks: [],
            book_background: window.IMAGE_BOOK,
            recipes: [],
            current_book: undefined,
            loading: false,
            search: "",
            activeSortField : 'id',
            activeSortDirection: 'desc',
            inputValue: "",
            manSubmitted : false,
            submitText: "Edit"
        }
    },
    computed: {
        filteredBooks: function () {
            return this.cookbooks.filter((book) => {
                return book.name.toLowerCase().includes(this.search.toLowerCase())
            })
        },
    },
    mounted() {
        this.refreshData()
        this.$i18n.locale = window.CUSTOM_LOCALE
    },
    methods: {
        refreshData: function () {
            let apiClient = new ApiApiFactory()
            
            apiClient.listRecipeBooks().then((result) => {
                this.cookbooks = result.data
            })
        },
        openBook: function (book, keepopen = false) {
            if (book === this.current_book && !keepopen) {
                this.current_book = undefined
                this.recipes = []
                return
            }
            this.loading = true
            let apiClient = new ApiApiFactory()

            this.current_book = book
            const book_contents = this.cookbooks.filter((b) => {
                return b.id == book
            })[0]

            apiClient.listRecipeBookEntrys({ query: { book: book } }).then((result) => {
                this.recipes = result.data
                if (book_contents.filter) this.appendRecipeFilter(1, book_contents)
                this.loading = false
            })
        },
        createNew: function () {
            let apiClient = new ApiApiFactory()

            apiClient
                .createRecipeBook({ name: this.$t("New_Cookbook"), description: "", shared: [] })
                .then((result) => {
                    let new_book = result.data
                    this.refreshData()
                    StandardToasts.makeStandardToast(this,StandardToasts.SUCCESS_CREATE)
                })
                .catch((err) => {
                    StandardToasts.makeStandardToast(this,StandardToasts.FAIL_CREATE, err)
                })
        },
        appendRecipeFilter: function (page, book) {
            let params = { page: page, options: { query: { filter: book.filter.id } } }
            this.genericAPI(this.Models.RECIPE, this.Actions.LIST, params).then((results) => {
                let recipes = results.data.results.map((x) => {
                    return {
                        id: (Math.random() * 1999) ^ 1999,
                        book: book.id,
                        book_content: book,
                        recipe: x.id,
                        recipe_content: x,
                    }
                })

                this.recipes.push(...recipes)
                if (results.data.next) {
                    this.appendRecipeFilter(page + 1, book)
                }
            })
        },
        orderBy: function(order_field,order_direction){
            let apiClient = new ApiApiFactory()
            const options = {
                order_field: order_field,
                order_direction: order_direction
            }
            this.activeSortField = order_field
            this.activeSortDirection = order_direction
            apiClient.listRecipeBooks(options).then((result) => {
                this.cookbooks = result.data
            })
        },
        isActiveSort: function(field, direction) {
        // Check if the current item is the active sorting option
        return this.activeSortField === field && this.activeSortDirection === direction;
        },
        handleEditButton: function(){
            if (!this.manSubmitted){
                this.submitText = "Back"
                this.manSubmitted = true
            } else {
                this.submitText = "Edit"
                this.manSubmitted = false
            }
        },
        updateManualSorting: function(){
                let old_order = Object.assign({}, this.cookbooks);
                let promises = []
                this.cookbooks.forEach((element, index) => {
                    let apiClient = new ApiApiFactory()
                    promises.push(apiClient.partialUpdateManualOrderBooks(element.id, {order: index}))
                })
                return Promise.all(promises).then(() => {
                }).catch((err) => {
                    this.cookbooks = old_order
                    StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
                })
        }
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
.slide-fade-enter-active {
    transition: all 0.6s ease;
}

.slide-fade-enter, .slide-fade-leave-to
  /* .slide-fade-leave-active below version 2.1.8 */ {
    transform: translateX(10px);
    opacity: 0;
}
</style>
