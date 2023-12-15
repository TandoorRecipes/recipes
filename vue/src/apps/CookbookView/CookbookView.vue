<template>
    <div id="app" class="col-12 col-xl-8 col-lg-10 offset-xl-2 offset-lg-1 offset">
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
                                    <b-dropdown variant="primary" id="sortDropDown" :text= dropdown_text class="border-left">
                                        <b-dropdown-item @click = "sortOldest" v-show="showOtN">oldest to newest</b-dropdown-item>
                                        <b-dropdown-item @click = "sortNewest" v-show="showNtO">newest to oldest</b-dropdown-item>
                                        <b-dropdown-item @click = "sortAlphabetical" v-show="showAlp">alphabetical order</b-dropdown-item>
                                        <b-dropdown-item @click = " enableSortManually" v-show="showMan">manually</b-dropdown-item>
                                    </b-dropdown>
                                </b-input-group-append>
                                <b-button class= "ml-2" variant="primary" v-show="!showMan" @click="submitManualChanging">
                                    {{submitText}}
                                </b-button>
                            </b-input-group>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div style="padding-bottom: 55px">
            <div class="mb-3" v-for="(book, index) in filteredBooks" :key="book.id">
            <div class="row">
                <div class="col-md-12"> 
                    <b-card class="d-flex flex-column" v-hover  > 
                        <b-row no-gutters style="height: inherit" class="d-flex align-items-center">
                            <b-col no-gutters :md="md" style="height: inherit">
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
                            <b-col>
                                <b-button-group vertical md = "1" >
                                    <b-button  v-if="!showMan && index != 0 && submitManual "  variant="primary" style="border-radius:28px!important;"  @click= "swapUpBooks(index)">&uarr;</b-button>
                                    <b-button  v-if="!showMan && index != cookbooks.length-1 && submitManual"  variant="primary" style="border-radius:28px!important;"  @click= "swapDownBooks(index)">&darr;</b-button>
                                </b-button-group>
                                 <b-button-group vertical md = "1" class="ml-2">
                                    <input v-model.lazy="inputValue" v-if="!showMan && submitManual" placeholder="enter swap position">                      
                                    <b-button v-if="!showMan && submitManual" variant="primary"  style="border-radius:28px!important;"  @click= "swapWithPos(index)">swap</b-button>
                                </b-button-group>
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
    components: { LoadingSpinner, CookbookSlider, BottomNavigationBar },
    data() {
        return {
            cookbooks: [],
            book_background: window.IMAGE_BOOK,
            recipes: [],
            current_book: undefined,
            loading: false,
            search: "",
            dropdown_text: "Sort by: oldest to newest",
            showOtN: false,
            showNtO: true,
            showAlp: true,
            showMan: true,
            md: 12,
            inputValue: "",
            submitManual: false,
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
        sortAlphabetical: function(){
            this.dropdown_text = "Sort by: alphabetical order"
            this.cookbooks = this.cookbooks.sort((a, b) => a.name.localeCompare(b.name))
            this.showAlp=  false
            this.showNtO = true
            this.showOtN = true
            this.showMan = true
            this.submitManual = false
            this.md = 12

        },
        sortNewest: function(){
            this.dropdown_text = "Sort by: newest to oldest"
            this.cookbooks = this.cookbooks.sort((a, b) => b.id - a.id);
            this.showNtO = false
            this.showAlp=  true
            this.showOtN = true
            this.showMan = true
            this.submitManual = false
            this.md = 12
        },
        sortOldest: function(){
            this.dropdown_text = "Sort by: oldest to newest"
            this.cookbooks = this.cookbooks.sort((a, b) => a.id - b.id)
            this.showOtN=  false
            this.showAlp= true
            this.showNtO = true
            this.showMan = true
            this.submitManual = false
            this.md = 12
        },
        enableSortManually: function(){
            console.log(1)
            this.synchroniseLocalToDatabase();
            console.log(2)
            if (localStorage.getItem('cookbooks') ){
                this.cookbooks =  JSON.parse(localStorage.getItem('cookbooks'))
            }
            this.showOtN=  true
            this.showAlp= true
            this.showNtO = true
            this.showMan =  false
            this.dropdown_text = "Sort by: manually"
            
        },
        swapUpBooks: function(index){
            const tempArray = this.cookbooks
            const temp = tempArray[index - 1]
            tempArray[index-1] = tempArray[index]
            tempArray[index] = temp
            this.cookbooks = []
            this.cookbooks = tempArray
        },
        swapDownBooks: function(index){
            const tempArray = this.cookbooks
            const temp = tempArray[index + 1]
            tempArray[index+1] = tempArray[index]
            tempArray[index] = temp
            this.cookbooks = []
            this.cookbooks = tempArray
        },
        swapWithPos: function(index){
            const position =  parseInt(this.inputValue)
            this.inputValue = ""
            if (!(/^\d+$/.test(position)) || position >= this.cookbooks.length || position < 0){
                    this.inputValue = ""
            } else {
                const tempArray = this.cookbooks
                const temp = tempArray[position]
                tempArray[position] = tempArray[index]
                tempArray[index] = temp
                this.cookbooks = []
                this.cookbooks = tempArray
            }
                
        }, submitManualChanging: function(){
            if (!this.submitManual){
                this.submitText = "Submit"
                this.submitManual = true
                this.md = 8
            } else {
                localStorage.setItem('cookbooks',JSON.stringify(this.cookbooks))
                this.submitText = "Edit"
                this.submitManual = false
                this.md = 12
            }
        }, synchroniseLocalToDatabase: function(){
            const localStorageData = localStorage.getItem('cookbooks');
            const localStorageArray = JSON.parse(localStorageData) || [];
            const updatedLocalStorageArray = localStorageArray.filter(localStorageElement => {      
             // Assuming there's a unique identifier in your objects, replace 'id' with the actual property
             const isElementInTargetArray = this.cookbooks.some(targetElement => targetElement.id === localStorageElement.id);
                return isElementInTargetArray;
            });
            this.cookbooks.forEach(targetElement => {
                const isNewElement = !updatedLocalStorageArray.some(localStorageElement => localStorageElement.id === targetElement.id);
                if (isNewElement) {
                    updatedLocalStorageArray.push(targetElement);
                }
            });
            localStorage.setItem('cookbooks', JSON.stringify(updatedLocalStorageArray));
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
