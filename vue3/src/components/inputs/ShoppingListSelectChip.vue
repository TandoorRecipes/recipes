<template>
    <v-chip label size="small" class="ms-1" variant="outlined"
            :color="(selectedListIds.length == 0 ? '' : 'secondary')" :prepend-icon="TShoppingList.icon"
            append-icon="fa-solid fa-caret-down">
        <template v-if="selectedListIds.filter(sl => sl != -1).length > 0">
            {{
                shoppingLists.filter(sl => selectedListIds.includes(sl.id!)).flatMap(sl => sl.name).join(', ')
            }}
        </template>
        <template v-else-if="selectedListIds.includes(-1)">{{ $t('None') }}</template>
        <template v-else>{{ $t('ShoppingList') }}</template>

        <v-menu activator="parent" v-model="menu" :close-on-content-click="false">
            <v-list density="compact" v-model:selected="selectedListIds"  select-strategy="leaf">
                <v-list-item v-if="!hideAll" @click="selectedListIds = []">
                    {{ $t('All') }}
                </v-list-item>
                <v-list-item :value="-1">
                    <template v-slot:prepend="{ isSelected, select }">
                        <v-list-item-action start>
                            <v-checkbox-btn :model-value="isSelected" @update:model-value="select"></v-checkbox-btn>
                        </v-list-item-action>
                    </template>
                    {{ $t('None') }}
                </v-list-item>
                <v-list-item v-for="s in shoppingLists" :key="s.id" :value="s.id">
                    <template v-slot:prepend="{ isSelected, select }">
                        <v-list-item-action start>
                            <v-checkbox-btn :model-value="isSelected" @update:model-value="select" :color="s.color" :baseColor="s.color"></v-checkbox-btn>
                        </v-list-item-action>
                    </template>
                    {{ s.name }}
                    <template #append v-if="!hideEdit">
                        <v-btn variant="plain" icon>
                            <v-icon icon="$edit"></v-icon>
                            <model-edit-dialog activator="parent" :item="s" @delete="emit('refresh')" @create="emit('refresh')"
                                               @save="emit('refresh')" model="ShoppingList"></model-edit-dialog>
                        </v-btn>
                    </template>
                </v-list-item>
                <v-list-item prepend-icon="$create" link v-if="!hideCreate">
                    {{ $t('Create') }}
                    <model-edit-dialog activator="parent" @delete="emit('refresh')" @create="emit('refresh')" @save="emit('refresh')"
                                       model="ShoppingList"></model-edit-dialog>
                </v-list-item>
                <v-list-item v-if="showUpdate" prepend-icon="fa-solid fa-save" @click="triggerUpdate()">
                    {{ $t('Update') }}
                </v-list-item>
            </v-list>
        </v-menu>
    </v-chip>
</template>

<script setup lang="ts">
import {PropType, ref, watch} from "vue";
import {ShoppingList} from "@/openapi";
import {TShoppingList} from "@/types/Models.ts";
import ModelEditDialog from "@/components/dialogs/ModelEditDialog.vue";

const props = defineProps({
    shoppingLists: {type: Array as PropType<ShoppingList[]>, required: true},
    showUpdate: {type: Boolean, default: false},
    hideAll: {type: Boolean, default: false},
    hideEdit: {type: Boolean, default: false},
    hideCreate: {type: Boolean, default: false},
})

const emit = defineEmits(['update', 'refresh'])

const menu = ref(false)

const selectedLists = defineModel<ShoppingList[]>({default: [], required: false})
const selectedListIds = defineModel<number[]>('ids', {default: [], required: false})

watch(selectedListIds, () => {
    selectedLists.value = props.shoppingLists.filter(sl => selectedListIds.value.includes(sl.id!))
})

function triggerUpdate(){
    emit('update')
    menu.value = false
    selectedListIds.value = []
}

</script>
