<template>
    <div>


        <div class="card p-2" v-if="recipe !== undefined" >
            <h5><i class="fas fa-database"></i> {{$t('Properties')}}</h5>
            <table class="table table-bordered table-sm">

                <tr v-for="p in recipe.food_properties" v-bind:key="`id_${p.id}`">
                    <td>
                        <button class="btn btn-danger btn-sm"
                                @click="selected_property = p"
                                v-if="p.missing_value"><i
                                class="fas fa-exclamation-triangle"></i>
                        </button>
                        {{ p.icon }} {{ p.name }}
                    </td>
                    <td>{{ p.total_value }} {{ p.unit }}</td>
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
    },
    data() {
        return {
            selected_property: undefined,
        }
    },
    computed: {
        show_modal: function () {
            return this.selected_property !== undefined
        },
    },
    mounted() {

    },
    methods: {},
}
</script>

<style scoped>

</style>