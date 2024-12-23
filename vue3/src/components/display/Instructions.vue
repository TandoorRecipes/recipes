<template>
<!--    <component :is="compiled_instructions" :ingredient_factor="ingredient_factor" :instructions_html="instructions_html"></component>-->
    <div v-html="instructions_html"></div>
</template>

<script>

import {defineComponent, markRaw} from "vue";

import ScalableNumber from "@/components/display/ScalableNumber.vue";

/**
 * the API template compiler returns safe, pre rendered html (from markdown) with scalable number tags inside (<scalable-number v-bind:number='80.0000000000000000' v-bind:factor='ingredient_factor'></scalable-number>)
 * to render this markdown and allow the <scalable-number> component to work we use the special <component> element (https://vuejs.org/api/built-in-special-elements#component)
 */
export default defineComponent({
    name: 'Instructions',
    computed: {},
    components: {ScalableNumber},
    props: {
        instructions_html: {type: String, required: true},
        ingredient_factor: {type: Number, required: true},
    },
    data() {
        return {
            // create a inline component that renders the given html
            compiled_instructions: markRaw(defineComponent({
                name: 'compiled-instructions-component',
                props: {
                    instructions_html: {type: String, required: true},
                    ingredient_factor: {type: Number, required: true},
                },
                components: {ScalableNumber,},
                template: `<div>${this.instructions_html}</div>`
            }))
        }
    },
    mounted() {

    },
})
</script>

