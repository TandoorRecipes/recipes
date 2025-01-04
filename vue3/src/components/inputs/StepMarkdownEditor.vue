<template>
    <mavon-editor v-model="step.instruction" :autofocus="false"
                  style="z-index: auto" :id="'id_instruction_' + step.id"
                  :language="'en'"
                  :toolbars="md_editor_toolbars" :defaultOpen="'edit'">
        <template #left-toolbar-after>
            <span class="op-icon-divider"></span>
            <button
                type="button"
                @click="step.instruction+= ' {{ scale(100) }}'"
                class="op-icon fas fa-calculator"
                aria-hidden="true"
                :title="$t('ScalableNumber')"
            ></button>
            <button class="op-icon fa-solid fa-code">
                <v-menu activator="parent">
                    <v-list density="compact">

                        <v-list-item
                            v-for="template in templates"
                            @click="step.instruction+= template.template"
                        >
                            <ingredient-string :ingredient="template.ingredient"></ingredient-string>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </button>
        </template>
    </mavon-editor>
</template>

<script setup lang="ts">

import {Ingredient, Step} from "@/openapi";
import 'mavon-editor/dist/css/index.css'
import IngredientString from "@/components/display/IngredientString.vue";
import {computed} from "vue";

const step = defineModel<Step>({required: true})

type IngredientTemplate = {
    name: string,
    ingredient: Ingredient,
    template: string,
}

const templates = computed(() => {
    let templateList: IngredientTemplate[] = []
    step.value.ingredients.forEach((ingredient, index) => {
        if (!ingredient.isHeader && ingredient.food != null)
            templateList.push({
                name: ingredient.food.name,
                ingredient: ingredient,
                template: `{{ ingredients[${index}] }}{# ${ingredient.food.name} #}`
            } as IngredientTemplate)
    })

    return templateList
})

const md_editor_toolbars = {
    bold: true,
    italic: true,
    header: true,
    underline: true,
    strikethrough: true,
    mark: false,
    superscript: false,
    subscript: false,
    quote: true,
    ol: true,
    ul: true,
    link: true,
    imagelink: false,
    code: false,
    table: false,
    fullscreen: false,
    readmodel: false,
    htmlcode: false,
    help: false,
    undo: true,
    redo: true,
    navigation: false,
    alignleft: false,
    aligncenter: false,
    alignright: false,
    subfield: true,
    preview: true,
}

</script>


<style scoped>

</style>