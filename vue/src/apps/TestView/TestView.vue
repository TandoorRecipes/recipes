<template>

    <div id="app">
        Import Component

        <div v-id="metadata !== undefined">

            <select class="form-control" v-model="selected_version">
                <option v-for="v in metadata.versions" v-bind:key="v">{{ v }}</option>
            </select>

            <div v-if="selected_version !== undefined">
                <table class="table">
                    <tr>
                        <th>{{ $t('Datatype') }}</th>
                        <th>{{ $t('Number of Objects') }}</th>
                    </tr>
                    <tr v-for="d in metadata.datatypes" v-bind:key="d">
                        <td>{{ d }}</td>
                        <td>{{ metadata[selected_version][d] }}</td>
                    </tr>
                </table>

                <button class="btn btn-success" @click="doImport">{{ $t('Import') }}</button>
            </div>

            <div v-if="response_data !== undefined">
                {{response_data}}
            </div>

        </div>


    </div>
</template>


<script>
import Vue from "vue"
import {BootstrapVue} from "bootstrap-vue"

import "bootstrap-vue/dist/bootstrap-vue.css"
import {ApiMixin, resolveDjangoUrl, StandardToasts} from "@/utils/utils";
import axios from "axios";


Vue.use(BootstrapVue)


export default {
    name: "TestView",
    mixins: [ApiMixin],
    components: {},
    data() {
        return {
            metadata: undefined,
            selected_version: undefined,
            response_data: undefined,
        }
    },
    mounted() {
        this.$i18n.locale = window.CUSTOM_LOCALE

        axios.get(resolveDjangoUrl('api_import_open_data')).then(r => {
            this.metadata = r.data
        }).catch(err => {
            StandardToasts.makeStandardToast(this, StandardToasts.FAIL_FETCH, err)
        })
    },
    methods: {
        doImport: function () {
            axios.post(resolveDjangoUrl('api_import_open_data'), {'selected_version': this.selected_version, 'selected_datatypes': this.metadata.datatypes}).then(r => {
                StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_CREATE)
            }).catch(err => {
                StandardToasts.makeStandardToast(this, StandardToasts.FAIL_CREATE, err)
            })
        }
    },
}
</script>

<style>

</style>
