<template>
    <tr>
        <template v-if="ingredient.is_header">
            <td colspan="5" @click="done">
                <b>{{ ingredient.note }}</b>
            </td>
        </template>

        <template v-else>
            <td class="d-print-non" v-if="detailed && !add_shopping_mode" @click="done">
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
                    class="btn text-decoration-none fas fa-shopping-cart px-2 user-select-none"
                    variant="link"
                    v-b-popover.hover.click.blur.html.top="{ title: ShoppingPopover, variant: 'outline-dark' }"
                    :class="{
                        'text-success': shopping_status === true,
                        'text-muted': shopping_status === false,
                        'text-warning': shopping_status === null,
                    }"
                />
                <span class="px-2">
                    <input type="checkbox" class="align-middle" v-model="shop" @change="changeShopping" />
                </span>
                <on-hand-badge :item="ingredient.food" />
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
        recipe_list: { type: Number }, // ShoppingListRecipe ID, to filter ShoppingStatus
        show_shopping: { type: Boolean, default: false },
        add_shopping_mode: { type: Boolean, default: false },
        shopping_list: {
            type: Array,
            default() {
                return []
            },
        }, // list of unchecked ingredients in shopping list
    },
    mixins: [ResolveUrlMixin, ApiMixin],
    data() {
        return {
            checked: false,
            shopping_status: null, // in any shopping list: boolean + null=in shopping list, but not for this recipe
            shopping_items: [],
            shop: false, // in shopping list for this recipe: boolean
            dirty: undefined,
        }
    },
    watch: {
        ShoppingListAndFilter: {
            immediate: true,
            handler(newVal, oldVal) {
                // this whole sections is overly complicated
                // trying to infer status of shopping for THIS recipe and THIS ingredient
                // without know which recipe it is.
                // If refactored:
                // ## Needs to handle same recipe (multiple mealplans) being in shopping list multiple times
                // ## Needs to handle same recipe being added as ShoppingListRecipe AND ingredients added from recipe as one-off

                let filtered_list = this.shopping_list
                // if a recipe list is provided, filter the shopping list
                if (this.recipe_list) {
                    filtered_list = filtered_list.filter((x) => x.list_recipe == this.recipe_list)
                }
                // how many ShoppingListRecipes are there for this recipe?
                let count_shopping_recipes = [...new Set(filtered_list.map((x) => x.list_recipe))].length
                let count_shopping_ingredient = filtered_list.filter((x) => x.ingredient == this.ingredient.id).length

                if (count_shopping_recipes >= 1) {
                    // This recipe is in the shopping list
                    this.shop = false // don't check any boxes until user selects a shopping list to edit
                    if (count_shopping_ingredient >= 1) {
                        this.shopping_status = true // ingredient is in the shopping list - probably (but not definitely, this ingredient)
                    } else if (this.ingredient.food.shopping) {
                        this.shopping_status = null // food is in the shopping list, just not for this ingredient/recipe
                    } else {
                        // food is not in any shopping list
                        this.shopping_status = false
                    }
                } else {
                    // there are not recipes in the shopping list
                    // set default value
                    this.shop = !this.ingredient?.food?.food_onhand && !this.ingredient?.food?.recipe
                    this.$emit("add-to-shopping", { item: this.ingredient, add: this.shop })
                    // mark checked if the food is in the shopping list for this ingredient/recipe
                    if (count_shopping_ingredient >= 1) {
                        // ingredient is in this shopping list (not entirely sure how this could happen?)
                        this.shopping_status = true
                    } else if (count_shopping_ingredient == 0 && this.ingredient.food.shopping) {
                        // food is in the shopping list, just not for this ingredient/recipe
                        this.shopping_status = null
                    } else {
                        // the food is not in any shopping list
                        this.shopping_status = false
                    }
                }

                if (this.add_shopping_mode) {
                    // if we are in add shopping mode (e.g. recipe_shopping_modal) start with all checks marked
                    // except if on_hand (could be if recipe too?)
                    this.shop = !this.ingredient?.food?.food_onhand && !this.ingredient?.food?.recipe
                }
            },
        },
    },
    mounted() {},
    computed: {
        ShoppingListAndFilter() {
            // hack to watch the shopping list and the recipe list at the same time
            return this.shopping_list.map((x) => x.id).join(this.recipe_list)
        },
        ShoppingPopover() {
            if (this.shopping_status == false) {
                return this.$t("NotInShopping", { food: this.ingredient.food.name })
            } else {
                let list = this.shopping_list.filter((x) => x.food.id == this.ingredient.food.id)
                let category = this.$t("Category") + ": " + this.ingredient?.food?.supermarket_category?.name ?? this.$t("Undefined")
                let popover = []

                list.forEach((x) => {
                    popover.push(
                        [
                            "<tr style='border-bottom: 1px solid #ccc'>",
                            "<td style='padding: 3px;'><em>",
                            x?.recipe_mealplan?.name ?? "",
                            "</em></td>",
                            "<td style='padding: 3px;'>",
                            x?.amount ?? "",
                            "</td>",
                            "<td style='padding: 3px;'>",
                            x?.unit?.name ?? "" + "</td>",
                            "<td style='padding: 3px;'>",
                            x?.food?.name ?? "",
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
