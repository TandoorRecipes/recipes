<template>
    <div id="app">
        <div class="row">
            <div class="col-md-6">
                <generic-multiselect @change="food = $event.val; refreshList()"
                                     :model="Models.FOOD"
                                     :multiple="false"></generic-multiselect>
            </div>
            <div class="col-md-6">
                <generic-multiselect @change="unit = $event.val; refreshList()"
                                     :model="Models.UNIT"
                                     :multiple="false"></generic-multiselect>
            </div>
        </div>

        <table class="table table-bordered">
            <thead>
            <tr>
                <th>Amount</th>
                <th>Unit</th>
                <th>Food</th>
                <th>Note</th>
                <th>Save</th>
            </tr>
            </thead>
            <tr v-for="i in ingredients" v-bind:key="i.id">
                <td style="width: 10vw">
                    <input type="number" class="form-control" v-model="i.amount">
                </td>
                <td style="width: 30vw">
                    <generic-multiselect @change="i.unit = $event.val;"
                                         :initial_selection="i.unit"
                                         :model="Models.UNIT"
                                         :search_on_load="false"
                                         :multiple="false"></generic-multiselect>
                </td>
                <td style="width: 30vw">
                    <generic-multiselect @change="i.food = $event.val;"
                                         :initial_selection="i.food"
                                         :model="Models.FOOD"
                                         :search_on_load="false"
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

Vue.use(BootstrapVue)

export default {
    name: "IngredientEditorView",
    mixins: [ApiMixin],
    components: {GenericMultiselect},
    data() {
        return {
            ingredients: [],
            food: null,
            unit: null,
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
        }
    },
}
</script>

<style>

</style>
