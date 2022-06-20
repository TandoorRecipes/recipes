<template>
    <div id="app">

        <div class="row mt-2">
            <div class="col col-12 col-md-6">
                <b-input-group>
                    <generic-multiselect @change="food = $event.val; refreshList()" ref="food_multiselect"
                                         :model="Models.FOOD"
                                         :initial_single_selection="food"
                                         :multiple="false"
                                         style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"></generic-multiselect>

                    <b-input-group-append>
                        <b-dropdown no-caret right :disabled="food === null">
                            <template #button-content>
                                <i class="fas fa-ellipsis-v"></i>
                            </template>

                            <b-dropdown-item @click="generic_model = Models.FOOD; generic_action=Actions.UPDATE"
                                             :disabled="food === null">
                                <i class="fas fa-edit fa-fw"></i> {{ $t('Edit') }}
                            </b-dropdown-item>
                            <b-dropdown-item @click="generic_model = Models.FOOD; generic_action=Actions.MERGE"
                                             :disabled="food === null">
                                <i class="fas fa-compress-arrows-alt fa-fw"></i> {{ $t('Merge') }}
                            </b-dropdown-item>
                            <b-dropdown-item @click="generic_model = Models.FOOD; generic_action=Actions.DELETE"
                                             :disabled="food === null">
                                <i class="fas fa-trash-alt fa-fw"></i> {{ $t('Delete') }}
                            </b-dropdown-item>

                        </b-dropdown>
                    </b-input-group-append>
                </b-input-group>

                <generic-modal-form :model="Models.FOOD" :action="generic_action" :show="generic_model === Models.FOOD"
                                    :item1="food"
                                    @finish-action="finishGenericAction"/>
            </div>
            <div class="col col-12 col-md-6">

                <b-input-group>

                    <generic-multiselect
                        @change="unit = $event.val; refreshList()"
                        :model="Models.UNIT"
                        ref="unit_multiselect"
                        :initial_single_selection="unit"
                        :multiple="false"
                        style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"></generic-multiselect>

                    <b-input-group-append>
                        <b-dropdown no-caret right :disabled="unit === null">
                            <template #button-content>
                                <i class="fas fa-ellipsis-v"></i>
                            </template>

                            <b-dropdown-item @click="generic_model = Models.UNIT; generic_action=Actions.UPDATE"
                                             :disabled="unit === null">
                                <i class="fas fa-edit fa-fw"></i> {{ $t('Edit') }}
                            </b-dropdown-item>
                            <b-dropdown-item @click="generic_model = Models.UNIT; generic_action=Actions.MERGE"
                                             :disabled="unit === null">
                                <i class="fas fa-compress-arrows-alt fa-fw"></i> {{ $t('Merge') }}
                            </b-dropdown-item>
                            <b-dropdown-item @click="generic_model = Models.UNIT; generic_action=Actions.DELETE"
                                             :disabled="unit === null">
                                <i class="fas fa-trash-alt fa-fw"></i> {{ $t('Delete') }}
                            </b-dropdown-item>

                        </b-dropdown>
                    </b-input-group-append>
                </b-input-group>

                <generic-modal-form :model="Models.UNIT" :action="generic_action" :show="generic_model === Models.UNIT"
                                    :item1="unit"
                                    @finish-action="finishGenericAction()"/>

            </div>
        </div>

        <b-row class="mt-2">
            <b-col cols="12">
                <b-pagination align="center" pills v-model="current_page" :total-rows="total_object_count"
                              :per-page="page_size"
                              @change="pageChange"></b-pagination>
            </b-col>
        </b-row>


        <b-row class="mt-2">
            <b-col>
                <div class="table-responsive" style="overflow: unset">
                    <table class="table table-bordered table-sm" style="">
                        <thead>
                        <tr>
                            <th>{{ $t('Amount') }}</th>
                            <th>{{ $t('Unit') }}</th>
                            <th>{{ $t('Food') }}</th>
                            <th>{{ $t('Note') }}</th>
                            <th class="text-right">
                                <b-button variant="success" class="btn btn-sm" @click="updateIngredient()"><i
                                    class="fas fa-save"></i>
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
                                <td>
                                    <input type="number" class="form-control" v-model="i.amount"
                                           @input="$set(i, 'changed', true)">
                                </td>
                                <td>
                                    <generic-multiselect @change="i.unit = $event.val; $set(i, 'changed', true)"
                                                         :initial_single_selection="i.unit"
                                                         :model="Models.UNIT"
                                                         :search_on_load="false"
                                                         :allow_create="true"
                                                         :create_placeholder="$t('Create')"
                                                         :multiple="false"></generic-multiselect>
                                </td>
                                <td>
                                    <generic-multiselect @change="i.food = $event.val; $set(i, 'changed', true)"
                                                         :initial_single_selection="i.food"
                                                         :model="Models.FOOD"
                                                         :search_on_load="false"
                                                         :allow_create="true"
                                                         :create_placeholder="$t('Create')"
                                                         :multiple="false"></generic-multiselect>
                                </td>
                                <td>
                                    <input class="form-control" v-model="i.note" @keydown="$set(i, 'changed', true)">

                                </td>
                                <td class="text-right">
                                    <b-button-group>
                                        <b-button :disabled="i.changed !== true"
                                                  :variant="(i.changed !== true) ? 'primary' : 'success'"
                                                  @click="updateIngredient(i)">
                                            <i class="fas fa-save"></i>
                                        </b-button>
                                        <b-button variant="danger"
                                                  @click="deleteIngredient(i)">
                                            <i class="fas fa-trash"></i>
                                        </b-button>
                                    </b-button-group>
                                </td>

                            </tr>
                            </tbody>


                        </template>

                    </table>
                </div>


            </b-col>
        </b-row>

        <b-row class="mt-2">
            <b-col cols="12">
                <b-pagination align="center" pills v-model="current_page" :total-rows="total_object_count"
                              :per-page="page_size"
                              @change="pageChange"></b-pagination>
            </b-col>
        </b-row>
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
    components: {LoadingSpinner, GenericMultiselect, GenericModalForm},
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
            current_page: 1,
            total_object_count: 0,
            page_size: 50,
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
                let params = {'query': {'simple': 1,}}
                if (this.food !== null) {
                    params.query.food = this.food.id
                }
                if (this.unit !== null) {
                    params.query.unit = this.unit.id
                }
                apiClient.listIngredients(this.current_page, this.page_size, params).then(result => {
                    this.ingredients = result.data.results
                    this.total_object_count = result.data.count
                    this.loading = false
                }).catch((err) => {
                    StandardToasts.makeStandardToast(this, StandardToasts.FAIL_FETCH, err)
                    this.loading = false
                })
            }
        },
        pageChange: function (page) {
            this.current_page = page
            this.refreshList()
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
                }).catch(err => {
                    StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
                })
            })
        },
        deleteIngredient: function (i) {
            if (confirm(this.$t('delete_confirmation', this.$t('Ingredient')))) {
                let apiClient = new ApiApiFactory()
                apiClient.destroyIngredient(i.id).then(r => {
                    StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_DELETE)
                    this.ingredients = this.ingredients.filter(li => li.id !== i.id)
                }).catch(err => {
                    StandardToasts.makeStandardToast(this, StandardToasts.FAIL_DELETE, err)
                })
            }
        },
        finishGenericAction: function (e) {
            if (e !== 'cancel') {
                if (this.generic_action === this.Actions.DELETE) {
                    this.ingredients = []
                    if (this.generic_model === this.Models.FOOD) {
                        this.food = null;
                    } else {
                        this.unit = null;
                    }
                }

                if (this.generic_action === this.Actions.UPDATE) {
                    if (this.generic_model === this.Models.FOOD) {
                        this.food = e.item
                        this.ingredients.forEach((element, i) => {
                            if (element.food.id === this.food.id) {
                                this.ingredients[i].food = this.food
                            }
                        })
                    } else {
                        this.unit = e.item
                        this.ingredients.forEach((element, i) => {
                            if (element.unit?.id === this.unit.id) {
                                this.ingredients[i].unit = this.unit
                            }
                        })
                    }
                }

                if (this.generic_action === this.Actions.MERGE) {
                    if (this.generic_model === this.Models.FOOD) {
                        this.ingredients.forEach((element, i) => {
                            if (element.food.id === this.food.id) {
                                this.ingredients[i].food = e.target_object
                            }
                        })
                        this.food = e.target_object
                    } else {
                        this.ingredients.forEach((element, i) => {
                            if (element.unit?.id === this.unit.id) {
                                this.ingredients[i].unit = e.target_object
                            }
                        })
                        this.unit = e.target_object
                    }
                    this.refreshList()
                }
            }

            if (this.generic_model === this.Models.FOOD) {
                this.$refs.food_multiselect.search('');
            } else {
                this.$refs.unit_multiselect.search('');
            }

            this.generic_action = null;
            this.generic_model = null;
        }

    },
}
</script>

<style>

</style>
