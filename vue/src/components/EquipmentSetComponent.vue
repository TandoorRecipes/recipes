<template>
    <tr>
        <template v-if="equipmentset.is_header">
            <td colspan="5" @click="done">
                <b>{{ equipmentset.note }}</b>
            </td>
        </template>

        <template v-else>
            <td class="d-print-none" v-if="detailed" @click="done">
                <i class="far fa-check-circle text-success" v-if="equipmentset.checked"></i>
                <i class="far fa-check-circle text-primary" v-if="!equipmentset.checked"></i>
            </td>
            <td class="text-nowrap" @click="done">
                <span v-if="equipmentset.amount !== 0 && !equipmentset.no_amount"
                      v-html="calculateAmount(equipmentset.amount)"></span>
            </td>
            <td @click="done">
                <template v-if="equipmentset.equipment !== null">
                    <a :href="resolveDjangoUrl('view_recipe', equipmentset.equipment.recipe.id)"
                        v-if="equipmentset.equipment.recipe !== null" target="_blank"
                        rel="noopener noreferrer">{{ equipmentset.equipment.name }}</a>
                    <template v-if="equipmentset.equipment.recipe === null">

                        <template>
                            <template v-if="equipmentset.equipment.plural_name === '' || equipmentset.equipment.plural_name === null">
                                <span>{{ equipmentset.equipment.name }}</span>
                            </template>
                            <template v-else>
                                <span v-if="equipmentset.always_use_plural">{{ equipmentset.equipment.plural_name }}</span>
                                <span v-else-if="equipmentset.no_amount">{{ equipmentset.equipment.name }}</span>
                                <span v-else-if="(equipmentset.amount * this.equipmentset_factor) > 1">{{ equipmentset.equipment.plural_name }}</span>
                                <span v-else>{{ equipmentset.equipment.name }}</span>
                            </template>
                        </template>
                    </template>
                </template>
            </td>
            <td v-if="detailed">
                <div v-if="equipmentset.note">
                    <span v-b-popover.hover="equipmentset.note" class="d-print-none touchable p-0 pl-md-2 pr-md-2">
                        <i class="far fa-comment"></i>
                    </span>

                    <div class="d-none d-print-block"><i class="far fa-comment-alt d-print-none"></i> {{
                            equipmentset.note
                        }}
                    </div>
                </div>
            </td>
        </template>
    </tr>
</template>
<script>
import {calculateAmount, ResolveUrlMixin} from "@/utils/utils"

import Vue from "vue"
import VueSanitize from "vue-sanitize";

Vue.use(VueSanitize);

export default {
    name: "EquipmentSetComponent",
    props: {
        equipmentset: Object,
        equipmentset_factor: {type: Number, default: 1},
        detailed: {type: Boolean, default: true}
    },
    mixins: [ResolveUrlMixin],
    data() {
        return {
            checked: false,
        }
    },
    watch: {},
    mounted() {

    },
    methods: {
        calculateAmount: function (x) {
            return this.$sanitize(calculateAmount(x, this.equipmentset_factor))
        },
        done: function () {
            this.$emit("checked-state-changed", this.equipmentset)
        }
    }
}
</script>
<style scoped>
/* increase size of hover/touchable space without changing spacing */
.touchable {
    padding-right: 2em;
    padding-left: 2em;
    margin-right: -2em;
    margin-left: -2em;
}
</style>
