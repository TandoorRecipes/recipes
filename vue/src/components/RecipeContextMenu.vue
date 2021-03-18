<template>
  <div>

    <div class="dropdown">
      <a class="btn shadow-none" href="#" role="button" id="dropdownMenuLink"
         data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        <i class="fas fa-ellipsis-v"></i>
      </a>

      <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuLink">

        <a class="dropdown-item" :href="resolveDjangoUrl('edit_recipe', recipe.id)"><i
            class="fas fa-pencil-alt fa-fw"></i> {{ _('Edit') }}</a>

        <a class="dropdown-item" :href="resolveDjangoUrl('edit_convert_recipe', recipe.id)" v-if="!recipe.internal"><i
            class="fas fa-exchange-alt fa-fw"></i> {{ _('Convert to internal recipe') }}</a>

        <button class="dropdown-item" @click="$bvModal.show('id_modal_add_book')">
          <i class="fas fa-bookmark fa-fw"></i> {{ _('Add to Book') }}
        </button>

        <a class="dropdown-item" :href="`${resolveDjangoUrl('view_shopping') }?r=[${recipe.id},${servings_value}]`"
           v-if="recipe.internal" target="_blank" rel="noopener noreferrer">
          <i class="fas fa-shopping-cart fa-fw"></i> {{ _('Add to Shopping') }}
        </a>

        <a class="dropdown-item" :href="`${resolveDjangoUrl('new_meal_plan') }?recipe=${recipe.id}`"
           target="_blank" rel="noopener noreferrer"><i
            class="fas fa-calendar fa-fw"></i> {{ _('Add to Plan') }}
        </a>


        <button class="dropdown-item" @click="$bvModal.show('id_modal_cook_log')"><i
            class="fas fa-clipboard-list fa-fw"></i> {{ _('Log Cooking') }}
        </button>

        <button class="dropdown-item" onclick="window.print()"><i
            class="fas fa-print fa-fw"></i> {{ _('Print') }}
        </button>

        <a class="dropdown-item" :href="resolveDjangoUrl('view_export') + '?r=' + recipe.id" target="_blank"
           rel="noopener noreferrer"><i class="fas fa-file-export fa-fw"></i> {{ _('Export') }}</a>

        <a class="dropdown-item" :href="resolveDjangoUrl('new_share_link', recipe.id)" target="_blank"
           rel="noopener noreferrer" v-if="recipe.internal"><i class="fas fa-share-alt fa-fw"></i> {{ _('Share') }}</a>
      </div>


    </div>

    <cook-log :recipe="recipe"></cook-log>
  </div>
</template>

<script>

import {GettextMixin, ResolveUrlMixin} from "@/utils/utils";
import CookLog from "@/components/CookLog";

export default {
  name: 'RecipeContextMenu',
  mixins: [
    ResolveUrlMixin,
    GettextMixin
  ],
  components: {
    CookLog
  },
  data() {
    return {
      servings_value: 0
    }
  },
  props: {
    recipe: Object,
    servings: {
      type: Number,
      default: -1
    }
  },
  mounted() {
    this.servings_value = ((this.servings === -1) ? this.recipe.servings : this.servings)
  }
}
</script>
