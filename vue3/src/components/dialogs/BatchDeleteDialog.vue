<template>
    <v-dialog max-width="600px" :activator="props.activator" v-model="dialog">
        <v-card :loading="loading">
            <v-closable-card-title
                :title="$t('delete_title', {type: $t(genericModel.model.localizationKey)})"
                :sub-title="genericModel.getLabel(props.source)"
                :icon="genericModel.model.icon"
                v-model="dialog"
            ></v-closable-card-title>
            <v-divider></v-divider>

            <v-card-text>
                {{ $t('BatchDeleteConfirm') }}

                <v-list>
                    <v-list-item border v-for="item in itemsToDelete">
                        {{ genericModel.getLabel(item) }}
                        <template #append>
                            <v-icon icon="fa-solid fa-xmark" color="error" variant="tonal" v-if="failedItems.includes(item)"></v-icon>
                            <v-icon icon="fa-solid fa-check" color="success"  variant="tonal" v-else-if="updatedItems.includes(item)"></v-icon>
                            <v-icon icon="fa-solid  fa-circle-notch fa-spin"  variant="tonal" color="info" v-else-if="loading"></v-icon>

                            <v-btn icon="fa-solid fa-up-right-from-square" :to="{name: 'IngredientEditorPage', query: {food_id: item.id}}"
                                                 v-if="genericModel.model.name == 'Food' && failedItems.includes(item)"  size="small"></v-btn>
                            <v-btn icon="fa-solid fa-up-right-from-square" :to="{name: 'IngredientEditorPage', query: {unit_id: item.id}}"
                                                 v-if="genericModel.model.name == 'Unit' && failedItems.includes(item)" size="small"></v-btn>
                        </template>
                    </v-list-item>
                </v-list>
                <p class="font-italic text-disabled">{{$t('BatchDeleteHelp')}}</p>
            </v-card-text>
            <v-card-actions>
                <v-btn :disabled="loading" @click="dialog = false">{{ $t('Cancel') }}</v-btn>
                <v-btn color="error" @click="deleteAll()" :loading="loading">{{ $t('Delete_All') }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">

import {onMounted, PropType, ref, watch} from "vue";
import {EditorSupportedModels, EditorSupportedTypes, getGenericModelFromString} from "@/types/Models.ts";
import VClosableCardTitle from "@/components/dialogs/VClosableCardTitle.vue";
import {useI18n} from "vue-i18n";

const emit = defineEmits(['change'])

const props = defineProps({
    model: {type: String as PropType<EditorSupportedModels>, required: true},
    items: {type: Array as PropType<Array<EditorSupportedTypes>>, required: true},
    activator: {type: String, default: 'parent'},
})

const {t} = useI18n()

const dialog = defineModel<boolean>({default: false})
const loading = ref(false)

const genericModel = getGenericModelFromString(props.model, t)

const itemsToDelete = ref<EditorSupportedTypes[]>([])
const failedItems = ref<EditorSupportedTypes[]>([])
const updatedItems = ref<EditorSupportedTypes[]>([])

watch(dialog, (newValue, oldValue) => {
    if(!oldValue && newValue){
        itemsToDelete.value = JSON.parse(JSON.stringify(props.items))
    }
})

/**
 * loop through the items and delete them
 */
function deleteAll() {
    let promises: Promise<any>[] = []
    loading.value = true

    itemsToDelete.value.forEach(item => {
        promises.push(genericModel.destroy(item.id!).then((r: any) => {
            updatedItems.value.push(item)
        }).catch((err: any) => {
            failedItems.value.push(item)
        }))
    })

    Promise.allSettled(promises).then(() => {
        loading.value = false
        emit('change')
    })
}

</script>


<style scoped>

</style>