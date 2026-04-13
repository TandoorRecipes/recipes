<template>
    <v-dialog max-width="400px" v-model="dialog">
        <v-card :loading="loading">
            <v-closable-card-title :title="$t('Log_Cooking')" v-model="dialog"></v-closable-card-title>
            <v-card-text>
                <v-number-input v-model="servings" :label="$t('Servings')" :precision="2"
                                control-variant="split" :disabled="loading"></v-number-input>
                <v-rating v-model="rating" hover clearable density="compact" class="mb-3"
                          :aria-label="$t('Rating')"></v-rating>
                <v-textarea v-model="comment" :label="$t('Comment')" rows="2" auto-grow
                            :disabled="loading"></v-textarea>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="create" prepend-icon="$create" @click="logCooking()" :disabled="loading">
                    {{ $t('Save') }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import {PropType, ref, computed} from "vue";
import {ApiApi, Recipe, RecipeOverview} from "@/openapi";
import {ErrorMessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore";
import VClosableCardTitle from "@/components/dialogs/VClosableCardTitle.vue";

const props = defineProps({
    recipe: {type: Object as PropType<Recipe | RecipeOverview>, required: true},
    modelValue: {type: Boolean, default: false},
})

const emit = defineEmits(['update:modelValue'])

const dialog = computed({
    get: () => props.modelValue,
    set: (val: boolean) => emit('update:modelValue', val),
})

const servings = ref(props.recipe.servings)
const rating = ref<number>(0)
const comment = ref('')
const loading = ref(false)

function logCooking() {
    loading.value = true
    const api = new ApiApi()
    api.apiCookLogCreate({
        cookLog: {
            recipe: props.recipe.id!,
            servings: servings.value,
            ...(rating.value > 0 ? {rating: rating.value} : {}),
            ...(comment.value ? {comment: comment.value} : {}),
        }
    }).then(() => {
        useMessageStore().addPreparedMessage(PreparedMessage.CREATE_SUCCESS)
        dialog.value = false
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
    }).finally(() => {
        loading.value = false
    })
}
</script>
