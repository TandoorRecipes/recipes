<template>
    <div id="app">

        <div class="row mt-2">
            <div class="col col-12 col-md-6">
                <b-input-group>
                    <generic-multiselect @change="equipment = $event.val; refreshList()" ref="equipment_multiselect"
                                         :model="Models.EQUIPMENT"
                                         :initial_single_selection="equipment"
                                         :multiple="false"
                                         style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"></generic-multiselect>

                    <b-input-group-append>
                        <b-dropdown no-caret right :disabled="equipment === null">
                            <template #button-content>
                                <i class="fas fa-ellipsis-v"></i>
                            </template>

                            <b-dropdown-item @click="generic_model = Models.EQUIPMENT; generic_action=Actions.UPDATE"
                                             :disabled="equipment === null">
                                <i class="fas fa-edit fa-fw"></i> {{ $t('Edit') }}
                            </b-dropdown-item>
                            <b-dropdown-item @click="generic_model = Models.EQUIPMENT; generic_action=Actions.MERGE"
                                             :disabled="equipment === null">
                                <i class="fas fa-compress-arrows-alt fa-fw"></i> {{ $t('Merge') }}
                            </b-dropdown-item>
                            <b-dropdown-item @click="generic_model = Models.EQUIPMENT; generic_action=Actions.DELETE"
                                             :disabled="equipment === null">
                                <i class="fas fa-trash-alt fa-fw"></i> {{ $t('Delete') }}
                            </b-dropdown-item>

                        </b-dropdown>
                    </b-input-group-append>
                </b-input-group>

                <generic-modal-form :model="Models.EQUIPMENT" :action="generic_action" :show="generic_model === Models.EQUIPMENT"
                                    :item1="equipment"
                                    @finish-action="finishGenericAction"/>
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
                            <th>{{ $t('Equipment') }}</th>
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
                            <tbody v-for="e in equipmentsets" v-bind:key="e.id">
                            <tr v-if="e.used_in_recipes.length > 0">
                                <td colspan="5">
                                    <a v-for="r in e.used_in_recipes" :href="resolveDjangoUrl('view_recipe',r.id)"
                                       v-bind:key="r.id" target="_blank" rel="noreferrer nofollow">{{ r.name }}</a>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <input type="number" class="form-control" v-model="e.amount"
                                           @input="$set(i, 'changed', true)">
                                </td>
                                <td>
                                    <generic-multiselect @change="e.equipment = $event.val; $set(e, 'changed', true)"
                                                         :initial_single_selection="e.equipment"
                                                         :model="Models.EQUIPMENT"
                                                         :search_on_load="false"
                                                         :allow_create="true"
                                                         :create_placeholder="$t('Create')"
                                                         :multiple="false"></generic-multiselect>
                                </td>
                                <td>
                                    <input class="form-control" v-model="e.note" @keydown="$set(e, 'changed', true)">

                                </td>
                                <td class="text-right">
                                    <b-button-group>
                                        <b-button :disabled="e.changed !== true"
                                                  :variant="(e.changed !== true) ? 'primary' : 'success'"
                                                  @click="updateEquipmentSet(i)">
                                            <i class="fas fa-save"></i>
                                        </b-button>
                                        <b-button variant="danger"
                                                  @click="deleteEquipmentSet(i)">
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
    name: "EquipmentSetEditorView",
    mixins: [ApiMixin, ResolveUrlMixin],
    components: {LoadingSpinner, GenericMultiselect, GenericModalForm},
    data() {
        return {
            equipmentsets: [],
            loading: false,
            equipment: null,
            generic_action: null,
            generic_model: null,
            show_equipment_delete: false,
            current_page: 1,
            total_object_count: 0,
            page_size: 50,
        }
    },
    computed: {},
    mounted() {
        this.$i18n.locale = window.CUSTOM_LOCALE
        if (window.DEFAULT_EQUIPMENT !== -1) {
            this.equipment = {id: window.DEFAULT_EQUIPMENT}
            let apiClient = new ApiApiFactory()
            apiClient.retrieveEquipment(this.equipment.id).then(r => {
                this.equipment = r.data
            })
        }
        this.refreshList()
    },
    methods: {
        refreshList: function () {
            if (this.equipment === null) {
                this.equipmentsets = []
            } else {
                this.loading = true
                let apiClient = new ApiApiFactory()
                let params = {'query': {'simple': 1,}}
                if (this.equipment !== null) {
                    params.query.equipment = this.equipment.id
                }
                apiClient.listEquipmentSets(this.current_page, this.page_size, params).then(result => {
                    this.equipmentsets = result.data.results
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
        updateEquipmentSet: function (i) {
            let update_list = []
            if (i === undefined) {
                this.equipmentsets.forEach(x => {
                    if (x.changed) {
                        update_list.push(x)
                    }
                })
            } else {
                update_list = [i]
            }

            update_list.forEach(e => {
                let apiClient = new ApiApiFactory()
                apiClient.updateEquipmentSet(e.id, e).then(r => {
                    this.$set(e, 'changed', false)
                }).catch(err => {
                    StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
                })
            })
        },
        deleteEquipmentSet: function (e) {
            if (confirm(this.$t('delete_confirmation', this.$t('Equipment Set')))) {
                let apiClient = new ApiApiFactory()
                apiClient.destroyEquipmentSet(e.id).then(r => {
                    StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_DELETE)
                    this.equipmentsets = this.equipmentsets.filter(li => li.id !== e.id)
                }).catch(err => {
                    StandardToasts.makeStandardToast(this, StandardToasts.FAIL_DELETE, err)
                })
            }
        },
        finishGenericAction: function (e) {
            if (e !== 'cancel') {
                if (this.generic_action === this.Actions.DELETE) {
                    this.equipmentsets = []
                    if (this.generic_model === this.Models.EQUIPMENT) {
                        this.equipment = null;
                    }
                }

                if (this.generic_action === this.Actions.UPDATE) {
                    if (this.generic_model === this.Models.EQUIPMENT) {
                        this.equipment = e.item
                        this.equipmentsets.forEach((element, i) => {
                            if (element.equipment.id === this.equipment.id) {
                                this.equipmentsets[i].equipment = this.equipment
                            }
                        })
                    }
                }

                if (this.generic_action === this.Actions.MERGE) {
                    if (this.generic_model === this.Models.EQUIPMENT) {
                        this.equipmentsets.forEach((element, i) => {
                            if (element.equipment.id === this.equipment.id) {
                                this.equipmentsets[i].equipment = e.target_object
                            }
                        })
                        this.equipment = e.target_object
                    }
                    this.refreshList()
                }
            }

            if (this.generic_model === this.Models.EQUIPMENT) {
                this.$refs.equipment_multiselect.search('');
            }

            this.generic_action = null;
            this.generic_model = null;
        }

    },
}
</script>

<style>

</style>
