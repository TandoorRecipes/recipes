<template>
    <v-container>
        <v-row>
            <v-col>
                <v-card>
                    <v-card-text class="pt-2 pb-2">
                        <v-btn variant="flat" @click="router.go(-1)" prepend-icon="fa-solid fa-arrow-left">{{ $t('Back') }}</v-btn>
                        <v-btn variant="flat" @click="router.push({name : 'RecipeViewPage', params: {id: props.id}})" class="float-right" prepend-icon="fa-solid fa-eye"
                               v-if="props.id && model.toLowerCase() == 'recipe'">{{ $t('View') }}
                        </v-btn>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
        <v-row dense>
            <v-col>
                <component :is="editorComponent" v-model="modelEditorFunctions" :item-id="id" @delete="objectDeleted" @create="(obj: any) => objectCreated(obj)"></component>
            </v-col>
        </v-row>

        <template v-if="modelEditorFunctions != undefined">
        <v-fab app location="bottom right" color="secondary" style="margin-bottom: 50px" v-if="model.toLowerCase() == 'recipe' && mobile" :loading="modelEditorFunctions.loading" icon>
            <v-icon>{{ speedDialOpen ? '$close' : '$save' }}</v-icon>
            <v-speed-dial v-model="speedDialOpen" location="top center" activator="parent">
                <v-btn key="1" color="save" icon @click="modelEditorFunctions.saveObject()">
                    <v-icon icon="$save"></v-icon>
                </v-btn>
                 <v-btn key="1" color="info" icon @click="modelEditorFunctions.saveObject().then(() => router.push({name : 'RecipeViewPage', params: {id: props.id}}))">
                    <v-icon icon="fa-solid fa-eye fa-fw"></v-icon>
                </v-btn>
                <v-btn color="delete" icon
                       v-if="modelEditorFunctions.isUpdate && !modelEditorFunctions.modelClass.model.disableDelete && !modelEditorFunctions.modelClass.model.isAdvancedDelete"
                       :disabled="modelEditorFunctions.loading">
                    <v-icon icon="$delete"></v-icon>
                    <delete-confirm-dialog :object-name="modelEditorFunctions.objectName" :model-name="$t(modelEditorFunctions.modelClass.model.localizationKey)"
                                           @delete="objectDeleted"></delete-confirm-dialog>
                </v-btn>
                <v-btn color="delete" icon
                       v-if="modelEditorFunctions.isUpdate && !modelEditorFunctions.modelClass.model.disableDelete && modelEditorFunctions.modelClass.model.isAdvancedDelete"
                       :to="{name: 'ModelDeletePage', params: {model: modelEditorFunctions.modelClass.model.name, id: props.id!}}" :disabled="modelEditorFunctions.loading">
                    <v-icon icon="$delete"></v-icon>
                </v-btn>
            </v-speed-dial>
        </v-fab>
            </template>

    </v-container>
</template>

<script setup lang="ts">

import {useRouter} from "vue-router";
import {EditorSupportedModels, getGenericModelFromString} from "@/types/Models";
import {defineAsyncComponent, onMounted, PropType, ref, shallowRef, watch} from "vue";
import {useI18n} from "vue-i18n";
import {useModelEditorFunctions} from "@/composables/useModelEditorFunctions.ts";
import {Recipe} from "@/openapi";
import DeleteConfirmDialog from "@/components/dialogs/DeleteConfirmDialog.vue";
import {useDisplay} from "vuetify";

const {t} = useI18n()
const router = useRouter()
const {mobile} = useDisplay()

const props = defineProps({
    model: {type: String as PropType<EditorSupportedModels>, required: true},
    id: {type: String, required: false, default: undefined},
})

const editorComponent = shallowRef(getGenericModelFromString(props.model, t).model.editorComponent)

const speedDialOpen = ref(false)
const modelEditorFunctions = ref<any>(undefined)

//TODO quick hack for some edge cases, move to proper reinitialization of all model editors should this case occur (currently only recipe editor create new via navigation btn)
watch(() => props.id, (newValue, oldValue) => {
    if (newValue != oldValue) {
        location.reload()
    }
})

/**
 * after creation open object with correct URL in edit mode
 * @param obj obj that was created
 */
function objectCreated(obj: any) {
    if (obj.id) {
        router.push({name: 'ModelEditPage', params: {model: props.model, id: obj.id}})
    }
}

/**
 * determines where to redirect user after object deletion based on selected model
 */
function objectDeleted() {
    if (props.model.toLowerCase() == 'recipe') {
        router.push({name: 'StartPage'})
    } else {
        router.go(-1)
    }
}

</script>

<style scoped>

</style>