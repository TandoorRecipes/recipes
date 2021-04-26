<template>


  <b-card no-body>
    <a :href="clickUrl()">
      <b-card-img-lazy style="height: 15vh; object-fit: cover" :src=recipe_image v-bind:alt="$t('Recipe_Image')"
                       top></b-card-img-lazy>

      <div class="card-img-overlay h-100 d-flex flex-column justify-content-right"
           style="float:right; text-align: right; padding-top: 10px; padding-right: 5px">
        <recipe-context-menu :recipe="recipe" style="float:right" v-if="recipe !== null"></recipe-context-menu>
      </div>

    </a>

    <b-card-body>
      <h5><a :href="clickUrl()">
        <template v-if="recipe !== null">{{ recipe.name }}</template>
        <template v-else>{{ meal_plan.title }}</template>
      </a></h5>

      <b-card-text style="text-overflow: ellipsis">
        <template v-if="recipe !== null">
          {{ recipe.description }}
          <keywords :recipe="recipe" style="margin-top: 4px"></keywords>
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

export default {
  name: "RecipeCard",
  mixins: [
    ResolveUrlMixin,
  ],
  components: {Keywords, RecipeContextMenu},
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
  }
}
</script>

<style scoped>

</style>