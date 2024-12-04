<template>
    <mavon-editor v-model="steep.instruction" :autofocus="false"
                  style="z-index: auto" :id="'id_instruction_' + steep.id"
                  :language="'en'"
                  :toolbars="md_editor_toolbars" :defaultOpen="'edit'">
        <template #left-toolbar-after>
            <span class="op-icon-divider"></span>
            <button
                type="button"
                @click="steep.instruction+= ' {{ scale(100) }}'"
                class="op-icon fas fa-calculator"
                aria-hidden="true"
                :title="$t('ScalableNumber')"
            ></button>
        </template>
    </mavon-editor>
</template>

<script setup lang="ts">

import {Step} from "@/openapi";
import 'mavon-editor/dist/css/index.css'

const steep = defineModel<Step>({required: true})

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