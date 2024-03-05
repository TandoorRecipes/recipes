<template>
    <component :is="compiled" :ingredient_factor="ingredient_factor" :code="code"></component>
</template>

<script>

import {defineComponent} from "vue";

import ScalableNumber from "@/components/display/ScalableNumber.vue";


export default defineComponent({
    name: 'InstructionsCompileComponent',
    computed: {},
    components: {ScalableNumber},
    props: [
        'code', 'ingredient_factor'
    ],
    data() {
        return {
            compiled: defineComponent( {
                name: 'compiled-instructions-component',
                props: ['ingredient_factor', 'code'],
                components: {  ScalableNumber, },
                template: `<div>${this.code}</div>`
            })
        }
    },
    mounted() {

    },
})
</script>

