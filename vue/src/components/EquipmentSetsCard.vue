<template>
    <div :class="{ 'card border-primary no-border': header }">
        <div :class="{ 'card-body': header, 'p-0': header }">
            <div class="card-header" v-if="header">
                <div class="row">
                    <div class="col-6">
                        <h4 class="card-title"><i class="fas fa-toolbox"></i> {{ $t("Equipment Sets") }}</h4>
                    </div>
                </div>
            </div>
            <div class="card-body p-1 p-md-3">

                <div class="row no-gutter">
                    <div class="col-12 m-0" :class="{ 'p-0': !header }">
                        <table class="table table-sm mb-0">
                            <!-- eslint-disable vue/no-v-for-template-key-on-child -->
                            <template v-for="s in steps">
                                <tr v-bind:key="s.id" v-if="s.show_as_header && s.name !== '' && steps.length > 1">
                                    <td colspan="5">
                                        <b>{{ s.name }}</b>
                                    </td>
                                </tr>
                                <template v-for="e in s.equipmentsets">
                                    <equipment-set-component
                                        :equipmentset="e"
                                        :equipmentset_factor="equipment_factor"
                                        :use_plural="use_plural"
                                        :key="e.id"
                                        :detailed="detailed"
                                        @checked-state-changed="$emit('checked-state-changed', $event)"
                                    />
                                </template>
                            </template>
                            <!-- eslint-enable vue/no-v-for-template-key-on-child -->
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Vue from "vue"
import {BootstrapVue} from "bootstrap-vue"
import "bootstrap-vue/dist/bootstrap-vue.css"

import EquipmentSetComponent from "@/components/EquipmentSetComponent"
import {ApiMixin} from "@/utils/utils"

Vue.use(BootstrapVue)

export default {
    name: "EquipmentSetsCard",
    mixins: [ApiMixin],
    components: {EquipmentSetComponent},
    props: {
        steps: {
            type: Array,
            default() {
                return []
            },
        },
        recipe: {type: Number},
        equipment_factor: {type: Number, default: 1},
        servings: {type: Number, default: 1},
        use_plural: {type: Boolean, default: false},
        detailed: {type: Boolean, default: true},
        header: {type: Boolean, default: false},
        recipe_list: {type: Number, default: undefined},
    },
    data() {
        return {

        }
    },
    computed: {

    },
    watch: {

    },
    mounted() {

    },
    methods: {

    },
}
</script>
