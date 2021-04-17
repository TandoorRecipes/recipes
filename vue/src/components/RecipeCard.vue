<template>


  <b-card no-body>
    <a :href="resolveDjangoUrl('view_recipe', recipe.id)">
      <b-card-img-lazy style="height: 15vh; object-fit: cover" :src=recipe_image v-bind:alt="$t('Recipe_Image')"
                       top></b-card-img-lazy>

      <div class="card-img-overlay h-100 d-flex flex-column justify-content-right"
           style="float:right; text-align: right; padding-top: 10px; padding-right: 5px">
        <recipe-context-menu :recipe="recipe" style="float:right"></recipe-context-menu>
      </div>

    </a>

    <b-card-body>
      <h5><a :href="resolveDjangoUrl('view_recipe', recipe.id)">{{ recipe.name }}</a></h5>

      <b-card-text style="text-overflow: ellipsis">
        {{ recipe.description }}
        <keywords :recipe="recipe" style="margin-top: 4px"></keywords>
      </b-card-text>

    </b-card-body>
  </b-card>

</template>

<script>
import RecipeContextMenu from "@/components/RecipeContextMenu";
import Keywords from "@/components/Keywords";
import {ResolveUrlMixin} from "@/utils/utils";

export default {
  name: "RecipeCard",
  mixins: [
    ResolveUrlMixin,
  ],
  components: {Keywords, RecipeContextMenu},
  props: {
    recipe: Object,
  },
  data() {
    return {
      recipe_image: '',
    }
  },
  mounted() {
    if (this.recipe.image === null) {
      this.recipe_image = window.IMAGE_PLACEHOLDER
    } else {
      this.recipe_image = this.recipe.image
    }
  }
}
</script>

<style scoped>

</style>