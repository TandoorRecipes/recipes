<template>

    <div id="app">
        <div class="row" v-if="food">
            <div class="col-12">
                <h2>{{ food.name }}</h2>
            </div>
        </div>

        <div class="row">
            <div class="col-12">
                <b-form v-if="food">
                    <b-form-group :label="$t('Name')" description="">
                        <b-form-input v-model="food.name"></b-form-input>
                    </b-form-group>
                    <b-form-group :label="$t('Plural')" description="">
                        <b-form-input v-model="food.plural_name"></b-form-input>
                    </b-form-group>


                    <b-form-group :label="$t('Recipe')" :description="$t('food_recipe_help')">
                        <generic-multiselect
                            @change="food.recipe = $event.val;"
                            :model="Models.RECIPE"
                            :initial_selection="food.recipe"
                            label="name"
                            :multiple="false"
                            :placeholder="$t('Recipe')"
                        ></generic-multiselect>
                    </b-form-group>

                    <b-form-group :description="$t('OnHand_help')">
                        <b-form-checkbox v-model="food.food_onhand">{{ $t('OnHand') }}</b-form-checkbox>
                    </b-form-group>

                    <b-form-group :description="$t('ignore_shopping_help')">
                        <b-form-checkbox v-model="food.ignore_shopping">{{ $t('Ignore_Shopping') }}</b-form-checkbox>
                    </b-form-group>

                    <b-form-group :label="$t('Shopping_Category')" :description="$t('shopping_category_help')">
                        <generic-multiselect
                            @change="food.supermarket_category = $event.val;"
                            :model="Models.SHOPPING_CATEGORY"
                            :initial_selection="food.supermarket_category"
                            label="name"
                            :multiple="false"
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
                            :multiple="false"
                            :placeholder="$t('Substitutes')"
                        ></generic-multiselect>
                    </b-form-group>

                    <b-form-group :description="$t('substitute_siblings_help')">
                        <b-form-checkbox v-model="food.substitute_siblings">{{ $t('substitute_siblings') }}</b-form-checkbox>
                    </b-form-group>

                    <b-form-group :label="$t('InheritFields')" :description="$t('InheritFields_help')">
                        <generic-multiselect
                            @change="food.inherit_fields = $event.val;"
                            :model="Models.FOOD_INHERIT_FIELDS"
                            :initial_selection="food.inherit_fields"
                            label="name"
                            :multiple="false"
                            :placeholder="$t('InheritFields')"
                        ></generic-multiselect>
                    </b-form-group>

                    <b-form-group :label="$t('ChildInheritFields')" :description="$t('ChildInheritFields_help')">
                        <generic-multiselect
                            @change="food.child_inherit_fields = $event.val;"
                            :model="Models.FOOD_INHERIT_FIELDS"
                            :initial_selection="food.child_inherit_fields"
                            label="name"
                            :multiple="false"
                            :placeholder="$t('ChildInheritFields')"
                        ></generic-multiselect>
                    </b-form-group>

                    <!-- TODO change to a button -->
                    <b-form-group :description="$t('reset_children_help')">
                        <b-form-checkbox v-model="food.reset_inherit">{{ $t('reset_children') }}</b-form-checkbox>
                    </b-form-group>

                    <b-button variant="primary" @click="updateFood">{{ $t('Save') }}</b-button>
                </b-form>

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
import GenericMultiselect from "@/components/GenericMultiselect.vue";
import {ApiMixin, StandardToasts} from "@/utils/utils";


Vue.use(BootstrapVue)


export default {
    name: "TestView",
    mixins: [ApiMixin],
    components: {
        GenericMultiselect
    },
    data() {
        return {
            food: undefined,

        }
    },
    mounted() {
        this.$i18n.locale = window.CUSTOM_LOCALE
        let apiClient = new ApiApiFactory()
        apiClient.retrieveFood('1').then((r) => {
            this.food = r.data
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
        }
    },
}
</script>

<style>

</style>
