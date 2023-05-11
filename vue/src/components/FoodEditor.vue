<template>

    <div>

        <b-modal :id="id" size="xl" @hidden="cancelAction">

            <template v-slot:modal-title>
                <div class="row" v-if="food">
                    <div class="col-12">
                        <h2>{{ food.name }} <small class="text-muted" v-if="food.plural_name">{{
                                food.plural_name
                            }}</small>
                        </h2>
                    </div>
                </div>
            </template>

            <div class="row">
                <div class="col-12">
                    <b-form v-if="food">
                        <b-form-group :label="$t('Name')" description="">
                            <b-form-input v-model="food.name"></b-form-input>
                        </b-form-group>
                        <b-form-group :label="$t('Plural')" description="">
                            <b-form-input v-model="food.plural_name"></b-form-input>
                        </b-form-group>

                        <!-- Food properties -->

                        <h5><i class="fas fa-database"></i> {{ $t('Properties') }}</h5>
                        <table class="table table-bordered" v-if="food_properties">
                            <tr v-for="fp in food_properties" v-bind:key="fp.id">
                                <td><input v-model="fp.property_amount" type="number"> {{ fp.property_type.unit }}</td>
                                <td><b> {{ fp.property_type.name }} </b></td>
                                <td> /</td>
                                <td><input v-model="fp.food_amount" type="number"></td>
                                <td>
                                    <generic-multiselect
                                            @change="fp.food_unit = $event.val;"
                                            :model="Models.UNIT"
                                            :initial_single_selection="fp.food_unit"
                                            label="name"
                                            :multiple="false"
                                            :placeholder="$t('Unit')"
                                    ></generic-multiselect>
                                </td>
                            </tr>
                        </table>


                        <!-- Unit conversion -->

                        <!-- ADVANCED FEATURES somehow hide this stuff -->
                        <b-collapse id="collapse-advanced">
                            <b-form-group :label="$t('Recipe')" :description="$t('food_recipe_help')">
                                <generic-multiselect
                                        @change="food.recipe = $event.val;"
                                        :model="Models.RECIPE"
                                        :initial_single_selection="food.recipe"
                                        label="name"
                                        :multiple="false"
                                        :placeholder="$t('Recipe')"
                                ></generic-multiselect>
                            </b-form-group>

                            <b-form-group :description="$t('OnHand_help')">
                                <b-form-checkbox v-model="food.food_onhand">{{ $t('OnHand') }}</b-form-checkbox>
                            </b-form-group>

                            <b-form-group :description="$t('ignore_shopping_help')">
                                <b-form-checkbox v-model="food.ignore_shopping">{{
                                        $t('Ignore_Shopping')
                                    }}
                                </b-form-checkbox>
                            </b-form-group>

                            <b-form-group :label="$t('Shopping_Category')" :description="$t('shopping_category_help')">
                                <generic-multiselect
                                        @change="food.supermarket_category = $event.val;"
                                        :model="Models.SHOPPING_CATEGORY"
                                        :initial_single_selection="food.supermarket_category"
                                        label="name"
                                        :multiple="false"
                                        :allow_create="true"
                                        :placeholder="$t('Shopping_Category')"
                                ></generic-multiselect>
                            </b-form-group>

                            <hr/>
                            <!-- todo add conditions if false disable dont hide -->
                            <b-form-group :label="$t('Substitutes')" :description="$t('substitute_help')">
                                <generic-multiselect
                                        @change="food.substitute = $event.val;"
                                        :model="Models.FOOD"
                                        :initial_selection="food.substitute"
                                        label="name"
                                        :multiple="true"
                                        :placeholder="$t('Substitutes')"
                                ></generic-multiselect>
                            </b-form-group>

                            <b-form-group :description="$t('substitute_siblings_help')">
                                <b-form-checkbox v-model="food.substitute_siblings">{{
                                        $t('substitute_siblings')
                                    }}
                                </b-form-checkbox>
                            </b-form-group>

                            <b-form-group :label="$t('InheritFields')" :description="$t('InheritFields_help')">
                                <generic-multiselect
                                        @change="food.inherit_fields = $event.val;"
                                        :model="Models.FOOD_INHERIT_FIELDS"
                                        :initial_selection="food.inherit_fields"
                                        label="name"
                                        :multiple="true"
                                        :placeholder="$t('InheritFields')"
                                ></generic-multiselect>
                            </b-form-group>

                            <b-form-group :label="$t('ChildInheritFields')"
                                          :description="$t('ChildInheritFields_help')">
                                <generic-multiselect
                                        @change="food.child_inherit_fields = $event.val;"
                                        :model="Models.FOOD_INHERIT_FIELDS"
                                        :initial_sselection="food.child_inherit_fields"
                                        label="name"
                                        :multiple="true"
                                        :placeholder="$t('ChildInheritFields')"
                                ></generic-multiselect>
                            </b-form-group>

                            <!-- TODO change to a button -->
                            <b-form-group :description="$t('reset_children_help')">
                                <b-form-checkbox v-model="food.reset_inherit">{{
                                        $t('reset_children')
                                    }}
                                </b-form-checkbox>
                            </b-form-group>
                        </b-collapse>


                    </b-form>

                </div>
            </div>
            <template v-slot:modal-footer>
                <b-button variant="primary" @click="updateFood">{{ $t('Save') }}</b-button>
                <b-button v-b-toggle.collapse-advanced class="m-1">{{ $t('Advanced') }}</b-button>
            </template>
        </b-modal>
    </div>
</template>


<script>
import Vue from "vue"
import {BootstrapVue} from "bootstrap-vue"

import "bootstrap-vue/dist/bootstrap-vue.css"
import {ApiApiFactory} from "@/utils/openapi/api";
import GenericMultiselect from "@/components/GenericMultiselect.vue";
import {ApiMixin, formFunctions, getForm, StandardToasts} from "@/utils/utils";


Vue.use(BootstrapVue)


export default {
    name: "FoodEditor",
    mixins: [ApiMixin],
    components: {
        GenericMultiselect
    },
    props: {
        id: {type: String, default: 'id_food_edit_modal_modal'},
        show: {required: true, type: Boolean, default: false},
    },
    watch: {
        show: function () {
            console.log('trigger')
            if (this.show) {
                console.log('show modal')
                this.$bvModal.show(this.id)
            } else {
                console.log('show modal false')
                this.$bvModal.hide(this.id)
            }
        },
    },
    data() {
        return {
            food: undefined,
            food_properties: [],
        }
    },
    mounted() {
        this.$bvModal.show(this.id)
        this.$i18n.locale = window.CUSTOM_LOCALE
        let apiClient = new ApiApiFactory()
        apiClient.retrieveFood('1').then((r) => {
            this.food = r.data

            let property_types = []
            let property_values = []

            let p1 = apiClient.listPropertyTypes().then((r) => {
                property_types = r.data
            })

            let p2 = apiClient.listFoodPropertys(this.food.id).then((r) => {
                property_values = r.data
            })

            Promise.allSettled([p1, p2]).then(r => {
                property_types.forEach(fpt => {
                    let food_property = {
                        'food_amount': 0,
                        'food_unit': null,
                        'food': this.food,
                        'property_amount': 0,
                        'property_type': fpt,
                    }

                    property_values.forEach(fpv => {
                        if (fpv.property_type.id === fpt.id) {
                            food_property.id = fpv.id
                            food_property.food_amount = fpv.food_amount
                            food_property.food_unit = fpv.food_unit
                            food_property.property_amount = fpv.property_amount
                        }
                    })

                    this.food_properties.push(food_property)
                })
            })
        })


    },
    methods: {
        updateFood: function () {
            let apiClient = new ApiApiFactory()
            apiClient.updateFood(this.food.id, this.food).then((r) => {
                this.food = r.data
                StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_UPDATE)
            }).catch(err => {
                StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
            })

            this.food_properties.forEach(fp => {
                if (fp.id === undefined) {
                    apiClient.createFoodProperty(fp).then((r) => {
                        fp = r.data
                    }).catch(err => {
                        StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
                    })
                } else {
                    apiClient.updateFoodProperty(fp.id, fp).then((r) => {
                        fp = r.data
                    }).catch(err => {
                        StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
                    })
                }

            })
        },
        cancelAction: function () {
            this.$emit("hidden", "")
        },
    },
}
</script>

<style>

</style>
