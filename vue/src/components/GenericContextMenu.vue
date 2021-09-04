<template>
    <b-dropdown variant="link" toggle-class="text-decoration-none" no-caret style="boundary:window">
      <template #button-content>
          <i class="fas fa-ellipsis-v" ></i>
      </template>
      <b-dropdown-item v-on:click="$emit('item-action', 'edit')" v-if="show_edit">
        <i class="fas fa-pencil-alt fa-fw"></i> {{ $t('Edit') }}
      </b-dropdown-item>
      
      <b-dropdown-item v-on:click="$emit('item-action', 'delete')" v-if="show_delete">
        <i class="fas fa-trash-alt fa-fw"></i> {{ $t('Delete') }}
      </b-dropdown-item>

      <b-dropdown-item v-on:click="$emit('item-action', 'move')" v-if="show_move">
        <i class="fas fa-expand-arrows-alt fa-fw"></i> {{ $t('Move') }}
      </b-dropdown-item>
      
      <b-dropdown-item v-if="show_merge" v-on:click="$emit('item-action', 'merge')">
        <i class="fas fa-compress-arrows-alt fa-fw"></i> {{ $t('Merge') }}
      </b-dropdown-item>

    </b-dropdown>
</template>

<script>

export default {
  name: 'GenericContextMenu',
  props: {
    show_edit: {type: Boolean, default: true},
    show_delete: {type: Boolean, default: true},
    show_move: {type: Boolean, default: false},
    show_merge: {type: Boolean, default: false},
  }
}
</script>