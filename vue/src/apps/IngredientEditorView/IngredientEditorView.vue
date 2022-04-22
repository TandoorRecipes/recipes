<template>
    <div id="app">
        <beta-warning></beta-warning>

        <div class="row mt-2">
            <div class="col col-md-6">
                <generic-multiselect @change="food = $event.val; refreshList()"
                                     :model="Models.FOOD"
                                     :initial_single_selection="food"
                                     :multiple="false"></generic-multiselect>
                <b-button @click="show_food_delete=true" :disabled="food === null"><i class="fas fa-trash-alt"></i>
                </b-button>
                <b-button @click="generic_model = Models.FOOD; generic_action=Actions.MERGE" :disabled="food === null">
                    <i class="fas fa-compress-arrows-alt"></i>
                </b-button>
                <generic-modal-form :model="Models.FOOD" :action="generic_action" :show="generic_model === Models.FOOD"
                                    :item1="food"
                                    @finish-action="food = null; generic_action=null; generic_model=null"/>
            </div>
            <div class="col col-md-6">

                <generic-multiselect
                    @change="unit = $event.val; refreshList()"
                    :model="Models.UNIT"
                    :initial_single_selection="unit"
                    :multiple="false"></generic-multiselect>

                <b-button @click="generic_model = Models.UNIT; generic_action=Actions.DELETE" :disabled="unit === null">
                    <i class="fas fa-trash-alt"></i>
                </b-button>
                <b-button @click="generic_model = Models.UNIT; generic_action=Actions.MERGE" :disabled="unit === null">
                    <i class="fas fa-compress-arrows-alt"></i>
                </b-button>
                <generic-modal-form :model="Models.UNIT" :action="generic_action" :show="generic_model === Models.UNIT"
                                    :item1="unit"
                                    @finish-action="unit = null; generic_action=null; generic_model=null"/>


            </div>
        </div>

        <div class="row mt-2">
            <div class="col col-md-12">
                <table class="table table-bordered">
                    <thead>
                    <tr>
                        <th>{{ $t('Amount') }}</th>
                        <th>{{ $t('Unit') }}</th>
                        <th>{{ $t('Food') }}</th>
                        <th>{{ $t('Note') }}</th>
                        <th>
                            <b-button variant="success" @click="updateIngredient()"><i class="fas fa-save"></i>
                            </b-button>
                        </th>
                    </tr>
                    </thead>
                    <tr v-if="loading">
                        <td colspan="4">
                            <loading-spinner></loading-spinner>
                        </td>
                    </tr>
                    <template v-if="!loading">
                        <tbody v-for="i in ingredients" v-bind:key="i.id">
                        <tr v-if="i.used_in_recipes.length > 0">
                            <td colspan="5">
                                <a v-for="r in i.used_in_recipes" :href="resolveDjangoUrl('view_recipe',r.id)"
                                   v-bind:key="r.id" target="_blank" rel="noreferrer nofollow">{{ r.name }}</a>
                            </td>
                        </tr>
                        <tr>
                            <td style="width: 5vw">
                                <input type="number" class="form-control" v-model="i.amount"
                                       @input="$set(i, 'changed', true)">
                            </td>
                            <td style="width: 30vw">
                                <generic-multiselect @change="i.unit = $event.val; $set(i, 'changed', true)"
                                                     :initial_single_selection="i.unit"
                                                     :model="Models.UNIT"
                                                     :search_on_load="false"
                                                     :allow_create="true"
                                                     :create_placeholder="$t('Create')"
                                                     :multiple="false"></generic-multiselect>
                            </td>
                            <td style="width: 30vw">
                                <generic-multiselect @change="i.food = $event.val; $set(i, 'changed', true)"
                                                     :initial_single_selection="i.food"
                                                     :model="Models.FOOD"
                                                     :search_on_load="false"
                                                     :allow_create="true"
                                                     :create_placeholder="$t('Create')"
                                                     :multiple="false"></generic-multiselect>
                            </td>
                            <td style="width: 30vw">
                                <input class="form-control" v-model="i.note" @keydown="$set(i, 'changed', true)">

                            </td>
                            <td style="width: 5vw">
                                <b-button :disabled="i.changed !== true"
                                          :variant="(i.changed !== true) ? 'primary' : 'success'"
                                          @click="updateIngredient(i)">
                                    <i class="fas fa-save"></i>
                                </b-button>
                                 <b-button variant="danger"
                                          @click="deleteIngredient(i)">
                                    <i class="fas fa-trash"></i>
                                </b-button>
                            </td>

                        </tr>
                        </tbody>


                    </template>

                </table>
            </div>
        </div>


    </div>
</template>

<script>
import Vue from "vue"
import {BootstrapVue} from "bootstrap-vue"

import "bootstrap-vue/dist/bootstrap-vue.css"
import {ApiMixin, ResolveUrlMixin, StandardToasts} from "@/utils/utils"
import {ApiApiFactory} from "@/utils/openapi/api";
import GenericMultiselect from "@/components/GenericMultiselect";
import GenericModalForm from "@/components/Modals/GenericModalForm";
import LoadingSpinner from "@/components/LoadingSpinner";
import BetaWarning from "@/components/BetaWarning";

Vue.use(BootstrapVue)

export default {
    name: "IngredientEditorView",
    mixins: [ApiMixin, ResolveUrlMixin],
    components: {BetaWarning, LoadingSpinner, GenericMultiselect, GenericModalForm},
    data() {
        return {
            ingredients: [],
            loading: false,
            food: null,
            unit: null,
            generic_action: null,
            generic_model: null,
            show_food_delete: false,
            show_unit_delete: false,
        }
    },
    computed: {},
    mounted() {
        this.$i18n.locale = window.CUSTOM_LOCALE
        if (window.DEFAULT_FOOD !== -1) {
            this.food = {id: window.DEFAULT_FOOD}
            let apiClient = new ApiApiFactory()
            apiClient.retrieveFood(this.food.id).then(r => {
                this.food = r.data
            })
        }
        if (window.DEFAULT_UNIT !== -1) {
            this.unit = {id: window.DEFAULT_UNIT}
            let apiClient = new ApiApiFactory()
            apiClient.retrieveUnit(this.unit.id).then(r => {
                this.unit = r.data
            })
        }
        this.refreshList()
    },
    methods: {
        refreshList: function () {
            if (this.food === null && this.unit === null) {
                this.ingredients = []
            } else {
                this.loading = true
                let apiClient = new ApiApiFactory()
                let params = {'query': {'simple': 1}}
                if (this.food !== null) {
                    params.query.food = this.food.id
                }
                if (this.unit !== null) {
                    params.query.unit = this.unit.id
                }
                apiClient.listIngredients(params).then(result => {
                    this.ingredients = result.data
                    this.loading = false
                }).catch((err) => {
                    StandardToasts.makeStandardToast(StandardToasts.FAIL_FETCH)
                    this.loading = false
                })
            }
        },
        updateIngredient: function (i) {
            let update_list = []
            if (i === undefined) {
                this.ingredients.forEach(x => {
                    if (x.changed) {
                        update_list.push(x)
                    }
                })
            } else {
                update_list = [i]
            }

            update_list.forEach(i => {
                let apiClient = new ApiApiFactory()
                apiClient.updateIngredient(i.id, i).then(r => {
                    this.$set(i, 'changed', false)
                }).catch((r, e) => {
                    StandardToasts.makeStandardToast(StandardToasts.FAIL_UPDATE)
                })
            })
        },
        deleteIngredient: function (i){
            if (confirm(this.$t('delete_confirmation', this.$t('Ingredient')))){
                let apiClient = new ApiApiFactory()
                apiClient.destroyIngredient(i.id).then(r => {
                    StandardToasts.makeStandardToast(StandardToasts.SUCCESS_DELETE)
                    this.ingredients = this.ingredients.filter(li => li.id !== i.id)
                }).catch(e => {
                    StandardToasts.makeStandardToast(StandardToasts.FAIL_DELETE)
                })
            }
        }

    },
}
</script>

<style>

</style>
