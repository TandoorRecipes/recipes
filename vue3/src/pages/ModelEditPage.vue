<template>
    <v-container>
        <v-row>
            <v-col>
                <v-card>
                    <v-card-text class="pt-2 pb-2">
                        <v-btn variant="flat" @click="router.go(-1)" prepend-icon="fa-solid fa-arrow-left">{{ $t('Back') }}</v-btn>
                        <v-btn variant="flat" @click="router.push({name : 'RecipeViewPage', params: {id: props.id}})" class="float-right" prepend-icon="fa-solid fa-eye" v-if="props.id && model.toLowerCase() == 'recipe'">{{$t('View')}}</v-btn>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
        <v-row dense>
            <v-col>
                <component :is="editorComponent" :item-id="id" @delete="objectDeleted" @create="(obj: any) => objectCreated(obj)"></component>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">

import {useRouter} from "vue-router";
import {EditorSupportedModels, getGenericModelFromString} from "@/types/Models";
import {defineAsyncComponent, onMounted, PropType, shallowRef, watch} from "vue";
import {useI18n} from "vue-i18n";

const {t} = useI18n()

const props = defineProps({
    model: {type: String as PropType<EditorSupportedModels>, required: true},
    id: {type: String, required: false, default: undefined},
})

const editorComponent = shallowRef(getGenericModelFromString(props.model, t).model.editorComponent)

const router = useRouter()

//TODO quick hack for some edge cases, move to proper reinitialization of all model editors should this case occur (currently only recipe editor create new via navigation btn)
watch(() => props.id, (newValue, oldValue) => {
    if(newValue != oldValue){
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
function objectDeleted(){
    if (props.model.toLowerCase() == 'recipe'){
        router.push({name : 'StartPage'})
    } else {
        router.go(-1)
    }
}

</script>

<style scoped>

</style>