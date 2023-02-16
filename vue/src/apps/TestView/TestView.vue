<template>

    <div id="app">

        DIV

        <div class="row">
            <div class="col-md-12">
                <div style="height: 25vh; width: 15vw;">
                    <b-img style="height: 15vh; width: 15vw; object-fit: cover"
                           src="http://127.0.0.1:8000/media/recipes/6a2fd228-c589-4a14-b21f-365bca3fbd94_119.png"
                           rounded></b-img>
                    <div style="height: 10vh">
                        <span style="font-size: 18px" class="two-row-text"><b>Zwiebelkuchen mit einem wirklich langen namen und einer ewigen Beschreibung</b></span>
                        <span style="font-size: 14px" class="two-row-text text-muted">
                            <a href="#">Import 1</a> -
                            <a href="#">Hauptgang</a> -
                            <a href="#">Backen</a> </span>

                        <i class="fas fa-ellipsis-v"></i>
                    </div>

                </div>
            </div>

            <div class="col-md-3">

                <div class="row">
                    <div class="col-12">
                        <b-img style="height: 15vh; width: 15vw; object-fit: cover"
                               src="http://127.0.0.1:8000/media/recipes/6a2fd228-c589-4a14-b21f-365bca3fbd94_119.png"
                               rounded></b-img>
                    </div>
                </div>
                <div class="row mt-3">
                    <div class="col-1">

                    </div>
                    <div class="col-10">
                        <span style="font-size: 18px"><b>Zwiebelkuchen mit einem wirklich langen namen und einer ewigen Beschreibung</b></span> <br/>
                        <span style="font-size: 14px" class="text-muted text-small">
                            <a href="#">Import 1</a> -
                            <a href="#">Hauptgang</a> -
                            <a href="#">Backen</a> </span>
                    </div>
                    <div class="col-1 align-items-end">
                        <i class="fas fa-ellipsis-v"></i>
                    </div>
                </div>

            </div>

        </div>

        <hr class="mt-3"/>

        Recipe Card
        <b-checkbox v-model="recipe_detailed"></b-checkbox>
        <div class="row ">
            <div class="col-md-3">
                <recipe-card
                    v-if="recipe !== undefined"
                    :recipe="recipe"
                    :detailed="recipe_detailed"
                ></recipe-card>
            </div>
        </div>

        Meal Plan Card
        <div class="row">
            <div class="col-md-3">
                <recipe-card
                    v-if="recipe !== undefined && meal_plan !== undefined"
                    :recipe="recipe"
                    :detailed="recipe_detailed"
                    :meal_plan="meal_plan"
                    :footer_text="meal_plan.meal_type_name"
                    footer_icon="far fa-calendar-alt"
                ></recipe-card>
            </div>
        </div>


    </div>
</template>

<!--
<span class="text-muted text-small">📥 Import 1 - 🍽 Hauptgang - 🔥 Backen</span>

-->

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
