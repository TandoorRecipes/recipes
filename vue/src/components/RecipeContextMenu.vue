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
          <button class="dropdown-item" onclick="$('#bookmarkModal').modal({'show':true})">
            <i class="fas fa-bookmark fa-fw"></i> {{ _('Add to Book') }}
          </button>

          <a class="dropdown-item" :href="recipe.name" v-if="true"> <!--TODO implement -->
            <i class="fas fa-shopping-cart fa-fw"></i> {{ _('Add to Shopping') }} </a>

          <a class="dropdown-item" :href="resolveDjangoUrl('new_meal_plan', recipe.id)"><i
              class="fas fa-calendar fa-fw"></i> {{ _('Add to Plan') }}</a>

          <!--
          <button class="dropdown-item" :onclick="openCookLogModal(recipe.id)"><i
              class="fas fa-clipboard-list fa-fw"></i> {{ _('Log Cooking') }}
          </button>
  -->
          <button class="dropdown-item" onclick="window.print()"><i
              class="fas fa-print fa-fw"></i> {{ _('Print') }}
          </button>

          <a class="dropdown-item" :href="resolveDjangoUrl('view_export', recipe.id)" target="_blank"
             rel="noopener noreferrer"><i class="fas fa-file-export fa-fw"></i> {{ _('Export') }}</a>

          <a class="dropdown-item" :href="resolveDjangoUrl('new_share_link', recipe.id)" target="_blank"
             rel="noopener noreferrer" v-if="recipe.internal"><i class="fas fa-share-alt fa-fw"></i> {{
              _('Share')
            }}</a>
        </div>



    </div>

  </div>
</template>

<script>

import {GettextMixin, ResolveUrlMixin} from "@/utils/utils";

export default {
  name: 'RecipeContextMenu',
  mixins: [
    ResolveUrlMixin,
    GettextMixin
  ],
  props: {
    recipe: Object,
  }
}
</script>
