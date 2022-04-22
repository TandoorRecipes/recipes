<template>
    <span>
        <b-dropdown variant="link" toggle-class="text-decoration-none" right no-caret style="boundary:window">
            <template #button-content>
                <i class="fas fa-ellipsis-v"></i>
            </template>
            <b-dropdown-item v-on:click="$emit('item-action', 'edit')" v-if="show_edit"> <i class="fas fa-pencil-alt fa-fw"></i> {{ $t("Edit") }} </b-dropdown-item>


            <b-dropdown-item v-on:click="$emit('item-action', 'delete')" v-if="show_delete"> <i class="fas fa-trash-alt fa-fw"></i> {{ $t("Delete") }} </b-dropdown-item>
            <b-dropdown-item v-on:click="$emit('item-action', 'ingredient-editor')" v-if="show_ingredient_editor"> <i class="fas fa-th-list fa-dw"></i> {{ $t("Ingredient Editor") }} </b-dropdown-item>

            <b-dropdown-item v-on:click="$emit('item-action', 'add-shopping')" v-if="show_shopping">
                <i class="fas fa-cart-plus fa-fw"></i> {{ $t("Add_to_Shopping") }}
            </b-dropdown-item>
            <b-dropdown-item v-on:click="$emit('item-action', 'add-onhand')" v-if="show_onhand"> <i class="fas fa-clipboard-check fa-fw"></i> {{ $t("OnHand") }} </b-dropdown-item>

            <b-dropdown-item v-on:click="$emit('item-action', 'move')" v-if="show_move"> <i class="fas fa-expand-arrows-alt fa-fw"></i> {{ $t("Move") }} </b-dropdown-item>

            <b-dropdown-item v-if="show_merge" v-on:click="$emit('item-action', 'merge')"> <i class="fas fa-compress-arrows-alt fa-fw"></i> {{ $t("Merge") }} </b-dropdown-item>

            <b-dropdown-item v-if="show_merge" v-on:click="$emit('item-action', 'merge-automate')">
                <i class="fas fa-robot fa-fw"></i> {{ $t("Merge") }} & {{ $t("Automate") }} <b-badge v-b-tooltip.hover :title="$t('warning_feature_beta')">BETA</b-badge>
            </b-dropdown-item>
        </b-dropdown>
    </span>
</template>

<script>
import {ResolveUrlMixin} from "@/utils/utils";

export default {
    name: "GenericContextMenu",
    mixins: [ResolveUrlMixin],
    props: {
        show_edit: { type: Boolean, default: true },
        show_delete: { type: Boolean, default: true },
        show_move: { type: Boolean, default: false },
        show_merge: { type: Boolean, default: false },
        show_shopping: { type: Boolean, default: false },
        show_onhand: { type: Boolean, default: false },
        show_ingredient_editor: { type: Boolean, default: false },
    },
}
</script>
