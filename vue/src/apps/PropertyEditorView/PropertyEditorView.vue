<template>

    <div id="app">
        <div>
            <div class="row" v-if="recipe" style="max-height: 10vh">

                <div class="col col-8">
                    <h2><a :href="resolveDjangoUrl('view_recipe', recipe.id)">{{ recipe.name }}</a></h2>
                    {{ recipe.description }}
                    <keywords-component :recipe="recipe"></keywords-component>

                </div>
                <div class="col col-4" v-if="recipe.image">
                    <img style="max-height: 10vh" class="img-thumbnail float-right" :src="recipe.image">
                </div>
            </div>


            <div class="row mt-3">
                <div class="col col-12">
                    <b-button variant="success" href="https://fdc.nal.usda.gov/index.html" target="_blank"><i class="fas fa-external-link-alt"></i> {{ $t('FDC_Search') }}</b-button>

                    <table class="table table-sm table-bordered table-responsive mt-2 pb-5">
                        <thead>
                        <tr>
                            <td>{{ $t('Name') }}</td>
                            <td>FDC</td>
                            <td>{{ $t('Properties_Food_Amount') }}</td>
                            <td>{{ $t('Properties_Food_Unit') }}</td>
                            <td v-for="pt in property_types" v-bind:key="pt.id">
                                <b-button variant="primary" @click="editing_property_type = pt" class="btn-block">{{ pt.name }}
                                    <span v-if="pt.unit !== ''">({{ pt.unit }}) </span> <br/>
                                    <b-badge variant="light"><i class="fas fa-sort-amount-down-alt"></i> {{ pt.order }}</b-badge>
                                    <b-badge variant="success" v-if="pt.fdc_id > 0" class="mt-2" v-b-tooltip.hover :title="$t('property_type_fdc_hint')"><i class="fas fa-check"></i> FDC</b-badge>
                                    <b-badge variant="warning" v-if="pt.fdc_id < 1" class="mt-2" v-b-tooltip.hover :title="$t('property_type_fdc_hint')"><i class="fas fa-times"></i> FDC</b-badge>
                                </b-button>
                            </td>
                            <td>
                                <b-button variant="success" @click="new_property_type = true"><i class="fas fa-plus"></i></b-button>
                            </td>
                        </tr>
                        </thead>
                        <tbody>
                        <tr v-for="f in this.foods" v-bind:key="f.id">
                            <td>
                                {{ f.name }}
                            </td>
                            <td style="width: 15em;">
                                <b-input-group>
                                    <b-form-input v-model="f.fdc_id" type="number" @change="updateFood(f)" :disabled="f.loading"></b-form-input>
                                    <b-input-group-append>
                                        <b-button variant="success" @click="updateFoodFromFDC(f)" :disabled="f.loading || f.fdc_id < 1"><i class="fas fa-sync-alt" :class="{'fa-spin': loading}"></i></b-button>
                                        <b-button variant="info" :href="`https://fdc.nal.usda.gov/fdc-app.html#/food-details/${f.fdc_id}`" :disabled="f.fdc_id < 1" target="_blank"><i class="fas fa-external-link-alt"></i></b-button>
                                    </b-input-group-append>
                                </b-input-group>

                            </td>
                            <td style="width: 5em; ">
                                <b-input v-model="f.properties_food_amount" type="number" @change="updateFood(f)" :disabled="f.loading"></b-input>
                            </td>
                            <td style="width: 11em;">
                                <generic-multiselect
                                    @change="f.properties_food_unit = $event.val; updateFood(f)"
                                    :initial_single_selection="f.properties_food_unit"
                                    label="name" :model="Models.UNIT"
                                    :multiple="false"
                                    :disabled="f.loading"/>
                            </td>
                            <td v-for="p in f.properties" v-bind:key="`${f.id}_${p.property_type.id}`">
                                <b-input-group>
                                    <template v-if="p.property_amount == null">
                                        <b-btn class="btn-sm btn-block btn-success" @click="enableProperty(p,f)">Add</b-btn>
                                    </template>
                                    <template v-else>
                                        <b-input-group>

                                            <b-form-input v-model="p.property_amount" type="number" :ref="`id_input_${f.id}_${p.property_type.id}`" :disabled="f.loading" v-b-tooltip.focus :title="p.property_type.name"
                                                          @change="updateFood(f)"></b-form-input>
                                            <b-input-group-append>
                                                <b-btn @click="p.property_amount = null; updateFood(f)"><i class="fas fa-trash-alt"></i></b-btn>
                                            </b-input-group-append>
                                        </b-input-group>
                                    </template>
                                </b-input-group>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <b-row class="mt-2">
                <b-col>
                    <b-card>
                        <b-card-title>
                            <i class="fas fa-calculator"></i> {{ $t('Calculator') }}
                        </b-card-title>
                        <b-card-text>
                            <b-form inline>
                                <b-input type="number" v-model="calculator_from_amount"></b-input>
                                <i class="fas fa-divide fa-fw mr-1 ml-1"></i>
                                <b-input type="number" v-model="calculator_from_per"></b-input>
                                <i class="fas fa-equals fa-fw mr-1 ml-1"></i>

                                <b-input-group>
                                    <b-input v-model="calculator_to_amount" disabled></b-input>
                                    <b-input-group-append>
                                        <b-btn variant="success" @click="copyCalculatedResult()"><i class="far fa-copy"></i></b-btn>
                                    </b-input-group-append>
                                </b-input-group>


                                <i class="fas fa-divide fa-fw mr-1 ml-1"></i>
                                <b-input type="number" v-model="calculator_to_per"></b-input>
                            </b-form>
                        </b-card-text>

                    </b-card>


                </b-col>

            </b-row>


            <generic-modal-form
                :show="editing_property_type !== null"
                :model="Models.PROPERTY_TYPE"
                :action="Actions.UPDATE"
                :item1="editing_property_type"
                @finish-action="editing_property_type = null; loadData()">
            </generic-modal-form>

            <generic-modal-form
                :show="new_property_type"
                :model="Models.PROPERTY_TYPE"
                :action="Actions.CREATE"
                @finish-action="new_property_type = false; loadData()">
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
import KeywordsComponent from "@/components/KeywordsComponent.vue";
import VueClipboard from 'vue-clipboard2'

Vue.use(VueClipboard)
Vue.use(BootstrapVue)


export default {
    name: "PropertyEditorView",
    mixins: [ApiMixin],
    components: {KeywordsComponent, GenericModalForm, GenericMultiselect},
    computed: {
        calculator_to_amount: function () {
            return (this.calculator_from_amount / this.calculator_from_per * this.calculator_to_per).toFixed(2)
        },
    },
    data() {
        return {
            recipe: null,
            property_types: [],
            editing_property_type: null,
            new_property_type: false,
            loading: false,
            foods: [],

            calculator_from_amount: 1,
            calculator_from_per: 300,
            calculator_to_per: 100,
        }
    },
    mounted() {
        this.$i18n.locale = window.CUSTOM_LOCALE

        this.loadData();
    },
    methods: {
        resolveDjangoUrl,
        loadData: function () {
            let apiClient = new ApiApiFactory()

            apiClient.listPropertyTypes().then(result => {
                this.property_types = result.data

                apiClient.retrieveRecipe(window.RECIPE_ID).then(result => {
                    this.recipe = result.data

                    this.foods = []

                    this.recipe.steps.forEach(s => {
                        s.ingredients.forEach(i => {
                            if (i.food != null && this.foods.filter(x => (x.id === i.food.id)).length === 0) {
                                this.foods.push(this.buildFood(i.food))
                            }
                        })
                    })
                    this.loading = false;
                }).catch((err) => {
                    StandardToasts.makeStandardToast(this, StandardToasts.FAIL_FETCH, err)
                })
            }).catch((err) => {
                StandardToasts.makeStandardToast(this, StandardToasts.FAIL_FETCH, err)
            })
        },
        buildFood: function (food) {
            /**
             * Prepare food for display in grid by making sure the food properties are in the same order as property_types and that no types are missing
             * */

            let existing_properties = {}
            food.properties.forEach(fp => {
                existing_properties[fp.property_type.id] = fp
            })

            let food_properties = []
            this.property_types.forEach(pt => {
                let new_food_property = {
                    property_type: pt,
                    property_amount: null,
                }
                if (pt.id in existing_properties) {
                    new_food_property = existing_properties[pt.id]
                }
                food_properties.push(new_food_property)
            })

            this.$set(food, 'loading', false)

            food.properties = food_properties

            return food
        },
        spliceInFood: function (food) {
            /**
             * replace food in foods list, for example after updates from the server
             */
            this.foods = this.foods.map(f => (f.id === food.id) ? food : f)

        },
        updateFood: function (food) {
            let apiClient = new ApiApiFactory()
            apiClient.partialUpdateFood(food.id, food).then(result => {
                // don't use result to prevent flickering
                //this.spliceInFood(this.buildFood(result.data))
                StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_UPDATE)
            }).catch((err) => {
                StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
            })
        },
        updateFoodFromFDC: function (food) {
            food.loading = true;
            let apiClient = new ApiApiFactory()

            apiClient.fdcFood(food.id).then(result => {
                StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_UPDATE)
                this.spliceInFood(this.buildFood(result.data))
            }).catch((err) => {
                StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
                food.loading = false;
            })
        },
        copyCalculatedResult: function () {
            this.$copyText(this.calculator_to_amount)
        },
        enableProperty: async function (property, food) {
            property.property_amount = 0;
            this.updateFood(food)
            await this.$nextTick();
            this.$refs[`id_input_${food.id}_${property.property_type.id}`][0].focus()
            this.$refs[`id_input_${food.id}_${property.property_type.id}`][0].select()
        },
    },
}
</script>

<style>

</style>
