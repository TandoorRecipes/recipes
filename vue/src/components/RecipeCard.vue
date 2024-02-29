<template>
    <div>
        <template v-if="recipe && recipe.loading">
            <b-card no-body v-hover style="height: 100%">
                <b-card-img-lazy style="height: 15vh; object-fit: cover" class="" :src="placeholder_image" v-bind:alt="$t('Recipe_Image')" top></b-card-img-lazy>

                <b-card-body class="p-4">
                    <h6>
                        <b-skeleton width="95%"></b-skeleton>
                    </h6>

                    <b-card-text>
                        <b-skeleton height="12px" width="65%"></b-skeleton>
                        <b-skeleton height="12px" width="45%"></b-skeleton>
                        <b-skeleton height="12px" width="55%"></b-skeleton>
                    </b-card-text>
                </b-card-body>
            </b-card>
        </template>
        <template v-else>
            <b-card no-body v-hover v-if="recipe" style="height: 100%">
                <a :href="recipe_link">
                    <div class="content">
                        <div class="content-overlay" v-if="recipe.description !== null && recipe.description !== ''"></div>
                        <b-card-img-lazy style="height: 15vh; object-fit: cover" class="" :src="recipe_image" v-bind:alt="$t('Recipe_Image')" top></b-card-img-lazy>

                        <div class="content-details">
                            <p class="content-text">
                                {{ recipe.description }}
                            </p>
                        </div>

                        <b-row class="card-img-overlay pt-1">
                            <b-col cols="6">
                                <div v-if="recipe.working_time !== 0 || recipe.waiting_time !== 0">
                                    <b-badge pill variant="light" class="mt-1 font-weight-normal" v-if="recipe.working_time !== 0 && recipe.working_time !== undefined">
                                        <i class="fa fa-clock"></i> {{ working_time }}
                                    </b-badge>
                                    <b-badge pill variant="secondary" class="mt-1 font-weight-normal" v-if="recipe.waiting_time !== 0 && recipe.waiting_time !== undefined">
                                        <i class="fa fa-pause"></i> {{ waiting_time }}
                                    </b-badge>
                                </div>
                            </b-col>
                            <b-col cols="6" class="text-right">
                                <recipe-rating :recipe="recipe" :pill="true"></recipe-rating>
                            </b-col>
                        </b-row>
                    </div>
                </a>

                <b-card-body class="p-2 pl-3 pr-3">
                    <div class="d-flex flex-row">
                        <div class="flex-grow-1">
                            <a :href="recipe_link" class="text-body font-weight-bold two-row-text">
                                <template v-if="recipe !== null">{{ recipe.name }}</template>
                                <template v-else>{{ meal_plan.title }}</template>
                            </a>
                        </div>
                        <div class="justify-content-end">
                            <recipe-context-menu
                                :recipe="recipe"
                                class="justify-content-end float-right align-items-end pr-0"
                                :disabled_options="context_disabled_options"
                                v-if="recipe !== null && show_context_menu"
                            ></recipe-context-menu>
                        </div>
                    </div>

                    <b-card-text style="text-overflow: ellipsis">
                        <template v-if="recipe !== null">
                            <div v-if="show_detail">
                                {{ recipe.description }}
                            </div>

                            <p class="mt-1 mb-1">
                                <last-cooked :recipe="recipe"></last-cooked>
                                <keywords-component
                                    :recipe="recipe"
                                    :limit="3"
                                    :enable_keyword_links="enable_keyword_links"
                                    style="margin-top: 4px; position: relative; z-index: 3"
                                ></keywords-component>
                            </p>
                            <transition name="fade" mode="in-out">
                                <div class="row mt-3" v-if="show_detail">
                                    <div class="col-md-12">
                                        <h6 class="card-title"><i class="fas fa-pepper-hot"></i> {{ $t("Ingredients") }}</h6>

                                        <ingredients-card :steps="recipe.steps" :header="false" :detailed="false" :servings="recipe.servings" />
                                    </div>
                                </div>
                            </transition>

                            <b-badge pill variant="info" v-if="recipe.internal !== undefined && !recipe.internal">{{ $t("External") }}</b-badge>
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
import IngredientsCard from "@/components/IngredientsCard"
import KeywordsComponent from "@/components/KeywordsComponent"
import LastCooked from "@/components/LastCooked"
import RecipeContextMenu from "@/components/RecipeContextMenu"
import RecipeRating from "@/components/RecipeRating"
import { ResolveUrlMixin, calculateHourMinuteSplit, resolveDjangoUrl } from "@/utils/utils"
import moment from "moment/moment"
import Vue from "vue"

Vue.prototype.moment = moment

export default {
    name: "RecipeCard",
    mixins: [ResolveUrlMixin],
    components: {
        LastCooked,
        KeywordsComponent,
        "recipe-context-menu": RecipeContextMenu,
        IngredientsCard,
        RecipeRating,
    },
    props: {
        recipe: Object,
        meal_plan: Object,
        footer_text: String,
        footer_icon: String,
        detailed: { type: Boolean, default: true },
        show_context_menu: { type: Boolean, default: true },
        context_disabled_options: Object,
        open_recipe_on_click: { type: Boolean, default: true },
        enable_keyword_links: { type: Boolean, default: true },
    },
    data() {
        return {
            placeholder_image: window.IMAGE_PLACEHOLDER,
        }
    },

    mounted() {},
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
        recipe_link: function () {
            if (this.open_recipe_on_click) {
                return this.recipe.id !== undefined ? resolveDjangoUrl("view_recipe", this.recipe.id) : null
            } else {
                return "#"
            }
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

.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
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
    overflow: visible;
}

.content .content-overlay {
    background: rgba(0, 0, 0, 0.7);
    position: absolute;
    height: 100%;
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

.content:hover .card-img-overlay {
    opacity: 0;
}

.content-details {
    position: absolute;
    text-align: center;
    padding: 1em 1em 0 1em;
    width: 100%;
    max-height: 100%;
    overflow-y: scroll;
    z-index: 1;
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

.content-details::-webkit-scrollbar {
    display: none;
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
