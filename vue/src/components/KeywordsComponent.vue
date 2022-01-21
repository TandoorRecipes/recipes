<template>
    <div v-if="recipe.keywords.length > 0">
      <span :key="k.id" v-for="k in recipe.keywords" class="pl-1">
          <a :href="`${resolveDjangoUrl('view_search')}?keyword=${k.id}`"><b-badge pill variant="light"
                                                                                   class="font-weight-normal">{{ k.label }}</b-badge></a>

      </span>
    </div>
</template>

<script>

import {ResolveUrlMixin} from "@/utils/utils";

export default {
    name: 'KeywordsComponent',
    mixins: [ResolveUrlMixin],
    props: {
        recipe: Object,
    },
}
</script>
