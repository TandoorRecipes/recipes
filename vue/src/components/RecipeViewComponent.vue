<template>

    <div> 
        <template v-if="loading">
            <loading-spinner></loading-spinner>
        </template>

        <div v-if="!loading" style="padding-bottom: 60px">
            <RecipeSwitcher ref="ref_recipe_switcher" @switch="quickSwitch($event)" v-if="show_recipe_switcher"/>
            <div class="recipe__title row">
                <div class="col-12" style="text-align: center">
                    <h3>{{ recipe.name }}</h3>
                </div>
            </div>

            <div class="recipe__history row text-center">
                <div class="col col-md-12">
                    <recipe-rating :recipe="recipe"></recipe-rating>
                    <last-cooked :recipe="recipe" class="mt-2"></last-cooked>
                </div>
            </div>

            <div class="recipe__description my-auto">
                <div class="col-12" style="text-align: center">
                    <i>{{ recipe.description }}</i>
                </div>
            </div>

            <div class="recipe__keywords" style="text-align: center">
                <keywords-component :recipe="recipe" :enable_keyword_links="enable_keyword_links"></keywords-component>
            </div>

            <hr/>
            <div class="recipe__prep-data row align-items-center">
                <div class="recipe__prep-time col col-md-3">
                    <div class="d-flex">
                        <div class="my-auto mr-1">
                            <i class="fas fa-fw fa-user-clock fa-2x text-primary"></i>
                        </div>
                        <div class="my-auto mr-1">
                            <span class="text-primary"><b>{{ $t("Preparation") }}</b></span><br/>
                            {{ working_time }}
                        </div>
                    </div>
                </div>

                <div class="recipe__wait-time col col-md-3">
                    <div class="row d-flex">
                        <div class="my-auto mr-1">
                            <i class="far fa-fw fa-clock fa-2x text-primary"></i>
                        </div>
                        <div class="my-auto mr-1">
                            <span class="text-primary"><b>{{ $t("Waiting") }}</b></span><br/>
                            {{ waiting_time }}
                        </div>
                    </div>
                </div>

                <div class="recipe__servings col col-md-4 col-10 mt-2 mt-md-0">
                    <div class="d-flex">
                        <div class="my-auto mr-1">
                            <i class="fas fa-fw fa-pizza-slice fa-2x text-primary"></i>
                        </div>
                        <div class="my-auto mr-1">
                            <CustomInputSpinButton v-model.number="servings"/>
                        </div>
                        <div class="my-auto mr-1">
                            <span class="text-primary">
                                <b>
                                    <template v-if="recipe.servings_text === ''">{{ $t("Servings") }}</template>
                                    <template v-else>{{ recipe.servings_text }}</template>
                                </b>
                            </span>
                        </div>
                    </div>
                </div>

                <div class="recipe__context-menu col col-md-2 col-2 mt-2 mt-md-0 text-right">
                    <recipe-context-menu v-bind:recipe="recipe" :servings="servings"
                                         :disabled_options="{print:false}" v-if="show_context_menu"></recipe-context-menu>
                </div>
            </div>
            <hr/>

            <div class="recipe__overview row">
                <div class="recipe__ingredients col-md-6 order-md-1 col-sm-12 order-sm-2 col-12 order-2"
                     v-if="recipe && ingredient_count > 0 && (recipe.show_ingredient_overview || recipe.steps.length < 2)">
                    <ingredients-card
                        :recipe="recipe.id"
                        :steps="recipe.steps"
                        :ingredient_factor="ingredient_factor"
                        :servings="servings"
                        :header="true"
                        id="ingredient_container"
                        @checked-state-changed="updateIngredientCheckedState"
                        @change-servings="servings = $event"
                    />
                </div>

                <div class="recipe__image col-12 order-1 col-sm-12 order-sm-1 col-md-6 order-md-2">
                    <div class="row">
                        <div class="col-12">
                            <img class="img img-fluid rounded" :src="recipe.image" :alt="$t('Recipe_Image')"
                                 v-if="recipe.image !== null" @load="onImgLoad"
                                 :style="{ 'max-height': ingredient_height }"/>
                        </div>
                    </div>
                </div>
            </div>

            <template v-if="!recipe.internal">
                <div v-if="recipe.file_path.includes('.pdf')" class="recipe__file-pdf">
                    <PdfViewer :recipe="recipe"></PdfViewer>
                </div>
                <div
                    v-if="recipe.file_path.includes('.png') || recipe.file_path.includes('.jpg') || recipe.file_path.includes('.jpeg') || recipe.file_path.includes('.gif')"
                    class="recipe__file-img">
                    <ImageViewer :recipe="recipe"></ImageViewer>
                </div>
            </template>

            <div class="recipe__step" v-for="(s, index) in recipe.steps" v-bind:key="s.id" style="margin-top: 1vh">
                <step-component
                    :recipe="recipe"
                    :step="s"
                    :ingredient_factor="ingredient_factor"
                    :index="index"
                    :start_time="start_time"
                    @update-start-time="updateStartTime"
                    @checked-state-changed="updateIngredientCheckedState"
                ></step-component>
            </div>

            <div class="recipe__source" v-if="recipe.source_url !== null">
                <h6 class="d-print-none"><i class="fas fa-file-import"></i> {{ $t("Imported_From") }}</h6>
                <span class="text-muted mt-1"><a style="overflow-wrap: break-word;"
                                                 :href="recipe.source_url">{{ recipe.source_url }}</a></span>
            </div>

            <div class="recipe__properties row" style="margin-top: 2vh; ">
                <div class="col-lg-6 offset-lg-3 col-12">
                    <property-view-component :recipe="recipe" :servings="servings" @foodUpdated="loadRecipe(recipe.id)"></property-view-component>
                </div>
            </div>
        </div>


        <add-recipe-to-book :recipe="recipe"></add-recipe-to-book>

        <div class="row text-center d-print-none" style="margin-top: 3vh; margin-bottom: 3vh"
             v-if="share_uid !== 'None' && !loading">
            <div class="col col-md-12">
                <import-tandoor></import-tandoor>
                <br/>
                <a :href="resolveDjangoUrl('view_report_share_abuse', share_uid)" class="mt-3">{{ $t("Report Abuse") }}</a>
            </div>
        </div>
    </div>

</template>

<script>
import Vue from "vue"
import {BootstrapVue} from "bootstrap-vue"
import "bootstrap-vue/dist/bootstrap-vue.css"

import {apiLoadRecipe} from "@/utils/api"

import RecipeContextMenu from "@/components/RecipeContextMenu"
import {ResolveUrlMixin, ToastMixin, calculateHourMinuteSplit} from "@/utils/utils"

import PdfViewer from "@/components/PdfViewer"
import ImageViewer from "@/components/ImageViewer"

import moment from "moment"
import LoadingSpinner from "@/components/LoadingSpinner"
import AddRecipeToBook from "@/components/Modals/AddRecipeToBook"
import RecipeRating from "@/components/RecipeRating"
import LastCooked from "@/components/LastCooked"
import IngredientsCard from "@/components/IngredientsCard"
import StepComponent from "@/components/StepComponent"
import KeywordsComponent from "@/components/KeywordsComponent"
import RecipeSwitcher from "@/components/Buttons/RecipeSwitcher"
import CustomInputSpinButton from "@/components/CustomInputSpinButton"
import {ApiApiFactory} from "@/utils/openapi/api";
import ImportTandoor from "@/components/Modals/ImportTandoor.vue";
import PropertyViewComponent from "@/components/PropertyViewComponent.vue";

Vue.prototype.moment = moment

Vue.use(BootstrapVue)

export default {
    name: "RecipeView",
    mixins: [ResolveUrlMixin, ToastMixin],
    components: {
        ImportTandoor,
        LastCooked,
        RecipeRating,
        PdfViewer,
        ImageViewer,
        IngredientsCard,
        StepComponent,
        RecipeContextMenu,
        KeywordsComponent,
        LoadingSpinner,
        AddRecipeToBook,
        RecipeSwitcher,
        CustomInputSpinButton,
        PropertyViewComponent,
    },
    computed: {
        ingredient_factor: function () {
            return this.servings / this.recipe.servings
        },
        ingredient_count() {
            return this.recipe?.steps.map((x) => x.ingredients).flat().length
        },
        working_time: function () {
            return calculateHourMinuteSplit(this.recipe.working_time)
        },
        waiting_time: function () {
            return calculateHourMinuteSplit(this.recipe.waiting_time)
        },
    },
    data() {
        return {
            loading: true,
            recipe: undefined,
            rootrecipe: undefined,
            servings: 1,
            servings_cache: {},
            start_time: "",
            share_uid: window.SHARE_UID,
            wake_lock: null,
            ingredient_height: '250',
        }
    },
    props: {
        recipe_id: Number,
        def_servings: Number,
        recipe_obj: {type: Object, default: null},
        show_context_menu: {type: Boolean, default: true},
        enable_keyword_links: {type: Boolean, default: true},
        show_recipe_switcher: {type: Boolean, default: true},
        //show_comments: {type: Boolean, default: true},
    },
    watch: {
        servings(newVal, oldVal) {
            this.servings_cache[this.recipe.id] = this.servings
        },
    },
    mounted() {
        if (this.recipe_obj !== null) {
            this.recipe = this.rootrecipe = this.recipe_obj
            this.prepareView()
        } else {
            this.loadRecipe(this.recipe_id)
        }


        this.$i18n.locale = window.CUSTOM_LOCALE
        this.requestWakeLock()
        window.addEventListener('resize', this.handleResize);

    },
    beforeUnmount() {
        this.destroyWakeLock()
    },
    methods: {
        requestWakeLock: async function () {
            if ('wakeLock' in navigator) {
                try {
                    this.wake_lock = await navigator.wakeLock.request('screen')
                    document.addEventListener('visibilitychange', this.visibilityChange)
                } catch (err) {
                    console.log(err)
                }
            }
        },
        handleResize: function () {
            if (document.getElementById('ingredient_container') !== null) {
                this.ingredient_height = document.getElementById('ingredient_container').clientHeight
            }
        },
        destroyWakeLock: function () {
            if (this.wake_lock != null) {
                this.wake_lock.release()
                    .then(() => {
                        this.wake_lock = null
                    });
            }

            document.removeEventListener('visibilitychange', this.visibilityChange)
        },
        visibilityChange: async function () {
            if (this.wake_lock != null && document.visibilityState === 'visible') {
                await this.requestWakeLock()
            }
        },
        loadRecipe: function (recipe_id) {
            apiLoadRecipe(recipe_id).then((recipe) => {
                this.recipe = this.rootrecipe = recipe
                this.prepareView()
            })
        },
        prepareView: function () {
            let total_time = 0
            for (let step of this.recipe.steps) {
                for (let ingredient of step.ingredients) {
                    this.$set(ingredient, "checked", false)
                }

                step.time_offset = total_time
                total_time += step.time
            }

            // set start time only if there are any steps with timers (otherwise no timers are rendered)
            if (total_time > 0) {
                this.start_time = moment().format("yyyy-MM-DDTHH:mm")
            }


            if (this.recipe.image === null) this.printReady()
            window.RECIPE_SERVINGS = Number(window.RECIPE_SERVINGS)
            if (window.RECIPE_SERVINGS && ! isNaN(window.RECIPE_SERVINGS)) {
                //I am not sure this is the best way. This overwrites our servings cache, which may not be intended?
                this.servings = window.RECIPE_SERVINGS
            } else {
                this.servings = this.servings_cache[this.rootrecipe.id] = this.recipe.servings
            }
            this.loading = false

            setTimeout(() => {
                this.handleResize()
            }, 100)
        },
        updateStartTime: function (e) {
            this.start_time = e
        },
        updateIngredientCheckedState: function (e) {
            for (let step of this.recipe.steps) {
                for (let ingredient of step.ingredients) {
                    if (ingredient.id === e.id) {
                        this.$set(ingredient, "checked", !ingredient.checked)
                    }
                }
            }
        },
        quickSwitch: function (e) {
            if (e === -1) {
                this.recipe = this.rootrecipe
                this.servings = this.servings_cache[this.rootrecipe?.id ?? 1]
            } else {
                this.recipe = e
                this.servings = this.servings_cache?.[e.id] ?? e.servings
            }
        },
        printReady: function () {
            const template = document.createElement("template");
            template.id = "printReady";
            document.body.appendChild(template);
        },
        onImgLoad: function () {
            this.printReady()
        },
    },
}
</script>

<style>
#app > div > div {
    break-inside: avoid;
}
</style>
