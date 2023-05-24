<template>
    <div>


        <div class="card p-4 pb-2" v-if="recipe !== undefined">
            <b-row>
                <b-col>
                    <h5><i class="fas fa-database"></i> {{ $t('Properties') }}</h5>
                </b-col>
                <b-col class="text-right">
                    <span v-if="!show_total">{{ $t('per_serving') }} </span>
                    <span v-if="show_total">{{ $t('total') }} </span>

                    <a href="#" @click="show_total = !show_total">
                        <i class="fas fa-toggle-on" v-if="!show_total"></i>
                        <i class="fas fa-toggle-off" v-if="show_total"></i>
                    </a>
                </b-col>
            </b-row>


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
                        <td><a href="#" @click="openFoodEditModal(f)">{{ f.food }}</a></td>
                        <td>{{ f.value }} {{ selected_property.unit }}</td>
                    </tr>
                </table>
            </template>

        </b-modal>

        <generic-modal-form
            :model="Models.FOOD"
            :action="Actions.UPDATE"
            :item1="selected_food"
            :show="show_food_edit_modal"
            @hidden="foodEditorHidden"
        >
        </generic-modal-form>
    </div>
</template>

<script>
import {ApiMixin, StandardToasts} from "@/utils/utils";
import GenericModalForm from "@/components/Modals/GenericModalForm.vue";
import {ApiApiFactory} from "@/utils/openapi/api";

export default {
    name: "FoodPropertyViewComponent",
    mixins: [ApiMixin],
    components: {GenericModalForm},
    props: {
        recipe: Object,
        servings: Number,
    },
    data() {
        return {
            selected_property: undefined,
            selected_food: undefined,
            show_food_edit_modal: false,
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
        },
        openFoodEditModal: function (food) {
            console.log(food)
            let apiClient = ApiApiFactory()
            apiClient.retrieveFood(food.id).then(r => {
                this.selected_food = r.data;
                this.show_food_edit_modal = true
            }).catch(err => {
                StandardToasts.makeStandardToast(this, StandardToasts.FAIL_FETCH, err)
            })
        },
        foodEditorHidden: function (){
            this.show_food_edit_modal = false;
            this.$emit("foodUpdated", "")
        }
    },
}
</script>

<style scoped>

</style>