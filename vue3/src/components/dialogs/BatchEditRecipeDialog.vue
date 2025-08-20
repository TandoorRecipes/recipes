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

            </v-card-text>
            <v-card-actions>
                <v-btn :disabled="loading" @click="dialog = false">{{ $t('Cancel') }}</v-btn>
                <v-btn color="warning"  :loading="loading">{{ $t('Update') }}</v-btn>
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