<template>

    <div>

        <b-modal :id="id" size="xl" @hidden="cancelAction" :body-class="`pr-3 pl-3`">

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

            <div>
                <b-tabs content-class="mt-3" v-if="food">
                    <b-tab title="General" active>
                        <b-form>
                            <b-form-group :label="$t('Name')" description="">
                                <b-form-input v-model="food.name"></b-form-input>
                            </b-form-group>
                            <b-form-group :label="$t('Plural')" description="">
                                <b-form-input v-model="food.plural_name"></b-form-input>
                            </b-form-group>
                            <b-form-group :label="$t('Description')" description="">
                                <b-form-textarea v-model="food.description" rows="2"></b-form-textarea>
                            </b-form-group>

                            <!-- Food properties -->

                            <h5><i class="fas fa-database"></i> {{ $t('Properties') }}</h5>

                            <b-form-group :label="$t('Properties_Food_Amount')" description="">
                                <b-form-input v-model="food.properties_food_amount"></b-form-input>
                            </b-form-group>

                            <b-form-group :label="$t('Properties_Food_Unit')" description="">
                                <generic-multiselect
                                    @change="food.properties_food_unit = $event.val;"
                                    :model="Models.UNIT"
                                    :initial_single_selection="food.properties_food_unit"
                                    label="name"
                                    :multiple="false"
                                    :placeholder="$t('Unit')"
                                ></generic-multiselect>
                            </b-form-group>


                            <table class="table table-bordered">
                                <thead>
                                <tr>
                                    <th> {{ $t('Property Amount') }}</th> <!-- TODO localize -->
                                    <th> {{ $t('Property Type') }}</th> <!-- TODO localize -->
                                    <th></th>
                                    <th></th>
                                </tr>
                                </thead>
                                <tr v-for="fp in food.properties" v-bind:key="fp.id">
                                    <td><input v-model="fp.property_amount" type="number"> <span
                                        v-if="fp.property_type">{{ fp.property_type.unit }}</span></td>
                                    <td>
                                        <generic-multiselect
                                            @change="fp.property_type = $event.val"
                                            :initial_single_selection="fp.property_type"
                                            label="name" :model="Models.PROPERTY_TYPE"
                                            :multiple="false"/>
                                    </td>
                                    <td> / <span>{{ food.properties_food_amount }} <span
                                        v-if="food.properties_food_unit !== null">{{
                                            food.properties_food_unit.name
                                        }}</span></span>
                                    </td>
                                    <td>
                                        <a class="btn btn-danger btn-small" @click="deleteProperty(fp)"><i
                                            class="fas fa-trash-alt"></i></a>
                                    </td>
                                </tr>
                            </table>

                            <div class="text-center">
                                <b-button-group>
                                    <b-btn class="btn btn-success shadow-none" @click="addProperty()"><i
                                        class="fa fa-plus"></i>
                                    </b-btn>
                                    <b-btn class="btn btn-secondary shadow-none" @click="addAllProperties()"><i
                                        class="fa fa-plus"> <i class="ml-1 fas fa-list"></i></i>
                                    </b-btn>
                                </b-button-group>

                            </div>

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


                        </b-form>
                    </b-tab>
                    <b-tab title="Conversions" @click="loadUnitConversions" v-if="this.food.id !== undefined">

                        <b-row v-for="uc in unit_conversions" :key="uc">
                            <b-col>
                                <span v-if="uc.id">
                                    <b-btn class="btn btn-sm" variant="danger" @click="deleteUnitConversion(uc)"><i class="fas fa-trash-alt"></i></b-btn>
                                    {{ uc.base_amount }}
                                    {{ uc.base_unit.name }}
                                    =
                                    {{ uc.converted_amount }}
                                    {{ uc.converted_unit.name }}
                                </span>
                                <b-form class="mt-1">
                                    <b-input-group>
                                        <b-input v-model="uc.base_amount" @change="uc.changed = true"></b-input>
                                        <b-input-group-append>
                                            <generic-multiselect
                                                @change="uc.base_unit = $event.val; uc.changed = true"
                                                :initial_single_selection="uc.base_unit"
                                                label="name" :model="Models.UNIT"
                                                :multiple="false"/>
                                        </b-input-group-append>

                                    </b-input-group>

                                    <b-input-group>
                                        <b-input v-model="uc.converted_amount" @change="uc.changed = true"></b-input>
                                        <b-input-group-append>
                                            <generic-multiselect
                                                @change="uc.converted_unit = $event.val; uc.changed = true"
                                                :initial_single_selection="uc.converted_unit"
                                                label="name" :model="Models.UNIT"
                                                :multiple="false"/>
                                        </b-input-group-append>
                                    </b-input-group>

                                </b-form>
                            </b-col>
                            <hr style="height: 1px"/>
                        </b-row>

                        <b-row>
                            <b-col class="text-center">
                                <b-btn variant="success" @click="addUnitConversion"><i class="fa fa-plus"></i></b-btn>
                            </b-col>
                        </b-row>

                    </b-tab>
                    <b-tab title="More">
                        <b-form>


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

                            <b-form-group :label="$t('URL')" description="">
                                <b-form-input v-model="food.url"></b-form-input>
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
                            <b-form-group :description="$t('substitute_children_help')">
                                <b-form-checkbox v-model="food.substitute_children">{{
                                        $t('substitute_children')
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

                            <b-form-group :label="$t('Open_Data_Slug')" :description="$t('open_data_help_text')">
                                <b-form-input v-model="food.open_data_slug" disabled>
                                </b-form-input>
                            </b-form-group>

                        </b-form>
                    </b-tab>
                </b-tabs>
            </div>

            <template v-slot:modal-footer>
                <b-button variant="primary" @click="updateFood">{{ $t('Save') }}</b-button>
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
        item1: {
            type: Object,
            default: undefined
        },
    },
    watch: {
        show: function () {
            if (this.show) {
                this.$bvModal.show(this.id)
            } else {
                this.$bvModal.hide(this.id)
            }
        },
    },
    data() {
        return {
            food: undefined,
            unit_conversions: []
        }
    },
    mounted() {
        this.$bvModal.show(this.id)
        this.$i18n.locale = window.CUSTOM_LOCALE
        let apiClient = new ApiApiFactory()
        let pf
        if (this.item1.id !== undefined) {
            pf = apiClient.retrieveFood(this.item1.id).then((r) => {
                this.food = r.data
                if (this.food.properties_food_unit === null) {
                    this.food.properties_food_unit = {name: 'g'}
                }
            }).catch(err => {
                StandardToasts.makeStandardToast(this, StandardToasts.FAIL_FETCH, err)
            })
        } else {
            this.food = {
                name: "",
                plural_name: "",
                description: "",
                shopping: false,
                recipe: null,
                url: '',
                properties: [],
                properties_food_amount: 100,
                properties_food_unit: {name: 'g'},
                food_onhand: false,
                supermarket_category: null,
                parent: null,
                numchild: 0,
                inherit_fields: [],
                ignore_shopping: false,
                substitute: [],
                substitute_siblings: false,
                substitute_children: false,
                substitute_onhand: false,
                child_inherit_fields: [],
            }
        }
    },
    methods: {
        updateFood: function () {
            let apiClient = new ApiApiFactory()
            if (this.food.id !== undefined) {
                apiClient.updateFood(this.food.id, this.food).then((r) => {
                    this.food = r.data
                    StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_UPDATE)
                }).catch(err => {
                    StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
                })
            } else {
                apiClient.createFood(this.food).then((r) => {
                    this.food = r.data
                    StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_CREATE)
                }).catch(err => {
                    StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
                })
            }

            this.unit_conversions.forEach(uc => {
                if (uc.changed === true) {
                    if (uc.id === undefined) {
                        apiClient.createUnitConversion(uc).then(r => {
                            uc = r.data
                        }).catch(err => {
                            StandardToasts.makeStandardToast(this, StandardToasts.FAIL_CREATE, err, true)
                        })
                    } else {
                        apiClient.updateUnitConversion(uc.id, uc).then(r => {
                            uc = r.data
                        }).catch(err => {
                            StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err, true)
                        })
                    }
                }
            })
        },
        addProperty: function () {
            this.food.properties.push({property_type: null, property_amount: 0})
        },
        addAllProperties: function () {
            let apiClient = new ApiApiFactory()
            apiClient.listPropertyTypes().then(r => {
                r.data.forEach(x => {
                    this.food.properties.push({property_type: x, property_amount: 0})
                })
            }).catch(err => {
                StandardToasts.makeStandardToast(this, StandardToasts.FAIL_FETCH, err)
            })
        },
        deleteProperty: function (p) {
            this.food.properties = this.food.properties.filter(x => x !== p)
        },
        cancelAction: function () {
            this.$emit("hidden", "")
        },
        loadUnitConversions: function () {
            let apiClient = new ApiApiFactory()
            apiClient.listUnitConversions(this.food.id).then(r => {
                this.unit_conversions = r.data
            })
        },
        addUnitConversion: function () {
            this.unit_conversions.push(
                {
                    food: this.food,
                    base_amount: 1,
                    base_unit: null,
                    converted_amount: 0,
                    converted_unit: null,
                }
            )
        },
        deleteUnitConversion: function (uc) {
            this.unit_conversions = this.unit_conversions.filter(u => u !== uc)
            let apiClient = new ApiApiFactory()
            apiClient.destroyUnitConversion(uc.id).then(r => {
                StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_DELETE)
            }).catch(err => {
                StandardToasts.makeStandardToast(this, StandardToasts.FAIL_DELETE, err)
            })
        }
    },
}
</script>

<style>

</style>
