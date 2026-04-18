<template>
    <v-dialog max-width="400px" v-model="dialog">
        <v-card :loading="loading">
            <v-closable-card-title :title="$t('Add_to_Book')" v-model="dialog"></v-closable-card-title>
            <v-card-text>
                <model-select model="RecipeBook" v-model="selectedBook" append-to-body></model-select>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn variant="text" @click="dialog = false">{{ $t('Cancel') }}</v-btn>
                <v-btn color="create" prepend-icon="$create" @click="addToBook()" :disabled="!selectedBook || loading">
                    {{ $t('Add') }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import {PropType, ref, computed} from "vue";
import {ApiApi, RecipeBook, Recipe, RecipeOverview} from "@/openapi";
import {ErrorMessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore";
import VClosableCardTitle from "@/components/dialogs/VClosableCardTitle.vue";
import ModelSelect from "@/components/inputs/ModelSelect.vue";

const props = defineProps({
    recipe: {type: Object as PropType<Recipe | RecipeOverview>, required: true},
    modelValue: {type: Boolean, default: false},
})

const emit = defineEmits(['update:modelValue'])

const dialog = computed({
    get: () => props.modelValue,
    set: (val: boolean) => emit('update:modelValue', val),
})

const selectedBook = ref<RecipeBook | null>(null)
const loading = ref(false)

function addToBook() {
    if (!selectedBook.value) return
    loading.value = true
    const api = new ApiApi()
    api.apiRecipeBookEntryCreate({
        recipeBookEntry: {
            book: selectedBook.value.id!,
            recipe: props.recipe.id!,
            recipeContent: {} as any,
            bookContent: {} as any,
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
