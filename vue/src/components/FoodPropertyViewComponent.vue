<template>
    <div>


        <div class="card p-2" v-if="recipe !== undefined">
            <div class="flex-row">
                <div class="flex-column">
                    <h5><i class="fas fa-database"></i> {{ $t('Properties') }}</h5>
                </div>
                <div class="flex-column align-content-end text-right align-text-bottom">

                    <span v-if="!show_total">{{ $t('per_serving') }}</span>
                    <span v-if="show_total">{{ $t('total') }}</span>

                    <a href="#" @click="show_total = !show_total">
                        <i class="fas fa-toggle-on" v-if="!show_total"></i>
                        <i class="fas fa-toggle-off" v-if="show_total"></i>
                    </a>

                </div>
            </div>


            <table class="table table-bordered table-sm">

                <tr v-for="p in recipe.food_properties" v-bind:key="`id_${p.id}`">
                    <td>

                        {{ p.icon }} {{ p.name }}
                    </td>
                    <td class="text-right">{{ get_amount(p.total_value) }}</td>
                    <td class=""> {{ p.unit }}</td>

                    <td class="align-middle text-center">
                        <a href="#" @click="selected_property = p">
                            <i v-if="p.missing_value" class="text-warning fas fa-exclamation-triangle"></i>
                            <i v-if="!p.missing_value" class="text-muted fas fa-info-circle"></i>
                        </a>
                    </td>
                </tr>


            </table>
        </div>


        <b-modal id="id_modal_property_overview" title="Property Overview" v-model="show_modal"
                 @hidden="selected_property = undefined">
            <template v-if="selected_property !== undefined">
                {{ selected_property.description }}
                <table class="table table-bordered">
                    <tr v-for="f in selected_property.food_values"
                        v-bind:key="`id_${selected_property.id}_food_${f.id}`">
                        <td>{{ f.food }}</td>
                        <td>{{ f.value }} {{ selected_property.unit }}</td>
                    </tr>
                </table>
            </template>


        </b-modal>
    </div>
</template>

<script>
import {ApiMixin} from "@/utils/utils";

export default {
    name: "FoodPropertyViewComponent",
    mixins: [ApiMixin],
    components: {},
    props: {
        recipe: Object,
        servings: Number,
    },
    data() {
        return {
            selected_property: undefined,
            show_total: false,
        }
    },
    computed: {
        show_modal: function () {
            return this.selected_property !== undefined
        },
    },
    mounted() {

    },
    methods: {
        get_amount: function (amount) {
            if (this.show_total) {
                return (amount * (this.servings / this.recipe.servings)).toLocaleString(window.CUSTOM_LOCALE, {
                    'maximumFractionDigits': 2,
                    'minimumFractionDigits': 2
                })
            } else {
                return (amount / this.recipe.servings).toLocaleString(window.CUSTOM_LOCALE, {
                    'maximumFractionDigits': 2,
                    'minimumFractionDigits': 2
                })
            }
        }
    },
}
</script>

<style scoped>

</style>