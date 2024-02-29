<template>
    <div id="app" class="recipe" v-if="recipe_id !== undefined">
        <recipe-view-component :recipe_id="recipe_id"></recipe-view-component>

        <div v-if="!loading">
            <RecipeSwitcher ref="ref_recipe_switcher" @switch="quickSwitch($event)"/>
            <div class="row">
                <div class="col-12" style="text-align: center">
                    <h3>{{ recipe.name }}</h3>
                </div>
            </div>

            <div class="row text-center">
                <div class="col col-md-12">
                    <recipe-rating :recipe="recipe"></recipe-rating>
                    <last-cooked :recipe="recipe" class="mt-2"></last-cooked>
                </div>
            </div>

            <div class="my-auto">
                <div class="col-12" style="text-align: center">
                    <i>{{ recipe.description }}</i>
                </div>
            </div>

            <div style="text-align: center">
                <keywords-component :recipe="recipe"></keywords-component>
            </div>

            <hr/>
            <div class="row align-items-center">
                <div class="col col-md-3">
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

                <div class="col col-md-3">
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

                <div class="col col-md-4 col-10 mt-2 mt-md-0">
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

                <div class="col col-md-2 col-2 mt-2 mt-md-0 text-right">
                    <recipe-context-menu v-bind:recipe="recipe" :servings="servings"
                                         :disabled_options="{print:false}"></recipe-context-menu>
                </div>
            </div>
            <hr/>

            <div class="row">
                <div class="col-md-6 order-md-1 col-sm-12 order-sm-2 col-12 order-2"
                     v-if="recipe && ingredient_count > 0 && (recipe.show_ingredient_overview || recipe.steps.length < 2)">
                    <ingredients-card
                        :recipe="recipe.id"
                        :steps="recipe.steps"
                        :ingredient_factor="ingredient_factor"
                        :servings="servings"
                        :header="true"
                        :use_plural="use_plural"
                        id="ingredient_container"
                        @checked-state-changed="updateIngredientCheckedState"
                        @change-servings="servings = $event"
                    />

                    <div v-for="(step) in recipe.steps" v-bind:key="step.id" style="margin-top: 1vh">
                            <div v-for="(sub_step) in step.step_recipe_data.steps"
                                    v-bind:key="`substep_${sub_step.id}`">
                                    <div>
                                        <b-button v-b-toggle.collapse-sub-ingredients variant="outline-primary">
                                            <h5 class="card-title">
                                                    {{step.step_recipe_data.name + $t(" Ingredients ")}}
                                            </h5> 
                                            <span class="when-opened">
                                                    <i class="fa fa-chevron-down" aria-hidden="true"></i>
                                            </span>
                                            <span class="when-closed">
                                                    <i class="fa fa-chevron-up" aria-hidden="true"></i>
                                            </span> 
                                        </b-button>
                                        <b-collapse id="collapse-sub-ingredients" class="mt-2">
                                            <ingredients-card 
                                            :steps="[sub_step]" 
                                            :ingredient_factor="ingredient_factor" 
                                            :use_plural="use_plural"
                                            @checked-state-changed="$emit('checked-state-changed', $event)"/>
                                        </b-collapse>
                                    </div>
                            </div>
                    </div>
                </div>

                <div class="col-12 order-1 col-sm-12 order-sm-1 col-md-6 order-md-2">
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
                <div v-if="recipe.file_path.includes('.pdf')">
                    <PdfViewer :recipe="recipe"></PdfViewer>
                </div>
                <div
                    v-if="recipe.file_path.includes('.png') || recipe.file_path.includes('.jpg') || recipe.file_path.includes('.jpeg') || recipe.file_path.includes('.gif')">
                    <ImageViewer :recipe="recipe"></ImageViewer>
                </div>
            </template>

            <div v-for="(s, index) in recipe.steps" v-bind:key="s.id" style="margin-top: 1vh">
                <step-component
                    :recipe="recipe"
                    :step="s"
                    :ingredient_factor="ingredient_factor"
                    :index="index"
                    :use_plural="use_plural"
                    :start_time="start_time"
                    @update-start-time="updateStartTime"
                    @checked-state-changed="updateIngredientCheckedState"
                ></step-component>
            </div>

            <div v-if="recipe.source_url !== null">
                <h6 class="d-print-none"><i class="fas fa-file-import"></i> {{ $t("Imported_From") }}</h6>
                <span class="text-muted mt-1"><a style="overflow-wrap: break-word;"
                                                 :href="recipe.source_url">{{ recipe.source_url }}</a></span>
            </div>

            <div class="row" style="margin-top: 2vh; ">
                <div class="col-lg-6 offset-lg-3 col-12">
                    <Nutrition-component :recipe="recipe" id="nutrition_container"
                                         :ingredient_factor="ingredient_factor"></Nutrition-component>
                </div>
            </div>
        </div>


        <add-recipe-to-book :recipe="recipe"></add-recipe-to-book>

        <div class="row text-center d-print-none" style="margin-top: 3vh; margin-bottom: 3vh"
             v-if="share_uid !== 'None'">
            <div class="col col-md-12">
                <a :href="resolveDjangoUrl('view_report_share_abuse', share_uid)">{{ $t("Report Abuse") }}</a>
            </div>
        </div>
        <bottom-navigation-bar active-view="view_search"></bottom-navigation-bar>
    </div>
</template>

<script>
import Vue from "vue"
import {BootstrapVue} from "bootstrap-vue"
import "bootstrap-vue/dist/bootstrap-vue.css"

import RecipeViewComponent from "@/components/RecipeViewComponent.vue";
import BottomNavigationBar from "@/components/BottomNavigationBar.vue";

Vue.use(BootstrapVue)

export default {
    name: "RecipeView",
    mixins: [],
    components: {
        RecipeViewComponent,
        BottomNavigationBar
    },
    computed: {},
    data() {
        return {
            recipe_id: window.RECIPE_ID
        }
    },
    mounted() {
        this.$i18n.locale = window.CUSTOM_LOCALE
    },
    methods: {},
}
</script>

<style scoped>
    .collapsed > .when-opened,
    :not(.collapsed) > .when-closed {
        display: none;
    }
</style>

<style>

</style>
