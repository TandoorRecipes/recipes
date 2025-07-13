<template>
    <div>
        <div class="dropdown d-print-none p-0" v-if="ingredient.food">
            <a
                class="btn shadow-none p-0"
                href="javascript:void(0);"
                role="button"
                id="dropdownMenuLink"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
                @click="clicked = true"
            >
                <i v-if="onhand || ignore_shopping" class="p-0 fas fa-ellipsis-v fa-sm text-success"></i>
                <i v-else-if="!onhand && sub_onhand" class="p-0 fas fa-ellipsis-v fa-sm text-warning"></i>
                <i v-else class="p-0 fas fa-ellipsis-v fa-sm"></i>
            </a>

            <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuLink">
                <!-- is food onhand? -->
                <span v-if="!ignore_shopping">
                    <a class="dropdown-item" v-if="onhand" href="#" @click="toggleOnHand()"><i class="fas fa-clipboard-check fa-fw text-success" /> {{ $t("OnHand_Off") }}</a>
                    <a class="dropdown-item" v-else-if="!onhand && sub_onhand" href="#" @click="toggleOnHand()">
                        <i class="fas fa-clipboard-check fa-fw text-warning" /> {{ $t("OnHand_On") }}
                    </a>

                    <a class="dropdown-item" v-else href="#" @click="toggleOnHand()"><i class="fas fa-clipboard fa-fw text-muted"></i> {{ $t("OnHand_On") }}</a>
                </span>

                <!-- is food in shopping list? -->
                <span v-if="!ignore_shopping">
                    <a v-if="shopping" class="dropdown-item" href="#" @click="delShopping()">
                        <i class="fas fa-shopping-cart fa-fw text-success" /> {{ $t("RemoveFoodFromShopping", { food: ingredient.food.name }) }}
                    </a>
                    <a v-else class="dropdown-item" href="#" @click="addShopping()">
                        <i class="fas fa-shopping-cart fa-fw" /> {{ $t("AddFoodToShopping", { food: ingredient.food.name }) }}
                    </a>
                </span>

                <!-- toggle ignore shopping? -->
                <a v-if="!ignore_shopping" class="dropdown-item" href="#" @click="toggleIgnoreShopping()">
                    <i class="fas fa-ban fa-fw text-muted" /> {{ $t("Ignore_Shopping") }}
                </a>
                <a v-else class="dropdown-item" href="#" @click="toggleIgnoreShopping()"> <i class="fas fa-ban fa-fw text-danger" /> {{ $t("No_Ignore_Shopping") }} </a>

                <!-- list of substitutes onhand -->
                <span v-if="sub_onhand && substitutes.length !== 0">
                    <div class="dropdown-divider"></div>
                    <h5 class="dropdown-header">{{ $t("SubstitutesList") }}</h5>
                    <a class="dropdown-header mx-2 py-0" v-for="(s, i) in substitutes" v-bind:key="i">{{ s }}</a>
                </span>
            </div>
        </div>
    </div>
</template>

<script>
import { ApiMixin, StandardToasts } from "@/utils/utils"
import Vue from "vue"
import { ApiApiFactory } from "@/utils/openapi/api"

export default {
    name: "IngredientContextMenu",
    mixins: [ApiMixin],
    components: {},
    props: {
        ingredient: Object,
    },
    data() {
        return {
            loaded: false,
            shopping: false,
            substitutes: [],
            onhand: false,
            sub_onhand: false,
            ignore_shopping: false,
            clicked: false,
        }
    },
    mounted() {
        this.onhand = this.ingredient.food.food_onhand
        this.sub_onhand = this.ingredient.food.substitute_onhand
        this.ignore_shopping = this.ingredient.food.ignore_shopping
        this.shopping = this.ingredient.food.shopping
    },
    watch: {
        // only load shopping/substitute status if clicked
        clicked: function (newVal, oldVal) {
            if (newVal !== oldVal) {
                if (this.sub_onhand) {
                    this.getSubstitutes()
                }
            }
        },
    },
    methods: {
        getSubstitutes() {
            let params = {
                id: this.ingredient.food.id,
                options: { query: { onhand: true } },
            }
            this.genericAPI(this.Models.FOOD, this.Actions.SUBSTITUTES, params).then((result) => {
                this.substitutes = result.data.map((x) => x.name)
            })
        },
        addShopping() {
            let params = {
                id: this.ingredient.food.id,
                amount: 1,
            }
            this.genericAPI(this.Models.FOOD, this.Actions.SHOPPING, params).then((result) => {
                this.shopping = true
                StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_CREATE)
            })
        },
        delShopping() {
            let params = {
                id: this.ingredient.food.id,
                _delete: "true",
            }
            this.genericAPI(this.Models.FOOD, this.Actions.SHOPPING, params).then(() => {
                this.shopping = false
                StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_DELETE)
            })
        },
        toggleOnHand() {
            let params = { id: this.ingredient.food.id, food_onhand: !this.onhand }
            this.genericAPI(this.Models.FOOD, this.Actions.UPDATE, params).then(() => {
                this.onhand = !this.onhand
                StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_UPDATE)
            })
        },
        toggleIgnoreShopping() {
            let params = { id: this.ingredient.food.id, ignore_shopping: !this.ignore_shopping }
            this.genericAPI(this.Models.FOOD, this.Actions.UPDATE, params).then(() => {
                this.ignore_shopping = !this.ignore_shopping
                StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_UPDATE)
            })
        },
    },
}
</script>
