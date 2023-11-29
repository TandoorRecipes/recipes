<template>

    <div id="app">
        <div>
            <h2 v-if="recipe">{{ recipe.name }}</h2>

            <table class="table table-sm table-bordered">
                <thead>
                <tr>
                    <td>{{ $t('Name') }}</td>
                    <td>FDC</td>
                    <td>{{ $t('Properties_Food_Amount') }}</td>
                    <td>{{ $t('Properties_Food_Unit') }}</td>
                    <td v-for="pt in properties" v-bind:key="pt.id">
                        <b-input-group>
                            <b-form-input v-model="pt.name" ></b-form-input> <!-- TODO handle manual input -->
                            <b-input-group-append>
                                <b-input-group-text>{{ pt.unit }}</b-input-group-text>
                                <b-button variant="primary" @click="editing_property_type = pt"><i class="fas fa-pencil-alt"></i></b-button>
                            </b-input-group-append>
                        </b-input-group>
                    </td>
                </tr>
                </thead>
                <tbody>
                <tr v-for="f in this.foods" v-bind:key="f.food.id">
                    <td>
                        {{ f.food.name }}
                    </td>
                    <td>
                        <b-input-group>
                            <b-form-input v-model="f.food.fdc_id" type="number" @change="updateFood(f.food)"></b-form-input>
                            <b-input-group-append>
                                <b-button variant="success" @click="updateFoodFromFDC(f.food)"><i class="fas fa-sync-alt"></i></b-button>
                            </b-input-group-append>
                        </b-input-group>

                    </td>
                    <td>
                        <b-input v-model="f.food.properties_food_amount" type="number" @change="updateFood(f.food)"></b-input>
                    </td>
                    <td>
                        <generic-multiselect
                            @change="f.food.properties_food_unit = $event.val; updateFood(f.food)"
                            :initial_selection="f.food.properties_food_unit"
                            label="name" :model="Models.UNIT"
                            :multiple="false"/>
                    </td>
                    <td v-for="p in f.properties" v-bind:key="`${f.id}_${p.property_type.id}`">
                        <b-input-group>
                            <b-form-input v-model="p.property_amount" type="number"></b-form-input> <!-- TODO handle manual input -->
                        </b-input-group>
                    </td>
                </tr>
                </tbody>
            </table>

            <generic-modal-form
                :show="editing_property_type !== null"
                :model="Models.PROPERTY_TYPE"
                :action="Actions.UPDATE"
                :item1="editing_property_type"
                @finish-action="editing_property_type = null; loadPropertyTypes()">
            </generic-modal-form>

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
import GenericModalForm from "@/components/Modals/GenericModalForm.vue";


Vue.use(BootstrapVue)


export default {
    name: "TestView",
    mixins: [ApiMixin],
    components: {GenericModalForm, GenericMultiselect},
    computed: {
        foods: function () {
            let foods = {}
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
                        foods[food.food.id] = food
                    })
                })
            }
            return foods
        },
        properties: function () {
            let properties = {}
            this.property_types.forEach(pt => {
                properties[pt.id] = pt
            })
            return properties
        }
    },
    data() {
        return {
            recipe: null,
            property_types: [],
            editing_property_type: null,
        }
    },
    mounted() {
        this.$i18n.locale = window.CUSTOM_LOCALE

        this.loadRecipe();
        this.loadPropertyTypes();
    },
    methods: {
        loadRecipe: function () {
            let apiClient = new ApiApiFactory()

            apiClient.retrieveRecipe("112").then(result => {
                this.recipe = result.data
            })
        },
        updateFood: function (food) {
            let apiClient = new ApiApiFactory()
            apiClient.partialUpdateFood(food.id, food).then(result => {
                StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_UPDATE)
            }).catch((err) => {
                StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
            })
        },
        loadPropertyTypes: function () {
            let apiClient = new ApiApiFactory()
            apiClient.listPropertyTypes().then(result => {
                this.property_types = result.data
                StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_UPDATE)
            }).catch((err) => {
                StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
            })
        },
        updateFoodFromFDC: function (food) {
            let apiClient = new ApiApiFactory()

            apiClient.fdcFood(food.id).then(result => {
                this.loadRecipe()
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
