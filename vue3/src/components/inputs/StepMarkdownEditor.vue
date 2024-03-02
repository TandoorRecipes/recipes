<template>
    <mavon-editor v-model="mutable_step.instruction" :autofocus="false"
                  style="z-index: auto" :id="'id_instruction_' + mutable_step.id"
                  :language="'en'"
                  :toolbars="md_editor_toolbars" :defaultOpen="'edit'">
        <template #left-toolbar-after>
            <span class="op-icon-divider"></span>
            <button
                type="button"
                @click="mutable_step.instruction+= ' {{ scale(100) }}'"
                class="op-icon fas fa-times"
                aria-hidden="true"
                title="Scalable Number"
            ></button>
        </template>
    </mavon-editor>
</template>

<script lang="ts">

import {defineComponent, PropType} from 'vue'
import {Step} from "@/openapi";
import 'mavon-editor/dist/css/index.css'

export default defineComponent({
    name: "StepMarkdownEditor",
    props: {
        step: {type: Object as PropType<Step>, required: true}
    },
    data() {
        return {
            mutable_step: {} as Step,

            md_editor_toolbars: {
                bold: true,
                italic: true,
                header: true,
                underline: true,
                strikethrough: true,
                mark: false,
                superscript: true,
                subscript: true,
                quote: true,
                ol: true,
                ul: true,
                link: true,
                imagelink: false,
                code: true,
                table: false,
                fullscreen: false,
                readmodel: false,
                htmlcode: false,
                help: true,
                undo: true,
                redo: true,
                navigation: true,
                alignleft: false,
                aligncenter: false,
                alignright: false,
                subfield: true,
                preview: true,
            }
        }
    },
    mounted() {
        this.mutable_step = this.step
    },
})
</script>


<style scoped>

</style>