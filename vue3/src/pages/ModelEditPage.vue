<template>
    <v-container>
        <v-row>
            <v-col>
                <v-card>
                    <v-card-text class="pt-2 pb-2">
                        <v-btn variant="flat" @click="router.go(-1)" prepend-icon="fa-solid fa-arrow-left">{{ $t('Back') }}</v-btn>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <component :is="editorComponent" :item-id="id" @delete="router.go(-1)"></component>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">

import {useRouter} from "vue-router";
import {EditorSupportedModels, getGenericModelFromString} from "@/types/Models";
import {defineAsyncComponent, PropType, shallowRef} from "vue";
import {useI18n} from "vue-i18n";

const {t} = useI18n()

const props = defineProps({
    model: {type: String as PropType<EditorSupportedModels>, required: true},
    id: {type: String, required: false, default: undefined},
})

const editorComponent = shallowRef(defineAsyncComponent(() => import(`@/components/model_editors/${getGenericModelFromString(props.model, t).model.name}Editor.vue`)))

const router = useRouter()

</script>

<style scoped>

</style>