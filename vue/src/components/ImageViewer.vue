<template>

  <div style="text-align: center">
    <b-img :src="pdfUrl"  :alt="_('External Recipe Image')"></b-img>
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
