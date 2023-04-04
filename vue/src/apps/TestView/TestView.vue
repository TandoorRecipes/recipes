<template>

    <div id="app">


        <div class="row" v-if="recipe !== undefined">
            <div class="col-6">
                <div class="card">
                    <table>
                        <tbody v-for="p in recipe.food_properties" v-bind:key="`id_${p.id}`">
                            <tr>
                                <td><b-button v-b-toggle="`id_collapse_property_${p.id}`" size="sm"><i class="fas fa-caret-right"></i></b-button></td>
                                <td>{{ p.icon }}</td>
                                <td>{{ p.name }}</td>
                                <td>{{ p.total_value }} {{ p.unit }}</td>
                            </tr>
                            <b-collapse :id="`id_collapse_property_${p.id}`" class="mt-2">
                                <tr>
                                    <td colspan="4">
                                        {{p.description}}
                                    </td>
                                </tr>
                                <tr v-for="f in p.food_values" v-bind:key="`id_${p.id}_food_${f.id}`">
                                    <td>{{f.food}}</td>
                                    <td>{{f.value}} {{ p.unit }}</td>
                                </tr>
                            </b-collapse>
                        </tbody>

                    </table>
                </div>
            </div>
        </div>


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

        }
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
