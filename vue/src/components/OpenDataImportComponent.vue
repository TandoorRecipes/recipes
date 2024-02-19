<template>
    <div>
        <beta-warning></beta-warning>

        <div v-if="metadata !== undefined">
            {{ $t('Data_Import_Info') }}
            <a href="https://github.com/TandoorRecipes/open-tandoor-data" target="_blank" rel="noreferrer nofollow">{{ $t('Learn_More') }}</a>


            <select class="form-control" v-model="selected_version">
                <option v-for="v in metadata.versions" v-bind:key="v">{{ v }}</option>
            </select>

            <b-checkbox v-model="update_existing" class="mt-1">{{ $t('Update_Existing_Data') }}</b-checkbox>
            <b-checkbox v-model="use_metric" class="mt-1">{{ $t('Use_Metric') }}</b-checkbox>


            <div v-if="selected_version !== undefined" class="mt-3">
                <table class="table">
                    <tr>
                        <th>{{ $t('Import') }}</th>
                        <th>{{ $t('Datatype') }}</th>
                        <th>{{ $t('Number of Objects') }}</th>
                        <th>{{ $t('Imported') }}</th>
                    </tr>
                    <tr v-for="d in datatypes" v-bind:key="d.name">
                        <td>
                            <b-checkbox v-model="d.selected"></b-checkbox>
                        </td>
                        <td>{{ $t(d.name.charAt(0).toUpperCase() + d.name.slice(1)) }}</td>
                        <td>{{ metadata[selected_version][d.name] }}</td>
                        <td>
                            <template v-if="d.name in import_count">
                                <i class="fas fa-plus-circle"></i> {{ import_count[d.name]['total_created'] }} {{ $t('Created')}} <br/>
                                <i class="fas fa-pencil-alt"></i> {{ import_count[d.name]['total_updated'] }} {{ $t('Updated')}} <br/>
                                <i class="fas fa-forward"></i> {{ import_count[d.name]['total_untouched'] }} {{ $t('Unchanged')}} <br/>
                                <i class="fas fa-exclamation-circle"></i> {{ import_count[d.name]['total_errored'] }} {{ $t('Error')}}
                            </template>
                        </td>
                    </tr>
                </table>

                <button class="btn btn-success" @click="doImport">{{ $t('Import') }}</button>
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
import BetaWarning from "@/components/BetaWarning.vue";


Vue.use(BootstrapVue)


export default {
    name: "OpenDataImportComponent",
    mixins: [ApiMixin],
    components: {BetaWarning},
    data() {
        return {
            metadata: undefined,
            datatypes: {},
            selected_version: undefined,
            update_existing: true,
            use_metric: true,
            import_count: {},
        }
    },
    mounted() {
        this.$i18n.locale = window.CUSTOM_LOCALE

        axios.get(resolveDjangoUrl('api_import_open_data')).then(r => {
            this.metadata = r.data
            for (let i in this.metadata.datatypes) {
                this.datatypes[this.metadata.datatypes[i]] = {
                    name: this.metadata.datatypes[i],
                    selected: false,
                }
            }
        }).catch(err => {
            StandardToasts.makeStandardToast(this, StandardToasts.FAIL_FETCH, err)
        })
    },
    methods: {
        doImport: function () {
            axios.post(resolveDjangoUrl('api_import_open_data'), {
                'selected_version': this.selected_version,
                'selected_datatypes': this.datatypes,
                'update_existing': this.update_existing,
                'use_metric': this.use_metric,
            }).then(r => {
                StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_CREATE)
                this.import_count = Object.assign({}, this.import_count, r.data);
            }).catch(err => {
                StandardToasts.makeStandardToast(this, StandardToasts.FAIL_CREATE, err)
            })
        },
    },
}
</script>

