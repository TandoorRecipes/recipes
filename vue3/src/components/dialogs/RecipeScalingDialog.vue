<template>

    <v-dialog width="500" activator="parent" v-model="dialog">

        <v-card>
            <v-closable-card-title :title="$t('Scaling')" v-model="dialog"></v-closable-card-title>

            <v-card-text>

                <v-number-input :precision="2" v-model="servings" control-variant="split" :min="0">
                </v-number-input>

                <v-btn-group divided class="d-flex">
                    <v-btn variant="tonal" class="flex-grow-1" @click="servings = servings/2">
                        <i class="fas fa-divide"></i> 2
                    </v-btn>
                    <v-btn variant="tonal" class="flex-grow-1" @click="servings = servings*2">
                        <i class="fas fa-times"></i> 2
                    </v-btn>
                </v-btn-group>

            </v-card-text>
            <v-card-actions>
                <v-btn @click=" dialog=false">{{ $t('Close') }}</v-btn>
                <v-btn color="save" prepend-icon="$save" @click="emit('confirm', mutableNumber); dialog=false">{{ $t('Save') }}</v-btn>
            </v-card-actions>
        </v-card>

    </v-dialog>

</template>

<script setup lang="ts">

import VClosableCardTitle from "@/components/dialogs/VClosableCardTitle.vue";
import {PropType, ref, watch} from "vue";
import {Recipe, RecipeOverview} from "@/openapi";

const props = defineProps({
    recipe: {type: {} as PropType<Recipe|RecipeOverview>}
})

const servings = defineModel<number>('servings', {default: 1})
const diameter = defineModel<number>('diameter', {default: 0})

const dialog = ref(false)


</script>


<style scoped>

</style>