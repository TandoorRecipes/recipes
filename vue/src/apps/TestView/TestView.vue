<template>

    <div id="app">

        Recipe Card
        <b-checkbox v-model="recipe_detailed"></b-checkbox>
        <div class="row">
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

<style></style>
