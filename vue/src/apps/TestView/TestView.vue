<template>

    <div id="app">

        DIV

        <div class="row">
            <div class="col-md-3">

                <div class="row">
                    <div class="col-12">
                        <b-img style="height: 15vh; width: 25vw; object-fit: cover"
                               src="http://127.0.0.1:8000/media/recipes/40527e70-82f4-4062-93cc-5d091f68279b_119.png"
                               rounded></b-img>
                    </div>
                </div>
                <div class="row mt-3">
                    <div class="col-2">
                        <div class="dot">
                            75%
                        </div>
                    </div>

                    <div class="col-9">
                        <h6><b>Zwiebelkuchen mit einem wirklich langen namen und einer ewigen Beschreibung</b></h6>
                        <span class="text-muted text-small">📥 Import 1 - 🍽 Hauptgang - 🔥 Backen</span>
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

</style>
