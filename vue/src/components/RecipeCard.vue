<template>
    <div>
        <template v-if="recipe && recipe.loading">
            <b-card no-body v-hover style="height: 100%">
                <b-card-img-lazy style="height: 15vh; object-fit: cover" class="" :src="placeholder_image"
                                 v-bind:alt="$t('Recipe_Image')" top></b-card-img-lazy>

                <b-card-body class="p-4">
                    <h6>
                        <b-skeleton width="95%"></b-skeleton>
                    </h6>

                    <b-card-text>
                        <b-skeleton height="12px" :width="(45 + Math.random() * 45).toString() + '%'"></b-skeleton>
                        <b-skeleton height="12px" :width="(20 + Math.random() * 25).toString() + '%'"></b-skeleton>
                        <b-skeleton height="12px" :width="(30 + Math.random() * 35).toString() + '%'"></b-skeleton>
                    </b-card-text>
                </b-card-body>
            </b-card>
        </template>
        <template v-else>
            <b-card no-body v-hover v-if="recipe" style="height: 100%">

                <a :href="this.recipe.id !== undefined ? resolveDjangoUrl('view_recipe', this.recipe.id) : null">
                    <div class="content">
                        <div class="content-overlay" v-if="recipe.description !== null && recipe.description !== ''"></div>
                        <b-card-img-lazy style="height: 15vh; object-fit: cover" class="" :src="recipe_image"
                                         v-bind:alt="$t('Recipe_Image')" top></b-card-img-lazy>

                        <div class="content-details" >
                            <p class="content-text">
                               {{ recipe.description }}
                            </p>
                        </div>

                        <div class="card-img-overlay h-100 d-flex flex-column justify-content-right float-right text-right pt-2 pr-1"
                             v-if="show_context_menu">
                            <a>
                                <recipe-context-menu :recipe="recipe" class="float-right"
                                                     :disabled_options="context_disabled_options"
                                                     v-if="recipe !== null"></recipe-context-menu>
                            </a>
                        </div>
                        <div class="card-img-overlay d-flex flex-column justify-content-left float-left text-left pt-2" style="width:40%"
                             v-if="recipe.working_time !== 0 || recipe.waiting_time !== 0">
                            <b-badge pill variant="light" class="mt-1 font-weight-normal" v-if="recipe.working_time !== 0">
                                <i
                                    class="fa fa-clock"></i> {{ working_time }}
                            </b-badge>
                            <b-badge pill variant="secondary" class="mt-1 font-weight-normal"
                                     v-if="recipe.waiting_time !== 0">
                                <i class="fa fa-pause"></i> {{ waiting_time }}
                            </b-badge>
                        </div>
                    </div>
                </a>

                <b-card-body class="p-2 pl-3 pr-3">
                    <span>
                        <a :href="this.recipe.id !== undefined ? resolveDjangoUrl('view_recipe', this.recipe.id) : null" class="text-body font-weight-bold two-row-text">
                            <template v-if="recipe !== null">{{ recipe.name }}</template>
                            <template v-else>{{ meal_plan.title }}</template>
                        </a>
                    </span>

                    <b-card-text style="text-overflow: ellipsis">
                        <template v-if="recipe !== null">


                            <p class="mt-1 mb-1">
                                <last-cooked :recipe="recipe"></last-cooked>
                                <keywords-component :recipe="recipe" :limit="3"
                                                    style="margin-top: 4px; position: relative; z-index: 3;"></keywords-component>
                            </p>
                            <transition name="fade" mode="in-out">
                                <div class="row mt-3" v-if="show_detail">
                                    <div class="col-md-12">
                                        <h6 class="card-title"><i class="fas fa-pepper-hot"></i> {{ $t("Ingredients") }}
                                        </h6>

                                        <ingredients-card
                                            :steps="recipe.steps"
                                            :header="false"
                                            :detailed="false"
                                            :servings="recipe.servings"
                                            :use_plural="use_plural"/>
                                    </div>
                                </div>
                            </transition>

                            <b-badge pill variant="info" v-if="!recipe.internal">{{ $t("External") }}</b-badge>
                        </template>

                    </b-card-text>
                </b-card-body>


            </b-card>
        </template>

    </div>

    <!--

    <recipe-rating :recipe="recipe"></recipe-rating>

      <template v-if="recipe.description !== null && recipe.description !== undefined">
                        <span v-if="recipe.description.length > text_length">
                            {{ recipe.description.substr(0, text_length) + "\u2026" }}
                        </span>
                                <span v-if="recipe.description.length <= text_length">
                            {{ recipe.description }}
                        </span>
                            </template>

    <b-card-footer v-if="footer_text !== undefined"><i v-bind:class="footer_icon"></i> {{ footer_text }}
                </b-card-footer>

    <template v-else>{{ meal_plan.note }}</template>

    -->
</template>

<script>
import RecipeContextMenu from "@/components/RecipeContextMenu"
import KeywordsComponent from "@/components/KeywordsComponent"
import {resolveDjangoUrl, ResolveUrlMixin, calculateHourMinuteSplit} from "@/utils/utils"
import RecipeRating from "@/components/RecipeRating"
import moment from "moment/moment"
import Vue from "vue"
import LastCooked from "@/components/LastCooked"
import IngredientsCard from "@/components/IngredientsCard"

Vue.prototype.moment = moment

export default {
    name: "RecipeCard",
    mixins: [ResolveUrlMixin],
    components: {
        LastCooked,
        KeywordsComponent,
        "recipe-context-menu": RecipeContextMenu,
        IngredientsCard
    },
    props: {
        recipe: Object,
        meal_plan: Object,
        use_plural: {type: Boolean, default: false},
        footer_text: String,
        footer_icon: String,
        detailed: {type: Boolean, default: true},
        show_context_menu: {type: Boolean, default: true},
        context_disabled_options: Object,
    },
    data() {
        return {
            placeholder_image: window.IMAGE_PLACEHOLDER,
        }
    },

    mounted() {
    },
    computed: {
        show_detail: function () {
            return this.recipe?.steps !== undefined && this.detailed
        },
        recipe_image: function () {
            if (this.recipe == null || this.recipe.image === null) {
                return window.IMAGE_PLACEHOLDER
            } else {
                return this.recipe.image
            }
        },
        working_time: function () {
            return calculateHourMinuteSplit(this.recipe.working_time)
        },
        waiting_time: function () {
            return calculateHourMinuteSplit(this.recipe.waiting_time)
        },
    },
    methods: {},
    directives: {
        hover: {
            inserted: function (el) {
                el.addEventListener("mouseenter", () => {
                    el.classList.add("shadow")
                })
                el.addEventListener("mouseleave", () => {
                    el.classList.remove("shadow")
                })
            },
        },
    },
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s;
}

.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */
{
    opacity: 0;
}

.two-row-text {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2; /* number of lines to show */
    line-clamp: 2;
    -webkit-box-orient: vertical;
}

.content {
    position: relative;

    margin: auto;
    overflow: hidden;
}

.content .content-overlay {
    background: rgba(0, 0, 0, 0.7);
    position: absolute;
    height: 99%;
    width: 100%;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;
    opacity: 0;
    -webkit-transition: all 0.4s ease-in-out 0s;
    -moz-transition: all 0.4s ease-in-out 0s;
    transition: all 0.4s ease-in-out 0s;
}

.content:hover .content-overlay {
    opacity: 1;
}

.content-details {
    position: absolute;
    text-align: center;
    padding-left: 1em;
    padding-right: 1em;
    width: 100%;
    top: 50%;
    left: 50%;
    opacity: 0;
    -webkit-transform: translate(-50%, -50%);
    -moz-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
    -webkit-transition: all 0.3s ease-in-out 0s;
    -moz-transition: all 0.3s ease-in-out 0s;
    transition: all 0.3s ease-in-out 0s;
}

.content:hover .content-details {
    top: 50%;
    left: 50%;
    opacity: 1;
}

.content-details h3 {
    color: #fff;
    font-weight: 500;
    letter-spacing: 0.15em;
    margin-bottom: 0.5em;
    text-transform: uppercase;
}

.content-details p {
    color: #fff;
    font-size: 0.8em;
}

.fadeIn-bottom {
    top: 80%;
}
</style>
