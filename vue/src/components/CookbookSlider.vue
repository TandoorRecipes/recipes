<template>
    <div v-bind:class="{ bounceright: bounce_right, bounceleft: bounce_left }">
        <div class="row">
            <div class="col col-md-12 text-center pt-2 pb-4">
                <b-pagination pills v-model="current_page" :total-rows="page_count_pagination" :per-page="per_page_count" @change="pageChange" first-text="📖" align="fill"> </b-pagination>
            </div>
        </div>
        <div class="row" v-touch:swipe.left="swipeLeft" v-touch:swipe.right="swipeRight">
            <div class="col-md-1" @click="swipeRight" style="cursor: pointer"></div>
            <div class="col-md-5">
                <transition name="flip" mode="out-in">
                    <cookbook-edit-card :book="book" v-if="current_page === 1" v-on:editing="cookbook_editing = $event" v-on:refresh="$emit('refresh')" @reload="$emit('reload')"></cookbook-edit-card>
                </transition>
                <transition name="flip" mode="out-in">
                    <recipe-card :recipe="display_recipes[0].recipe_content" v-if="current_page > 1" :key="display_recipes[0].recipe" ></recipe-card>
                </transition>
            </div>
            <div class="col-md-5">
                <transition name="flip" mode="out-in">
                    <cookbook-toc :recipes="recipes" v-if="current_page === 1" v-on:switchRecipe="switchRecipe($event)"></cookbook-toc>
                </transition>
                <transition name="flip" mode="out-in">
                    <recipe-card :recipe="display_recipes[1].recipe_content" v-if="current_page > 1 && display_recipes.length === 2" :key="display_recipes[1].recipe" ></recipe-card>
                </transition>
            </div>
            <div class="col-md-1" @click="swipeLeft" style="cursor: pointer"></div>
        </div>
    </div>
</template>

<script>
import RecipeCard from "./RecipeCard"
import CookbookEditCard from "./CookbookEditCard"
import CookbookToc from "./CookbookToc"
import Vue2TouchEvents from "vue2-touch-events"
import Vue from "vue"
import { ApiApiFactory } from "@/utils/openapi/api"

Vue.use(Vue2TouchEvents)

export default {
    name: "CookbookSlider.vue",
    components: { CookbookToc, CookbookEditCard, RecipeCard },
    props: {
        recipes: Array,
        book: Object,
    },
    computed: {
        page_count_pagination: function () {
            return this.recipes.length + 2
        },
        page_count: function () {
            return Math.ceil(this.page_count_pagination / this.per_page_count)
        },
        display_recipes: function() {
          return this.recipes.slice((this.current_page - 1 - 1) * 2, (this.current_page - 1) * 2)
        }
    },
    mounted(){

    },
    data() {
        return {
            current_page: 1,
            per_page_count: 2,
            bounce_left: false,
            bounce_right: false,
            cookbook_editing: false,
        }
    },
    methods: {
        pageChange: function (page) {
            this.current_page = page
            this.loadRecipeDetails(page)
        },
        loadRecipeDetails: function (page) {
            this.display_recipes.forEach((recipe, index) => {
              if (recipe.recipe_content.steps === undefined) {
                let apiClient = new ApiApiFactory()

                apiClient.retrieveRecipe(recipe.recipe).then((result) => {
                  let new_entry = Object.assign({}, recipe)
                  new_entry.recipe_content = result.data
                  this.recipes.forEach((rec, i) => {
                    if (rec.recipe === new_entry.recipe) {
                      this.$set(this.recipes, i, new_entry)
                    }
                  })
                })
              }
            })
        },
        swipeLeft: function () {
            if (this.cookbook_editing) {
                return
            }
            if (this.current_page < this.page_count) {
                this.pageChange(this.current_page + 1)
            } else {
                this.bounce_left = true
                setTimeout(() => (this.bounce_left = false), 500)
            }
        },
        swipeRight: function () {
            if (this.cookbook_editing) {
                return
            }
            if (this.current_page > 1) {
                this.pageChange(this.current_page - 1)
            } else {
                this.bounce_right = true
                setTimeout(() => (this.bounce_right = false), 500)
            }
        },
        switchRecipe: function (index) {
            this.pageChange(Math.ceil((index + 1) / this.per_page_count) + 1)
        },
    },
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
.flip-enter-active {
    -webkit-animation-name: bounceUp;
    animation-name: bounceUp;
    -webkit-animation-duration: 0.5s;
    animation-duration: 0.5s;
    -webkit-animation-fill-mode: both;
    animation-fill-mode: both;
    -webkit-animation-timing-function: linear;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    -webkit-animation-iteration-count: infinite;
}

.bounceleft {
    -webkit-animation-name: bounceLeft;
    animation-name: bounceLeft;
    -webkit-animation-duration: 0.5s;
    animation-duration: 0.5s;
    -webkit-animation-fill-mode: both;
    animation-fill-mode: both;
    -webkit-animation-timing-function: linear;
    animation-timing-function: linear;
    animation-iteration-count: 1;
    -webkit-animation-iteration-count: 1;
}

.bounceright {
    -webkit-animation-name: bounceRight;
    animation-name: bounceRight;
    -webkit-animation-duration: 0.5s;
    animation-duration: 0.5s;
    -webkit-animation-fill-mode: both;
    animation-fill-mode: both;
    -webkit-animation-timing-function: linear;
    animation-timing-function: linear;
    animation-iteration-count: 1;
    -webkit-animation-iteration-count: 1;
}

@-webkit-keyframes bounceUp {
    0%,
    100% {
        -webkit-transform: translateY(0);
    }
    50% {
        -webkit-transform: translateY(-7px);
    }
}

@keyframes bounceUp {
    0%,
    100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-7px);
    }
}

@-webkit-keyframes bounceLeft {
    0%,
    100% {
        -webkit-transform: translateY(0);
    }
    50% {
        -webkit-transform: translateX(-10px);
    }
}

@keyframes bounceLeft {
    0%,
    100% {
        transform: translateY(0);
    }
    50% {
        transform: translateX(-10px);
    }
}

@-webkit-keyframes bounceRight {
    0%,
    100% {
        -webkit-transform: translateY(0);
    }
    50% {
        -webkit-transform: translateX(10px);
    }
}

@keyframes bounceRight {
    0%,
    100% {
        transform: translateY(0);
    }
    50% {
        transform: translateX(10px);
    }
}
</style>
