<template>

    <div id="app">
        <div>
            <h2 v-if="recipe">{{ recipe.name}}</h2>

            <table class="table table-sm table-bordered">
                <thead>
                <tr>
                    <td>{{ $t('Name') }}</td>
                    <td v-for="pt in property_types" v-bind:key="pt.id">{{ pt.name }}
                        <input type="text" v-model="pt.unit" @change="updatePropertyType(pt)">
                        <input v-model="pt.fdc_id" type="number" placeholder="FDC ID" @change="updatePropertyType(pt)"></td>
                </tr>
                </thead>
                <tbody>
                <tr v-for="f in this.foods" v-bind:key="f.food.id">
                    <td>
                        {{ f.food.name }}
                        {{ $t('Property') }} / <input type="number" v-model="f.food.properties_food_amount" @change="updateFood(f.food)">
                        <generic-multiselect
                            @change="f.food.properties_food_unit = $event.val; updateFood(f.food)"
                            :initial_selection="f.food.properties_food_unit"
                            label="name" :model="Models.UNIT"
                            :multiple="false"/>
                        <input v-model="f.food.fdc_id" placeholder="FDC ID">
                        <button>Load FDC</button>
                    </td>
                    <td v-for="p in f.properties" v-bind:key="`${f.id}_${p.property_type.id}`"><input type="number" v-model="p.property_amount"> {{ p.property_type.unit }}</td>
                </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>


<script>
import Vue from "vue"
import {BootstrapVue} from "bootstrap-vue"

import "bootstrap-vue/dist/bootstrap-vue.css"
import {ApiMixin, resolveDjangoUrl, StandardToasts} from "@/utils/utils";
import axios from "axios";
import BetaWarning from "@/components/BetaWarning.vue";
import {ApiApiFactory} from "@/utils/openapi/api";
import GenericMultiselect from "@/components/GenericMultiselect.vue";


Vue.use(BootstrapVue)


export default {
    name: "TestView",
    mixins: [ApiMixin],
    components: {GenericMultiselect},
    computed: {
        foods: function () {
            let foods = []
            if (this.recipe !== null && this.property_types !== []) {
                this.recipe.steps.forEach(s => {
                    s.ingredients.forEach(i => {
                        let food = {food: i.food, properties: {}}

                        this.property_types.forEach(pt => {
                            food.properties[pt.id] = {changed: false, property_amount: 0, property_type: pt}
                        })
                        i.food.properties.forEach(fp => {
                            food.properties[fp.property_type.id] = {changed: false, property_amount: fp.property_amount, property_type: fp.property_type}
                        })
                        foods.push(food)
                    })
                })
            }
            return foods
        }
    },
    data() {
        return {
            recipe: null,
            property_types: []
        }
    },
    mounted() {
        this.$i18n.locale = window.CUSTOM_LOCALE

        let apiClient = new ApiApiFactory()

        apiClient.retrieveRecipe("112").then(result => {
            this.recipe = result.data
        })

        apiClient.listPropertyTypes().then(result => {
            this.property_types = result.data
        })
    },
    methods: {
        updateFood: function (food) {
            let apiClient = new ApiApiFactory()
            apiClient.partialUpdateFood(food.id, food).then(result => {
                //TODO handle properly
                StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_UPDATE)
            }).catch((err) => {
                StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
            })
        },
        updatePropertyType: function (pt) {
            let apiClient = new ApiApiFactory()
            apiClient.partialUpdatePropertyType(pt.id, pt).then(result => {
                //TODO handle properly
                StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_UPDATE)
            }).catch((err) => {
                StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
            })
        }
    },
}
</script>

<style>

</style>
