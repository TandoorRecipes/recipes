<template>
    <div>
        <div class="dropdown d-print-none">
            <a class="btn shadow-none pr-0 pl-0" href="javascript:void(0);" role="button" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <i class="fas fa-ellipsis-v fa-lg"></i>
            </a>

            <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuLink">
                <a class="dropdown-item" :href="resolveDjangoUrl('edit_recipe', recipe.id)" v-if="!disabled_options.edit"
                    ><i class="fas fa-pencil-alt fa-fw"></i> {{ $t("Edit") }}</a
                >

                <a class="dropdown-item" :href="resolveDjangoUrl('view_property_editor', recipe.id)" v-if="!disabled_options.edit">
                    <i class="fas fa-table"></i> {{ $t("Property_Editor") }}</a
                >

                <a class="dropdown-item" :href="resolveDjangoUrl('edit_convert_recipe', recipe.id)" v-if="!recipe.internal && !disabled_options.convert"
                    ><i class="fas fa-exchange-alt fa-fw"></i> {{ $t("convert_internal") }}</a
                >

                <a href="javascript:void(0);">
                    <button class="dropdown-item" @click="$bvModal.show(`id_modal_add_book_${modal_id}`)" v-if="!disabled_options.books">
                        <i class="fas fa-bookmark fa-fw"></i> {{ $t("Manage_Books") }}
                    </button>
                </a>

                <a class="dropdown-item" v-if="recipe.internal && !disabled_options.shopping" @click="addToShopping" href="#">
                    <i class="fas fa-shopping-cart fa-fw"></i> {{ $t("Add_to_Shopping") }}
                </a>

                <a class="dropdown-item" @click="createMealPlan" href="javascript:void(0);" v-if="!disabled_options.plan"
                    ><i class="fas fa-calendar fa-fw"></i> {{ $t("Add_to_Plan") }}
                </a>

                <a href="javascript:void(0);">
                    <button class="dropdown-item" @click="$bvModal.show(`id_modal_cook_log_${modal_id}`)" v-if="!disabled_options.log">
                        <i class="fas fa-clipboard-list fa-fw"></i> {{ $t("Log_Cooking") }}
                    </button>
                </a>

                <a href="javascript:void(0);">
                    <button class="dropdown-item" onclick="window.print()" v-if="!disabled_options.print">
                        <i class="fas fa-print fa-fw"></i>
                        {{ $t("Print") }}
                    </button>
                </a>
                <a href="javascript:void(0);">
                    <button class="dropdown-item" @click="copyToNew" v-if="!disabled_options.copy">
                        <i class="fas fa-copy fa-fw"></i>
                        {{ $t("copy_to_new") }}
                    </button>
                </a>

                <a class="dropdown-item" :href="resolveDjangoUrl('view_export') + '?r=' + recipe.id" target="_blank" rel="noopener noreferrer" v-if="!disabled_options.export"
                    ><i class="fas fa-file-export fa-fw"></i> {{ $t("Export") }}</a
                >

                <a href="javascript:void(0);">
                    <button class="dropdown-item" @click="pinRecipe()" v-if="!disabled_options.pin">
                        <i class="fas fa-thumbtack fa-fw"></i>
                        {{ isPinned ? $t("Unpin") : $t("Pin") }}
                    </button>
                </a>

                <a href="javascript:void(0);">
                    <button class="dropdown-item" @click="createShareLink()" v-if="recipe.internal && !disabled_options.share">
                        <i class="fas fa-share-alt fa-fw"></i> {{ $t("Share") }}
                    </button>
                </a>
            </div>
        </div>

        <cook-log :recipe="recipe" :modal_id="modal_id"></cook-log>
        <add-recipe-to-book :recipe="recipe" :modal_id="modal_id" :entryEditing_inital_servings="servings_value"></add-recipe-to-book>
        <shopping-modal :recipe="recipe" :servings="servings_value" :modal_id="modal_id" :mealplan="undefined" />

        <b-modal :id="`modal-share-link_${modal_id}`" v-bind:title="$t('Share')" hide-footer>
            <div class="row">
                <div class="col col-md-12">
                    <label v-if="recipe_share_link !== undefined">{{ $t("Public share link") }}</label>
                    <input ref="share_link_ref" class="form-control" v-model="recipe_share_link" />
                    <b-button class="mt-2 mb-3 d-none d-md-inline" variant="secondary" @click="$bvModal.hide(`modal-share-link_${modal_id}`)">{{ $t("Close") }} </b-button>
                    <b-button class="mt-2 mb-3 ml-md-2" variant="primary" @click="copyShareLink()">{{ $t("Copy") }} </b-button>
                    <b-button class="mt-2 mb-3 ml-2 float-right" variant="success" @click="shareIntend()">{{ $t("Share") }} <i class="fa fa-share-alt"></i></b-button>
                </div>
            </div>
        </b-modal>

        <meal-plan-edit-modal
            :entry="entryEditing"
            @save-entry="saveMealPlan"
            :modal_id="`modal-meal-plan_${modal_id}`"
            :allow_delete="false"
            :modal_title="$t('Create_Meal_Plan_Entry')"
        ></meal-plan-edit-modal>
    </div>
</template>

<script>
import CookLog from "@/components/CookLog"
import MealPlanEditModal from "@/components/MealPlanEditModal"
import AddRecipeToBook from "@/components/Modals/AddRecipeToBook"
import ShoppingModal from "@/components/Modals/ShoppingModal"
import { useMealPlanStore } from "@/stores/MealPlanStore"
import { ApiApiFactory } from "@/utils/openapi/api"
import { makeToast, resolveDjangoUrl, ResolveUrlMixin, StandardToasts } from "@/utils/utils"
import axios from "axios"
import moment from "moment"
import Vue from "vue"

Vue.prototype.moment = moment

export default {
    name: "RecipeContextMenu",
    mixins: [ResolveUrlMixin],
    components: {
        AddRecipeToBook,
        CookLog,
        MealPlanEditModal,
        ShoppingModal,
    },
    data() {
        return {
            servings_value: 0,
            isPinned: false,
            recipe_share_link: undefined,
            modal_id: Math.round(Math.random() * 100000),
            options: {
                entryEditing: {
                    date: null,
                    id: -1,
                    meal_type: null,
                    note: "",
                    note_markdown: "",
                    recipe: null,
                    servings: 1,
                    shared: [],
                    title: "",
                    title_placeholder: this.$t("Title"),
                },
            },
            entryEditing: {},
            mealplan: undefined,
        }
    },
    props: {
        recipe: Object,
        servings: {
            type: Number,
            default: -1,
        },
        disabled_options: {
            type: Object,
            default: () => ({ print: true }),
        },
    },
    mounted() {
        this.servings_value = this.servings === -1 ? this.recipe.servings : this.servings

        let pinnedRecipes = JSON.parse(localStorage.getItem("pinned_recipes")) || []
        this.isPinned = pinnedRecipes.some((r) => r.id == this.recipe.id)
    },
    watch: {
        recipe: {
            handler() {},
            deep: true,
        },
        servings: function (newVal) {
            this.servings_value = parseInt(newVal)
        },
    },
    methods: {
        pinRecipe() {
            let pinnedRecipes = JSON.parse(localStorage.getItem("pinned_recipes")) || []
            if (this.isPinned) {
                pinnedRecipes = pinnedRecipes.filter((r) => r.id !== this.recipe.id)
                makeToast(this.$t("Unpin"), this.$t("UnpinnedConfirmation", { recipe: this.recipe.name }), "info")
            } else {
                pinnedRecipes.push({ id: this.recipe.id, name: this.recipe.name })
                makeToast(this.$t("Pin"), this.$t("PinnedConfirmation", { recipe: this.recipe.name }), "info")
            }
            this.isPinned = !this.isPinned
            localStorage.setItem("pinned_recipes", JSON.stringify(pinnedRecipes))
        },
        saveMealPlan: function (entry) {
            entry.from_date = moment(entry.from_date).format("YYYY-MM-DD")
            let reviewshopping = entry.addshopping && entry.reviewshopping
            entry.addshopping = entry.addshopping && !entry.reviewshopping

            let apiClient = new ApiApiFactory()
            apiClient
                .createMealPlan(entry)
                .then((result) => {
                    useMealPlanStore().plans.push(result.data)
                    this.$bvModal.hide(`modal-meal-plan_${this.modal_id}`)
                    if (reviewshopping) {
                        this.mealplan = result.data.id
                        this.servings_value = result.data.servings
                        this.addToShopping()
                    }
                    StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_CREATE)
                })
                .catch((err) => {
                    StandardToasts.makeStandardToast(this, StandardToasts.FAIL_CREATE, err)
                })
        },
        createMealPlan(data) {
            this.entryEditing = this.options.entryEditing
            this.entryEditing.recipe = this.recipe
            this.entryEditing.servings = this.recipe.servings
            this.entryEditing.from_date = moment(new Date()).format("YYYY-MM-DD")
            this.entryEditing.to_date = moment(new Date()).format("YYYY-MM-DD")
            this.$nextTick(function () {
                this.$bvModal.show(`modal-meal-plan_${this.modal_id}`)
            })
        },
        createShareLink: function () {
            console.log("create")
            axios
                .get(resolveDjangoUrl("api_share_link", this.recipe.id))
                .then((result) => {
                    console.log("success")
                    this.$bvModal.show(`modal-share-link_${this.modal_id}`)
                    this.recipe_share_link = result.data.link
                })
                .catch((err) => {
                    console.log("fail")
                    if (err.response.status === 403) {
                        makeToast(this.$t("Share"), this.$t("Sharing is not enabled for this space or your user account."), "danger")
                    }
                })
        },
        copyShareLink: function () {
            let share_input = this.$refs.share_link_ref
            share_input.select()
            document.execCommand("copy")
        },
        shareIntend: function () {
            let shareData = {
                title: this.recipe.name,
                text: `${this.$t("Check out this recipe: ")} ${this.recipe.name}`,
                url: this.recipe_share_link,
            }
            navigator.share(shareData)
        },
        addToShopping() {
            this.$bvModal.show(`shopping_${this.modal_id}`)
        },
        copyToNew: function () {
            let recipe_name = window.prompt(this.$t("copy_to_new"), this.$t("recipe_name"))

            let apiClient = new ApiApiFactory()
            apiClient.retrieveRecipe(this.recipe.id).then((results) => {
                let recipe = { ...results.data, ...{ id: undefined, name: recipe_name } }
                recipe.steps = recipe.steps.map((step) => {
                    return {
                        ...step,
                        ...{
                            id: undefined,
                            ingredients: step.ingredients.map((ingredient) => {
                                return { ...ingredient, ...{ id: undefined } }
                            }),
                        },
                    }
                })

                recipe.properties = recipe.properties.map((p) => {
                    return { ...p, ...{ id: undefined } }
                })

                apiClient
                    .createRecipe(recipe)
                    .then((new_recipe) => {
                        StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_CREATE)
                        window.open(this.resolveDjangoUrl("view_recipe", new_recipe.data.id))
                    })
                    .catch((err) => {
                        StandardToasts.makeStandardToast(this, StandardToasts.FAIL_CREATE, err)
                    })
            })
        },
    },
}
</script>
