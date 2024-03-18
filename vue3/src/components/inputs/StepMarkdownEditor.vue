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
                class="op-icon fas fa-calculator"
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
    emits: {
        change(payload: { step: Step }) {
            return payload
        }
    },
    watch: {
        mutable_step: function (){
            this.$emit('change', {step: this.mutable_step})
        }
    },
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
        }
    },
    mounted() {
        this.mutable_step = this.step
    },
})
</script>


<style scoped>

</style>