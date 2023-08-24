<template>

    <div>

        <b-modal :id="id" size="xl" @hidden="cancelAction" :body-class="`pr-3 pl-3`">

            <template v-slot:modal-title>
                <div class="row" v-if="equipment">
                    <div class="col-12">
                        <h2>{{ equipment.name }} <small class="text-muted" v-if="equipment.plural_name">{{
                                equipment.plural_name
                            }}</small>
                        </h2>
                    </div>
                </div>
            </template>

            <div>
                <b-tabs content-class="mt-3" v-if="equipment">
                    <b-tab title="General" active>
                        <b-form>
                            <b-form-group :label="$t('Name')" description="">
                                <b-form-input v-model="equipment.name"></b-form-input>
                            </b-form-group>
                            <b-form-group :label="$t('Plural')" description="">
                                <b-form-input v-model="equipment.plural_name"></b-form-input>
                            </b-form-group>
                            <b-form-group :label="$t('Description')" description="">
                                <b-form-textarea v-model="equipment.description" rows="2"></b-form-textarea>
                            </b-form-group>
                            <b-form-group :label="$t('Available Quantity')">
                                <b-form-input v-model="equipment.available_quantity"></b-form-input>
                            </b-form-group>
                        </b-form>
                    </b-tab>
                    
                    <b-tab title="More">
                        <b-form>


                            <b-form-group :label="$t('Recipe')" :description="$t('equipment_recipe_help')">
                                <generic-multiselect
                                    @change="equipment.recipe = $event.val;"
                                    :model="Models.RECIPE"
                                    :initial_single_selection="equipment.recipe"
                                    label="name"
                                    :multiple="false"
                                    :placeholder="$t('Recipe')"
                                ></generic-multiselect>
                            </b-form-group>

                            <b-form-group :label="$t('Location')" :description="$t('location_help')">
                                <b-form-input v-model="equipment.location"></b-form-input>
                            </b-form-group>
                            <b-form-group :label="$t('Serial Number')" :description="$t('serialnumber_help')">
                                <b-form-input v-model="equipment.serial_number"></b-form-input>
                            </b-form-group>
                            <table>
                                <tr>
                                    <td>
                                        <b-form-group :label="$t('Weight')" :description="$t('weight_help')">
                                            <b-form-input v-model="equipment.weight"></b-form-input>
                                        </b-form-group>
                                    </td>
                                    <td>
                                        <b-form-group :label="$t('Unit')" :description="$t('equipment_weight_unit_help')">
                                            <generic-multiselect
                                                @change="equipment.weight_unit = $event.val;"
                                                :model="Models.UNIT"
                                                :initial_single_selection="equipment.weight_unit_unit"
                                                label="name"
                                                :multiple="false"
                                                :placeholder="$t('Unit')"
                                            ></generic-multiselect>
                                        </b-form-group>
                                    </td>
                                </tr>
                            </table>
                            
                            <table>
                                <tr>
                                    <td>
                                        <b-form-group :label="$t('Capacity')" :description="$t('capacity_help')">
                                            <b-form-input v-model="equipment.capacity_amount"></b-form-input>
                                        </b-form-group>
                                    </td>
                                    <td>
                                        <b-form-group :label="$t('Unit')" :description="$t('equipment_capacity_unit_help')">
                                            <generic-multiselect
                                                @change="equipment.capacity_unit = $event.val;"
                                                :model="Models.UNIT"
                                                :initial_single_selection="equipment.capacity_unit"
                                                label="name"
                                                :multiple="false"
                                                :placeholder="$t('Unit')"
                                            ></generic-multiselect>
                                        </b-form-group>
                                    </td>
                                </tr>
                            </table>
                            

                            <hr/>
                            <b-form-group :label="$t('InheritFields')" :description="$t('InheritFields_help')">
                                <generic-multiselect
                                    @change="equipment.inherit_fields = $event.val;"
                                    :model="Models.EQUIPMENT_INHERIT_FIELDS"
                                    :initial_selection="equipment.inherit_fields"
                                    label="name"
                                    :multiple="true"
                                    :placeholder="$t('InheritFields')"
                                ></generic-multiselect>
                            </b-form-group>

                            <b-form-group :label="$t('ChildInheritFields')"
                                          :description="$t('ChildInheritFields_help')">
                                <generic-multiselect
                                    @change="equipment.child_inherit_fields = $event.val;"
                                    :model="Models.EQUIPMENT_INHERIT_FIELDS"
                                    :initial_selection="equipment.child_inherit_fields"
                                    label="name"
                                    :multiple="true"
                                    :placeholder="$t('ChildInheritFields')"
                                ></generic-multiselect>
                            </b-form-group>

                            <!-- TODO change to a button -->
                            <b-form-group :description="$t('reset_children_help')">
                                <b-form-checkbox v-model="equipment.reset_inherit">{{
                                        $t('reset_children')
                                    }}
                                </b-form-checkbox>
                            </b-form-group>


                        </b-form>
                    </b-tab>
                </b-tabs>
            </div>

            <template v-slot:modal-footer>
                <b-button variant="primary" @click="updateEquipment">{{ $t('Save') }}</b-button>
            </template>
        </b-modal>
    </div>
</template>


<script>
import Vue from "vue"
import {BootstrapVue} from "bootstrap-vue"

import "bootstrap-vue/dist/bootstrap-vue.css"
import {ApiApiFactory} from "@/utils/openapi/api";
import GenericMultiselect from "@/components/GenericMultiselect.vue";
import {ApiMixin, formFunctions, getForm, StandardToasts} from "@/utils/utils";


Vue.use(BootstrapVue)


export default {
    name: "EquipmentEditor",
    mixins: [ApiMixin],
    components: {
        GenericMultiselect
    },
    props: {
        id: {type: String, default: 'id_equipment_edit_modal_modal'},
        show: {required: true, type: Boolean, default: false},
        item1: {
            type: Object,
            default: undefined
        },
    },
    watch: {
        show: function () {
            if (this.show) {
                this.$bvModal.show(this.id)
            } else {
                this.$bvModal.hide(this.id)
            }
        },
    },
    data() {
        return {
            equipment: undefined
        }
    },
    mounted() {
        this.$bvModal.show(this.id)
        this.$i18n.locale = window.CUSTOM_LOCALE
        let apiClient = new ApiApiFactory()
        let pf
        if (this.item1.id !== undefined) {
            pf = apiClient.retrieveEquipment(this.item1.id).then((r) => {
                this.equipment = r.data
            }).catch(err => {
                StandardToasts.makeStandardToast(this, StandardToasts.FAIL_FETCH, err)
            })
        } else {
            this.equipment = {
                name: "",
                plural_name: "",
                description: "",
                recipe: null,
                parent: null,
                location: "",
                available_quantity: 1.0,
                capacity_amount: 0.0,
                capacity_unit: null,
                serial_number: "",
                weight: 0.0,
                weight_unit: null,
                numchild: 0,
                inherit_fields: [],
                ignore_shopping: false,
                child_inherit_fields: [],
            }
        }
    },
    methods: {
        updateEquipment: function () {
            let apiClient = new ApiApiFactory()
            if (this.equipment.id !== undefined) {
                apiClient.updateEquipment(this.equipment.id, this.equipment).then((r) => {
                    this.equipment = r.data
                    StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_UPDATE)
                }).catch(err => {
                    StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
                })
            } else {
                apiClient.createEquipment(this.equipment).then((r) => {
                    this.equipment = r.data
                    StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_CREATE)
                }).catch(err => {
                    StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
                })
            }
        },
        cancelAction: function () {
            this.$emit("hidden", "")
        },
    },
}
</script>

<style>

</style>
