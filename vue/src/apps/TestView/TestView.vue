<template>

    <div id="app">


        <div class="row" v-if="recipe !== undefined">
            <div class="col-6">
                <div class="card">
                    <table class="table table-bordered table-sm">

                        <tr v-for="p in recipe.food_properties" v-bind:key="`id_${p.id}`">
                            <td>
                                <button class="btn btn-danger btn-sm"
                                        @click="selected_property = p"><i
                                        class="fas fa-exclamation-triangle"></i>
                                </button>
                                {{ p.icon }} {{ p.name }}
                            </td>
                            <td>{{ p.total_value }} {{ p.unit }}</td>
                        </tr>


                    </table>
                </div>
            </div>
        </div>

        <b-modal id="id_modal_property_overview" title="Property Overview" v-model="show_modal" @hidden="selected_property = undefined">
            <template v-if="selected_property !== undefined">
                {{ selected_property.description }}
                <table class="table table-bordered">
                    <tr v-for="f in selected_property.food_values" v-bind:key="`id_${selected_property.id}_food_${f.id}`">
                        <td>{{ f.food }}</td>
                        <td>{{ f.value }} {{ selected_property.unit }}</td>
                    </tr>
                </table>
            </template>


        </b-modal>

    </div>
</template>


<script>
import Vue from "vue"
import {BootstrapVue} from "bootstrap-vue"

import "bootstrap-vue/dist/bootstrap-vue.css"
import {ApiApiFactory} from "@/utils/openapi/api";

import {ApiMixin} from "@/utils/utils";


Vue.use(BootstrapVue)


export default {
    name: "TestView",
    mixins: [ApiMixin],
    components: {},
    data() {
        return {
            recipe: undefined,
            selected_property: undefined,
        }
    },
    computed: {
        show_modal: function () {
            return this.selected_property !== undefined
        },
    },
    mounted() {
        this.$i18n.locale = window.CUSTOM_LOCALE
        let apiClient = new ApiApiFactory()
        apiClient.retrieveRecipe('1').then((r) => {
            this.recipe = r.data
        })

    },
    methods: {},
}
</script>

<style>


</style>
