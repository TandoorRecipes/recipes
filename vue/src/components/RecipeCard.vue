<template>


  <b-card no-body v-hover>
    <a :href="clickUrl()">
      <b-card-img-lazy style="height: 15vh; object-fit: cover" class="" :src=recipe_image
                       v-bind:alt="$t('Recipe_Image')"
                       top></b-card-img-lazy>
      <div class="card-img-overlay h-100 d-flex flex-column justify-content-right float-right text-right pt-2 pr-1">
        <a>
          <recipe-context-menu :recipe="recipe" class="float-right" v-if="recipe !== null"></recipe-context-menu>
        </a>
      </div>
      <div class="card-img-overlay w-50 d-flex flex-column justify-content-left float-left text-left pt-2"
           v-if="recipe.waiting_time !== 0">
        <b-badge pill variant="light" class="mt-1 font-weight-normal"><i class="fa fa-clock"></i>
          {{ recipe.working_time }} {{ $t('min') }}
        </b-badge>
        <b-badge pill variant="secondary" class="mt-1 font-weight-normal"><i class="fa fa-pause"></i>
          {{ recipe.waiting_time }} {{ $t('min') }}
        </b-badge>
      </div>
    </a>


    <b-card-body class="p-4">
      <h6><a :href="clickUrl()">
        <template v-if="recipe !== null">{{ recipe.name }}</template>
        <template v-else>{{ meal_plan.title }}</template>
      </a></h6>

      <b-card-text style="text-overflow: ellipsis;">
        <template v-if="recipe !== null">
          <recipe-rating :recipe="recipe"></recipe-rating>
          <template v-if="recipe.description !== null">
            <span v-if="recipe.description.length > text_length">
          {{ recipe.description.substr(0, text_length) + "\u2026" }}
          </span>
            <span v-if="recipe.description.length <= text_length">
          {{ recipe.description }}
          </span>
          </template>
          <p class="mt-1">
            <last-cooked :recipe="recipe"></last-cooked>
            <keywords :recipe="recipe" style="margin-top: 4px"></keywords>
          </p>
          <div class="row mt-3" v-if="detailed">
            <div class="col-md-12">
              <h6 class="card-title"><i class="fas fa-pepper-hot"></i> {{ $t('Ingredients') }}</h6>
              <table class="table table-sm text-wrap">
                <!-- eslint-disable vue/no-v-for-template-key-on-child -->
                <template v-for="s in recipe.steps">
                  <template v-for="i in s.ingredients">
                    <Ingredient :detailed="false" :ingredient="i" :ingredient_factor="1" :key="i.id"></Ingredient>
                  </template>
                </template>
                <!-- eslint-enable vue/no-v-for-template-key-on-child -->
              </table>
            </div>
          </div>

          <b-badge pill variant="info" v-if="!recipe.internal">{{ $t('External') }}</b-badge>
          <!-- <b-badge pill variant="success"
                   v-if="Date.parse(recipe.created_at) > new Date(Date.now() - (7 * (1000 * 60 * 60 * 24)))">
            {{ $t('New') }}
          </b-badge> -->

        </template>
        <template v-else>{{ meal_plan.note }}</template>
      </b-card-text>
    </b-card-body>


    <b-card-footer v-if="footer_text !== undefined">
      <i v-bind:class="footer_icon"></i> {{ footer_text }}
    </b-card-footer>
  </b-card>

</template>

<script>
import RecipeContextMenu from "@/components/RecipeContextMenu";
import Keywords from "@/components/Keywords";
import {resolveDjangoUrl, ResolveUrlMixin} from "@/utils/utils";
import RecipeRating from "@/components/RecipeRating";
import moment from "moment/moment";
import Vue from "vue";
import LastCooked from "@/components/LastCooked";
import Ingredient from "./Ingredient";

Vue.prototype.moment = moment

export default {
  name: "RecipeCard",
  mixins: [
    ResolveUrlMixin,
  ],
  components: {LastCooked, RecipeRating, Keywords, RecipeContextMenu, Ingredient},
  props: {
    recipe: Object,
    meal_plan: Object,
    footer_text: String,
    footer_icon: String
  },
  data() {
    return {
      recipe_image: '',
    }
  },
  computed: {
    detailed: function () {
      return this.recipe.steps !== undefined;
    },
    text_length: function () {
      if (this.detailed) {
        return 200
      } else {
        return 120
      }
    }
  },
  mounted() {

    if (this.recipe == null || this.recipe.image === null) {
      this.recipe_image = window.IMAGE_PLACEHOLDER
    } else {
      this.recipe_image = this.recipe.image
    }
  },
  methods: {
    // TODO: convert this to genericAPI
    clickUrl: function () {
      if (this.recipe !== null) {
        return resolveDjangoUrl('view_recipe', this.recipe.id)
      } else {
        return resolveDjangoUrl('view_plan_entry', this.meal_plan.id)
      }
    }
  },
  directives: {
    hover: {
      inserted: function (el) {
        el.addEventListener('mouseenter', () => {
          el.classList.add("shadow")
        });
        el.addEventListener('mouseleave', () => {
          el.classList.remove("shadow")
        });
      }
    }
  }
}
</script>

<style scoped>

</style>
