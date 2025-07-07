<template>
    <component :is="compiled_instructions" :ingredient_factor="ingredient_factor" :instructions_html="instructions_html"></component>
    <!--    <div v-html="instructions_html"></div>-->
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
                template: `
                    <div>${this.instructions_html}</div>`
            }))
        }
    },
    mounted() {

    },
})
</script>

<style>

/**
 vuetify removes all margins and paddings which break layout, re-add them by reverting vuetify change
 */
p, ol, ul, li {
    padding: revert;
    margin: revert;
}


/* css classes needed to render markdown blockquotes */
blockquote {
    background: rgb(200,200,200,0.2);
    border-left: 4px solid #ccc;
    margin: 1.5em 10px;
    padding: .5em 10px;
    quotes: none;
}

blockquote:before {
    color: #ccc;
    content: open-quote;
    font-size: 4em;
    line-height: .1em;
    margin-right: .25em;
    vertical-align: -.4em;
}

blockquote p {
    display: inline;
}

.markdown-table {
    border: 1px solid;
    border-collapse: collapse;
}

.markdown-table-cell {
    border: 1px solid;
    border-collapse: collapse;
    padding: 8px;
}

</style>
