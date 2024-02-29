<template>
    <tr class="ingredients__item">
        <template v-if="ingredient.is_header">
            <td class="ingredients__header-note header" colspan="5" @click="done">
                <b>{{ ingredient.note }}</b>
            </td>
        </template>

        <template v-else>
            <td class="ingredients__check d-print-none align-baseline py-2" v-if="detailed" @click="done">
                <i class="ingredients__check ingredients__check_checked far fa-check-circle text-success" v-if="ingredient.checked"></i>
                <i class="ingredients__check ingredients__check_checked_false far fa-check-circle text-primary" v-if="!ingredient.checked"></i>
            </td>
            <td class="ingredients__amount text-nowrap" @click="done">
                <span class="ingredients__amount" :class="amountClass" v-if="ingredient.amount !== 0 && !ingredient.no_amount" v-html="amount"></span>
            </td>
            <td class="ingredients__unit" @click="done">
                <span v-if="ingredient.unit !== null && !ingredient.no_amount" :class="unitClass">{{ unitName }}</span>
            </td>
            <td class="ingredients__food" :class="foodClass" @click="done">
                <template v-if="ingredient.food !== null">
                    <a :href="resolveDjangoUrl('view_recipe', ingredient.food.recipe.id)" v-if="ingredient.food.recipe !== null" target="_blank" rel="noopener noreferrer">
                        {{ foodName }}
                    </a>
                    <a :href="ingredient.food.url" v-else-if="ingredient.food.url !== ''" target="_blank" rel="noopener noreferrer">
                        {{ foodName }}</a>
                    <template v-else>
                        <span :class="foodClass">{{ foodName }}</span>
                    </template>
                </template>
            </td>
            <td v-if="detailed" class="ingredients__note align-baseline">
                <template v-if="ingredient.note">
                    <span class="ingredients__note ingredients__note_hover d-print-none touchable py-0 px-2" v-b-popover.hover="ingredient.note">
                        <i class="far fa-comment"></i>
                    </span>

                    <div class="ingredients__note ingredients__note_print d-none d-print-block"><i class="far fa-comment-alt d-print-none"></i> {{ ingredient.note }}</div>
                </template>
            </td>
        </template>
    </tr>
</template>

<script>
import {calculateAmount, ResolveUrlMixin, EscapeCSSMixin} from "@/utils/utils"

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
    mixins: [ResolveUrlMixin, EscapeCSSMixin],
    data() {
        return {
            checked: false,
        }
    },
    watch: {},
    mounted() {
    },
    computed: {
        amount: function() {
            return this.$sanitize(calculateAmount(this.ingredient.amount, this.ingredient_factor))
        },
        isScaledUp: function() {
            return this.ingredient_factor > 1 ? true:false
        },
        isScaledDown: function() {
            return this.ingredient_factor < 1 ? true:false
        },
        amountClass: function () {
            if (this.isScaledDown) {
                return this.escapeCSS('ingredients__amount_scaled_down')
            } else if (this.isScaledUp) {
                return this.escapeCSS('ingredients__amount_scaled_up')
            } else {
                return this.escapeCSS('ingredients__amount_scaled_false')
            }
        },
        isUnitPlural: function () {
            if (this.ingredient.unit.plural_name === '' || this.ingredient.unit.plural_name === null) {
                return false
            } else if (this.ingredient.always_use_plural_unit || this.ingredient.amount * this.ingredient_factor > 1) {
                return true
            } else {
                return false
            }
        },
        isFoodPlural: function () {
            if (this.ingredient.food.plural_name == null || this.ingredient.food.plural_name === '') {
                return false
            }
            if (this.ingredient.always_use_plural_food) {
                return true
            } else if (this.ingredient.no_amount) {
                return false
            } else if (this.ingredient.amount * this.ingredient_factor > 1) {
                return true
            } else {
                return false
            }
        },
        unitClass: function () {
            return this.escapeCSS('_unitname-' + this.ingredient.unit.name)
        },
        foodClass: function () {
            return this.escapeCSS('_foodname-' + this.ingredient.food.name)
        },
        unitName: function () {
            return this.isUnitPlural ? this.ingredient.unit.plural_name : this.ingredient.unit.name
        },
        foodName: function () {
            return this.isFoodPlural ? this.ingredient.food.plural_name : this.ingredient.food.name
        }
    },
    methods: {
        // sends parent recipe ingredient to notify complete has been toggled
        done: function () {
            this.$emit("checked-state-changed", this.ingredient)
        }
    },
}
</script>

<style scoped>
/* increase size of hover/touchable space without changing spacing */
.touchable {
    --target-increase: 2em;
    display: inline-flex;
}

.touchable::after {
    content: "";
    display: inline-block;
    width: var(--target-increase);
    margin-right: calc(var(--target-increase) * -1);
}

.touchable::before {
    content: "";
    display: inline-block;
    width: var(--target-increase);
    margin-left: calc(var(--target-increase) * -1);
}

</style>
