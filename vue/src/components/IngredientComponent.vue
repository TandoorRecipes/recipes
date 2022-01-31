<template>
    <tr>
        <template v-if="ingredient.is_header">
            <td colspan="5" @click="done">
                <b>{{ ingredient.note }}</b>
            </td>
        </template>

        <template v-else>
            <td class="d-print-non" v-if="detailed && !show_shopping" @click="done">
                <i class="far fa-check-circle text-success" v-if="ingredient.checked"></i>
                <i class="far fa-check-circle text-primary" v-if="!ingredient.checked"></i>
            </td>
            <td class="text-nowrap" @click="done">
                <span v-if="ingredient.amount !== 0" v-html="calculateAmount(ingredient.amount)"></span>
            </td>
            <td @click="done">
                <span v-if="ingredient.unit !== null && !ingredient.no_amount">{{ ingredient.unit.name }}</span>
            </td>
            <td @click="done">
                <template v-if="ingredient.food !== null">
                    <a :href="resolveDjangoUrl('view_recipe', ingredient.food.recipe.id)" v-if="ingredient.food.recipe !== null" target="_blank" rel="noopener noreferrer">{{ ingredient.food.name }}</a>
                    <span v-if="ingredient.food.recipe === null">{{ ingredient.food.name }}</span>
                </template>
            </td>
            <td v-if="detailed && !show_shopping">
                <div v-if="ingredient.note">
                    <span v-b-popover.hover="ingredient.note" class="d-print-none touchable">
                        <i class="far fa-comment"></i>
                    </span>

                    <div class="d-none d-print-block"><i class="far fa-comment-alt d-print-none"></i> {{ ingredient.note }}</div>
                </div>
            </td>
            <td v-else-if="show_shopping" class="text-right text-nowrap">
                <b-button
                    v-if="!ingredient.food.ignore_shopping"
                    class="btn text-decoration-none fas fa-shopping-cart px-2 user-select-none"
                    variant="link"
                    v-b-popover.hover.click.blur.html.top="{ title: ShoppingPopover, variant: 'outline-dark' }"
                    :class="{
                        'text-success': ingredient.shopping_status === true,
                        'text-muted': ingredient.shopping_status === false,
                        'text-warning': ingredient.shopping_status === null,
                    }"
                />
                <span v-if="!ingredient.food.ignore_shopping" class="px-2">
                    <input type="checkbox" class="align-middle" v-model="shop" @change="changeShopping" />
                </span>
                <on-hand-badge v-if="!ingredient.food.ignore_shopping" :item="ingredient.food" />
            </td>
        </template>
    </tr>
</template>

<script>
import { calculateAmount, ResolveUrlMixin, ApiMixin } from "@/utils/utils"
import OnHandBadge from "@/components/Badges/OnHand"

export default {
    name: "IngredientComponent",
    components: { OnHandBadge },
    props: {
        ingredient: Object,
        ingredient_factor: { type: Number, default: 1 },
        detailed: { type: Boolean, default: true },
        show_shopping: { type: Boolean, default: false },
    },
    mixins: [ResolveUrlMixin, ApiMixin],
    data() {
        return {
            checked: false,
            shop: false, // in shopping list for this recipe: boolean
            dirty: undefined,
        }
    },
    watch: {
        ingredient: {
            handler() {},
            deep: true,
        },
        "ingredient.shop": function (newVal) {
            this.shop = newVal
        },
    },
    mounted() {
        this.shop = this.ingredient?.shop
    },
    computed: {
        ShoppingPopover() {
            if (this.ingredient?.shopping_status == false) {
                return this.$t("NotInShopping", { food: this.ingredient.food.name })
            } else {
                let category = this.$t("Category") + ": " + this.ingredient?.category ?? this.$t("Undefined")
                let popover = []
                ;(this.ingredient?.shopping_list ?? []).forEach((x) => {
                    popover.push(
                        [
                            "<tr style='border-bottom: 1px solid #ccc'>",
                            "<td style='padding: 3px;'><em>",
                            x?.mealplan ?? "",
                            "</em></td>",
                            "<td style='padding: 3px;'>",
                            x?.amount ?? "",
                            "</td>",
                            "<td style='padding: 3px;'>",
                            x?.unit ?? "" + "</td>",
                            "<td style='padding: 3px;'>",
                            x?.food ?? "",
                            "</td></tr>",
                        ].join("")
                    )
                })
                return "<table class='table-small'><th colspan='4'>" + category + "</th>" + popover.join("") + "</table>"
            }
        },
    },
    methods: {
        calculateAmount: function (x) {
            return calculateAmount(x, this.ingredient_factor)
        },
        // sends parent recipe ingredient to notify complete has been toggled
        done: function () {
            this.$emit("checked-state-changed", this.ingredient)
        },
        // sends true/false to parent to save all ingredient shopping updates as a batch
        changeShopping: function () {
            this.$emit("add-to-shopping", { item: this.ingredient, add: this.shop })
        },
    },
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
