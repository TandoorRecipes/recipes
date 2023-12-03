<template>

    <div id="app">
        <div>

            <b-row>
                <b-col>
                    <b-input v-model="query" @change="refreshData"></b-input>
                </b-col>
            </b-row>

            <b-row class="mt-5">
                <b-col>
                    <ul>

                        <b-media tag="li" v-for="d in data" v-bind:key="d.id">
                            <template #aside>
                                <b-img-lazy thumbnail width="64" alt="placeholder" :src="d.image"></b-img-lazy>
                            </template>
                            <h5 class="mt-0 mb-1">{{ d.name }}</h5>
                            <p class="mb-0">
                                Cras sit amet nibh libero, in gravida nulla.
                            </p>
                            <p class="float-right">
                                <b-button class="ml-1">1</b-button>
                                <b-button class="ml-1">1</b-button>
                                <b-button class="ml-1">1</b-button>
                            </p>
                        </b-media>

                    </ul>


                </b-col>
            </b-row>

            <b-row>
                <b-col class="text-center align-items-center">
                    <b-pagination
                        v-model="current_page"
                        :total-rows="items_total"
                        :per-page="items_per_page"
                        aria-controls="data_table"
                        align="center"
                        @change="refreshData"
                    ></b-pagination>
                </b-col>
            </b-row>

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
import {Models} from "@/utils/models";


Vue.use(BootstrapVue)


export default {
    name: "TestView",
    mixins: [ApiMixin],
    components: {},
    computed: {},
    data() {
        return {
            active_model: Models.FOOD,

            data: [],
            query: "",

            items_per_page: 25,
            items_total: 0,
            current_page: 1,

        }
    },
    mounted() {
        this.$i18n.locale = window.CUSTOM_LOCALE

        this.refreshData()
    },
    methods: {
        refreshData: function () {
            let apiClient = new ApiApiFactory()
            apiClient.listFoods(this.query, 0, 0, this.current_page, this.items_per_page, {query: {extended: 1}}).then(result => {
                this.items_total = result.data.count
                this.data = result.data.results
            }).catch((err) => {
                StandardToasts.makeStandardToast(this, StandardToasts.FAIL_FETCH, err)
            })
        }
    },
}
</script>

<style>

</style>
