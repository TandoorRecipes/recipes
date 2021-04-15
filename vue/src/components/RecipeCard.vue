<template>
  <div>
    <div>
      <b-card no-body>

        <b-card-img-lazy :src=recipe.image v-bind:alt="$t('Recipe_Image')" top></b-card-img-lazy>

        <b-card-body :title=recipe.name>
          <recipe-context-menu :recipe="recipe"></recipe-context-menu>
          <b-card-text>
            {{ recipe.description }}
          </b-card-text>
        </b-card-body>

      </b-card>

    </div>
  </div>
</template>

<script>
import RecipeContextMenu from "@/components/RecipeContextMenu";
export default {
  name: "RecipeCard",
  components: {RecipeContextMenu},
  props: {
    recipe: Object,
  },
}
</script>

<style scoped>

</style>