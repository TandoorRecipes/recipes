<template>
    <div v-if="hasRecipeProperties || hasFoodProperties">


        <div class="card p-4 pb-2" v-if="recipe !== undefined && property_list.length > 0">
            <b-row>
                <b-col>
                    <h5><i class="fas fa-database"></i> {{ $t('Properties') }}</h5>
                </b-col>
                <b-col class="text-right">

                    <div v-if="hasRecipeProperties && hasFoodProperties">
                        <span v-if="!show_recipe_properties">{{ $t('Food') }} </span>
                        <span v-if="show_recipe_properties">{{ $t('Recipe') }} </span>

                        <a href="#" @click="show_recipe_properties = !show_recipe_properties">
                            <i class="fas fa-toggle-on" v-if="!show_recipe_properties"></i>
                            <i class="fas fa-toggle-off" v-if="show_recipe_properties"></i>
                        </a>
                    </div>

                </b-col>
            </b-row>


            <table class="table table-bordered table-sm">
                <tr>
                    <td style="border-top: none"></td>
                    <td class="text-right" style="border-top: none">{{ $t('per_serving') }}</td>
                    <td class="text-right" style="border-top: none">{{ $t('total') }}</td>
                    <td style="border-top: none"></td>
                </tr>

                <tr v-for="p in property_list" v-bind:key="`id_${p.id}`">
                    <td>
                        {{ p.name }}
                    </td>
                    <td class="text-right">{{ roundDecimals(p.property_amount_per_serving) }}</td>
                    <td class="text-right">{{ roundDecimals(p.property_amount_total) }}</td>
                    <td class=""> {{ p.unit }}</td>

                    <td class="align-middle text-center" v-if="!show_recipe_properties">
                        <a href="#" @click="selected_property = p">
                            <i v-if="p.missing_value" class="text-warning fas fa-exclamation-triangle"></i>
                            <i v-if="!p.missing_value" class="text-muted fas fa-info-circle"></i>
                        </a>
                    </td>
                </tr>
            </table>

            <div class="text-center">
                <b-button variant="success" :href="resolveDjangoUrl('view_property_editor', recipe.id)"><i class="fas fa-table"></i> {{ $t('Property_Editor') }}</b-button>
            </div>
        </div>


        <b-modal id="id_modal_property_overview" :title="selected_property.name" v-model="show_modal" v-if="selected_property !== undefined"
                 @hidden="selected_property = undefined">
            <template v-if="selected_property !== undefined">
                {{ selected_property.description }}
                <table class="table table-bordered">
                    <tr v-for="f in selected_property.food_values"
                        v-bind:key="`id_${selected_property.id}_food_${f.id}`">
                        <td><a href="#" @click="openFoodEditModal(f)">{{ f.food }}</a></td>
                        <td>
                            <template v-if="f.value == null">
                                <i class="text-warning fas fa-exclamation-triangle"></i>
                            </template>
                            <template v-else>
                                {{ roundDecimals(f.value) }} {{ selected_property.unit }}
                            </template>
                        </td>
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
import {ApiMixin, resolveDjangoUrl, roundDecimals, StandardToasts} from "@/utils/utils";
import GenericModalForm from "@/components/Modals/GenericModalForm.vue";
import {ApiApiFactory} from "@/utils/openapi/api";

export default {
    name: "PropertyViewComponent",
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
            show_recipe_properties: false,
        }
    },
    computed: {
        show_modal: function () {
            return this.selected_property !== undefined
        },
        hasRecipeProperties: function () {
            return this.recipe.properties.length !== 0
        },
        hasFoodProperties: function () {
            let has_food_properties = false
            for (const [key, fp] of Object.entries(this.recipe.food_properties)) {
                if (fp.total_value !== 0) {
                    has_food_properties = true
                }
            }
            console.log('has food propers', has_food_properties)
            return has_food_properties
        },
        property_list: function () {
            let pt_list = []
            if (this.show_recipe_properties) {
                this.recipe.properties.forEach(rp => {
                    pt_list.push(
                        {
                            'id': rp.property_type.id,
                            'name': rp.property_type.name,
                            'description': rp.property_type.description,
                            'icon': rp.property_type.icon,
                            'food_values': [],
                            'property_amount_per_serving': rp.property_amount,
                            'property_amount_total': rp.property_amount * this.recipe.servings * (this.servings / this.recipe.servings),
                            'missing_value': false,
                            'unit': rp.property_type.unit,
                            'type': rp.property_type,
                        }
                    )
                })
            } else {
                for (const [key, fp] of Object.entries(this.recipe.food_properties)) {
                    pt_list.push(
                        {
                            'id': fp.id,
                            'name': fp.name,
                            'description': fp.description,
                            'icon': fp.icon,
                            'food_values': fp.food_values,
                            'property_amount_per_serving': fp.total_value / this.recipe.servings,
                            'property_amount_total': fp.total_value * (this.servings / this.recipe.servings),
                            'missing_value': fp.missing_value,
                            'unit': fp.unit,
                            'type': fp,
                        }
                    )
                }
            }

            function compare(a, b) {
                if (a.type.order > b.type.order) {
                    return 1
                }
                if (a.type.order < b.type.order) {
                    return -1
                }
                return 0
            }

            return pt_list.sort(compare)
        }
    },
    mounted() {
        if (this.hasRecipeProperties && !this.hasFoodProperties) {
            this.show_recipe_properties = true
        }
    },
    methods: {
        resolveDjangoUrl,
        roundDecimals,
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
        foodEditorHidden: function () {
            this.show_food_edit_modal = false;
            this.$emit("foodUpdated", "")
        }
    },
}
</script>

<style scoped>

</style>