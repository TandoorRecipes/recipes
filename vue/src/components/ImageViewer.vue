<template>

  <div style="text-align: center">
    <b-img :src="pdfUrl"  :alt="$t('External_Recipe_Image')"></b-img>
  </div>

</template>

<script>

import {resolveDjangoUrl} from "@/utils/utils";


export default {
  name: 'ImageViewer',
  props: {
    recipe: Object,
  },
  computed: {
    pdfUrl: function() {
      return resolveDjangoUrl('api_get_recipe_file', (this.recipe.id))
    }
  },
}
</script>
