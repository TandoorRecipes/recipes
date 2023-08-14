<template>
    <tr>
        <template v-if="ingredient.is_header">
            <td colspan="5" @click="done">
                <b>{{ ingredient.note }}</b>
            </td>
        </template>

        <template v-else>
            <td class="d-print-none" v-if="detailed" @click="done">
                <i class="far fa-check-circle text-success" v-if="ingredient.checked"></i>
                <i class="far fa-check-circle text-primary" v-if="!ingredient.checked"></i>
            </td>
            <td class="text-nowrap" @click="done">
                <span v-if="ingredient.amount !== 0 && !ingredient.no_amount" v-html="calculateAmount(ingredient.amount)"></span>
            </td>
            <td @click="done">
                <template v-if="ingredient.unit !== null && !ingredient.no_amount">
                    <template>
                        <template v-if="ingredient.unit.plural_name === '' || ingredient.unit.plural_name === null">
                            <span>{{ ingredient.unit.name }}</span>
                        </template>
                        <template v-else>
                            <span v-if="ingredient.always_use_plural_unit">{{ ingredient.unit.plural_name }}</span>
                            <span v-else-if="ingredient.amount * this.ingredient_factor > 1">{{ ingredient.unit.plural_name }}</span>
                            <span v-else>{{ ingredient.unit.name }}</span>
                        </template>
                    </template>
                </template>
            </td>
            <td @click="done">
                <template v-if="ingredient.food !== null">
                    <a :href="resolveDjangoUrl('view_recipe', ingredient.food.recipe.id)" v-if="ingredient.food.recipe !== null" target="_blank" rel="noopener noreferrer">
                        {{ ingredientName(ingredient) }}
                    </a>
                    <a :href="ingredient.food.url" v-else-if="ingredient.food.url !== ''" target="_blank" rel="noopener noreferrer">
                        {{ ingredientName(ingredient) }}</a>
                    <template v-else>
                        <span>{{ ingredientName(ingredient) }}</span>
                    </template>
                </template>
            </td>
            <td v-if="detailed">
                <template v-if="ingredient.note">
                    <span v-b-popover.hover="ingredient.note" class="d-print-none touchable py-0 px-2">
                        <i class="far fa-comment"></i>
                    </span>

                    <div class="d-none d-print-block"><i class="far fa-comment-alt d-print-none"></i> {{ ingredient.note }}</div>
                </template>
            </td>
        </template>
    </tr>
</template>

<script>
import {calculateAmount, ResolveUrlMixin} from "@/utils/utils"

import Vue from "vue"
import VueSanitize from "vue-sanitize"

Vue.use(VueSanitize)

export default {
    name: "IngredientComponent",
    props: {
        ingredient: Object,
        ingredient_factor: {type: Number, default: 1},
        detailed: {type: Boolean, default: true},
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
            return this.$sanitize(calculateAmount(x, this.ingredient_factor))
        },
        // sends parent recipe ingredient to notify complete has been toggled
        done: function () {
            this.$emit("checked-state-changed", this.ingredient)
        },
        ingredientName: function (ingredient) {
            if (ingredient.food.plural_name == null || ingredient.food.plural_name === '') {
                return ingredient.food.name
            }
            if (ingredient.always_use_plural_food) {
                return ingredient.food.plural_name
            } else if (ingredient.no_amount) {
                return ingredient.food.name
            } else if (ingredient.amount * this.ingredient_factor > 1) {
                return ingredient.food.plural_name
            } else {
                return ingredient.food.name
            }
        }
    },
}
</script>

<style scoped>
/* increase size of hover/touchable space without changing spacing */
.touchable {
    /* padding-right: 2em;
    padding-left: 2em; */
    margin-right: -1em;
    margin-left: -1em;
}
</style>
