<template>

  <div>
    <img :src="pdfUrl" width="100%" height="700px" :alt="_('External Recipe Image')">
  </div>

</template>

<script>

import {GettextMixin, resolveDjangoUrl} from "@/utils/utils";


export default {
  name: 'ImageViewer',
  mixins: [
    GettextMixin,
  ],
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
