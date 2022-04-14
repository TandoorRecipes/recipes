<template>
    <div id="app">
        <div class="row">
            <div class="col-md-6">
                <generic-multiselect @change="food = $event.val; refreshList()"
                                     :model="Models.FOOD"
                                     :initial_single_selection="food"
                                     :multiple="false"></generic-multiselect>
                <b-button @click="show_food_delete=true" :disabled="food === null"> <i class="fas fa-trash-alt"></i></b-button>
                <generic-modal-form :model="Models.FOOD" :action="Actions.DELETE" :show="show_food_delete" :item1="food"
                                @finish-action="food = null; show_food_delete=false"/>
            </div>
            <div class="col-md-6">
                <generic-multiselect @change="unit = $event.val; refreshList()"
                                     :model="Models.UNIT"
                                     :initial_single_selection="unit"
                                     :multiple="false"></generic-multiselect>
<!--TODO remove unit/Food from list when deleted -->
                 <b-button @click="show_unit_delete=true" :disabled="unit === null"> <i class="fas fa-trash-alt"></i></b-button>
                <generic-modal-form :model="Models.UNIT" :action="Actions.DELETE" :show="show_unit_delete" :item1="unit"
                                @finish-action="unit = null; show_unit_delete=false"/>
            </div>
        </div>

        <table class="table table-bordered">
            <thead>
            <tr>
                <th>{{$t('Amount')}}</th>
                <th>{{$t('Unit')}}</th>
                <th>{{$t('Food')}}</th>
                <th>{{$t('Note')}}</th>
                <th>{{$t('Save')}}</th>
            </tr>
            </thead>
            <tr v-for="i in ingredients" v-bind:key="i.id">
                <td style="width: 10vw">
                    <input type="number" class="form-control" v-model="i.amount">
                </td>
                <td style="width: 30vw">
                    <generic-multiselect @change="i.unit = $event.val;"
                                         :initial_single_selection="i.unit"
                                         :model="Models.UNIT"
                                         :search_on_load="false"
                                         :allow_create="true"
                                         :create_placeholder="$t('Create')"
                                         :multiple="false"></generic-multiselect>
                </td>
                <td style="width: 30vw">
                    <generic-multiselect @change="i.food = $event.val;"
                                         :initial_single_selection="i.food"
                                         :model="Models.FOOD"
                                         :search_on_load="false"
                                         :allow_create="true"
                                         :create_placeholder="$t('Create')"
                                         :multiple="false"></generic-multiselect>
                </td>
                <td style="width: 30vw">
                    <input class="form-control" v-model="i.note">

                </td>
                <td>
                    <b-button variant="primary" @click="updateIngredient(i)">Save</b-button>
                </td>

            </tr>
        </table>


    </div>
</template>

<script>
import Vue from "vue"
import {BootstrapVue} from "bootstrap-vue"

import "bootstrap-vue/dist/bootstrap-vue.css"
import {ApiMixin, StandardToasts} from "@/utils/utils"
import {ApiApiFactory} from "@/utils/openapi/api";
import GenericMultiselect from "@/components/GenericMultiselect";
import GenericModalForm from "@/components/Modals/GenericModalForm";

Vue.use(BootstrapVue)

export default {
    name: "IngredientEditorView",
    mixins: [ApiMixin],
    components: {GenericMultiselect, GenericModalForm},
    data() {
        return {
            ingredients: [],
            food: null,
            unit: null,
            show_food_delete: false,
            show_unit_delete: false,
        }
    },
    computed: {},
    mounted() {
        this.$i18n.locale = window.CUSTOM_LOCALE
        this.refreshList()
    },
    methods: {
        refreshList: function () {
            if (this.food === null && this.unit === null) {
                this.ingredients = []
            } else {
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
                })
            }
        },
        updateIngredient: function (i) {
            let apiClient = new ApiApiFactory()
            apiClient.updateIngredient(i.id, i).then(r => {
                StandardToasts.makeStandardToast(StandardToasts.SUCCESS_UPDATE)
            }).catch((r, e) => {
                StandardToasts.makeStandardToast(StandardToasts.FAIL_UPDATE)
            })
        },
    },
}
</script>

<style>

</style>
