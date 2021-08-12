<template>


  <b-card no-body v-hover>
    <a :href="clickUrl()">
      <b-card-img-lazy style="height: 15vh; object-fit: cover" class="" :src=recipe_image
                       v-bind:alt="$t('Recipe_Image')"
                       top></b-card-img-lazy>
      <div class="card-img-overlay h-100 d-flex flex-column justify-content-right"
           style="float:right; text-align: right; padding-top: 10px; padding-right: 5px">
        <a>
          <recipe-context-menu :recipe="recipe" style="float:right" v-if="recipe !== null"></recipe-context-menu>
        </a>
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
            <span v-if="recipe.description.length > 120">
          {{ recipe.description.substr(0, 120) + "\u2026" }}
          </span>
            <span v-if="recipe.description.length <= 120">
          {{ recipe.description }}
          </span>
          </template>

          <br/> <!-- TODO UGLY! -->
          <last-cooked :recipe="recipe"></last-cooked>
          <keywords :recipe="recipe" style="margin-top: 4px"></keywords>


          <b-badge pill variant="info" v-if="!recipe.internal">{{ $t('External') }}</b-badge>
          <b-badge pill variant="success"
                   v-if="Date.parse(recipe.created_at) > new Date(Date.now() - (7 * (1000 * 60 * 60 * 24)))">
            {{ $t('New') }}
          </b-badge>

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

Vue.prototype.moment = moment

export default {
  name: "RecipeCard",
  mixins: [
    ResolveUrlMixin,
  ],
  components: {LastCooked, RecipeRating, Keywords, RecipeContextMenu},
  props: {
    recipe: Object,
    meal_plan: Object,
    footer_text: String,
    footer_icon: String,
  },
  data() {
    return {
      recipe_image: '',
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