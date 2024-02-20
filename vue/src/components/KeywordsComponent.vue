<template>
    <div class="keywords" v-if="recipe.keywords.length > 0">
      <span :key="k.id" v-for="k in recipe.keywords.slice(0,keyword_splice).filter((kk) => { return kk.show || kk.show === undefined })" class="keywords__item pl-1" :class="keywordClass(k)">
          <template v-if="enable_keyword_links">
              <a :href="`${resolveDjangoUrl('view_search')}?keyword=${k.id}`">
                  <b-badge pill variant="light" class="font-weight-normal">{{ k.label }}</b-badge>
              </a>
          </template>
          <template v-else>
             <b-badge pill variant="light" class="font-weight-normal">{{ k.label }}</b-badge>
          </template>
      </span>
    </div>
</template>

<script>

import {ResolveUrlMixin, EscapeCSSMixin} from "@/utils/utils";

export default {
    name: 'KeywordsComponent',
    mixins: [ResolveUrlMixin, EscapeCSSMixin],
    props: {
        recipe: Object,
        limit: Number,
        enable_keyword_links: {type: Boolean, default: true}
    },
    computed: {
        keyword_splice: function () {
            if (this.limit) {
                return this.limit
            }
            return this.recipe.keywords.length
        }
    },
    methods: {
        keywordClass: function(k) {
            return this.escapeCSS('_keywordname-' + k.label)
        }
    }
}
</script>
