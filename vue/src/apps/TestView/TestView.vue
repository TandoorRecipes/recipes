<template>

    <div id="app">
        <hr/>

        <div class="row">
            <div class="col col-md-12">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); column-gap: 0.5rem;row-gap: 1rem; grid-auto-rows: max-content; ">
                    <b-list-group v-for="x in Array(5).keys()" v-bind:key="x">
                        <b-list-group-item >
                            <h4>Monday </h4>
                        </b-list-group-item>
                        <b-list-group-item v-for="y in Array(Math.round(Math.random()*4) ).keys()" v-bind:key="y">
                            <div class="d-flex flex-row align-items-center">
                                <div>
                                    <b-img style="height: 50px; width: 50px; object-fit: cover" src="http://127.0.0.1:8000/media/recipes/6a2fd228-c589-4a14-b21f-365bca3fbd94_119.png" rounded="circle"></b-img>
                                </div>
                                <div class="flex-grow-1 ml-2">
                                    <span class="two-row-text">{{ recipe.name }}</span>
                                </div>
                            </div>
                        </b-list-group-item>
                        <b-list-group-item class="justify-content-center text-center">
                            <b-button><i class="fa fa-plus"></i></b-button>
                        </b-list-group-item>
                    </b-list-group>

                </div>
            </div>
        </div>

        <hr/>

        <div class="row">
            <div class="col col-md-12">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); column-gap: 0.5rem;row-gap: 1rem; grid-auto-rows: max-content; ">
                    <recipe-card :recipe="recipe" :detailed="false"></recipe-card>
                    <recipe-card :recipe="recipe" :detailed="false"></recipe-card>
                    <recipe-card :recipe="recipe" :detailed="false"></recipe-card>
                    <recipe-card :recipe="recipe" :detailed="false"></recipe-card>
                    <recipe-card :recipe="recipe" :detailed="false"></recipe-card>
                    <recipe-card :recipe="recipe" :detailed="false"></recipe-card>
                    <recipe-card :recipe="recipe" :detailed="false"></recipe-card>

                </div>
            </div>
        </div>


    </div>
</template>


<script>
import Vue from "vue"
import {BootstrapVue} from "bootstrap-vue"

import "bootstrap-vue/dist/bootstrap-vue.css"
import {ApiApiFactory} from "@/utils/openapi/api";
import RecipeCard from "@/components/RecipeCard.vue";


Vue.use(BootstrapVue)


export default {
    name: "TestView",
    mixins: [],
    components: {RecipeCard},
    data() {
        return {
            recipe: undefined,
            recipe_detailed: false,
            meal_plan: undefined
        }
    },
    mounted() {
        this.$i18n.locale = window.CUSTOM_LOCALE
        let apiClient = new ApiApiFactory()
        apiClient.retrieveRecipe('119').then((r) => {
            this.recipe = r.data
        })
        apiClient.retrieveMealPlan('1').then((r) => {
            this.meal_plan = r.data
        })
    },
    methods: {},
}
</script>

<style>
.dot {
    height: 40px;
    width: 40px;
    background-color: #bbb;
    border-radius: 50%;
    display: inline-block;
}

.two-row-text {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2; /* number of lines to show */
    line-clamp: 2;
    -webkit-box-orient: vertical;
}

</style>
