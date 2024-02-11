<template>
    <div>
        <h1>EDITOR</h1>
        <div id="editor" style="background-color: #fff; border: solid 1px">

        </div>


    </div>

</template>

<script>

import {EditorState} from "@codemirror/state"
import {keymap, EditorView, MatchDecorator, Decoration, WidgetType, ViewPlugin, DecorationSet} from "@codemirror/view"
import {defaultKeymap, history} from "@codemirror/commands"

import {markdown, markdownLanguage} from "@codemirror/lang-markdown"
import {autocompletion} from "@codemirror/autocomplete"

import {defaultHighlightStyle, syntaxHighlighting, syntaxTree} from "@codemirror/language";

class TemplatePreviewWidget extends WidgetType {
    name = undefined
    ingredients = []

    constructor(name, ingredients) {
        super()
        this.name = name
        this.ingredients = ingredients
    }

    getIngredientLabel(ingredient) {
        // TODO all possible null combinations
        return `${ingredient.amount} ${ingredient.unit.name} ${ingredient.food.name}`
    }

    toDOM() {
        let preview_span = document.createElement("span")

        let display_text = 'ERROR'
        if (this.name.includes('ingredients')) {
            let ingredient_index = this.name.replace('{{ ingredients[', '').replace('] }}', '') // TODO support calculations ingredients[0]*0.5
            display_text = this.getIngredientLabel(this.ingredients[ingredient_index])
        }

        if (this.name.includes('scale(')) {
            display_text = this.name.replace('{{ scale(', '').replace(') }}', '') // TODO support calculations scale(100)*2
        }

        preview_span.innerHTML = display_text
        preview_span.style.cssText = ` border: 1px solid blue; border-radius: 4px; padding: 0 3px; background: lightblue;`
        return preview_span
    }

    ignoreEvent() {
        return false
    }
}

export default {
    name: "MarkdownEditorComponent",
    props: {},
    computed: {
        autocomplete_options() {
            let autocomplete_options = []

            let index = 0
            for (let i of this.ingredients) {
                autocomplete_options.push({label: i.food.name, type: "text", apply: `{{ ingredients[${index}] }}`, detail: `${i.amount} ${i.unit.name} ${i.food.name}`})
                index++
            }

            autocomplete_options.push({label: "Scale", type: "text", apply: "{{ scale(100) }}", detail: "simple scalable number"})
            return autocomplete_options
        }
    },
    data() {
        return {
            ingredients: [
                {amount: 20, food: {'name': 'raspberry'}, unit: {'name': 'pcs'}},
                {amount: 100, food: {'name': 'sugar'}, unit: {'name': 'g'}},
                {amount: 250, food: {'name': 'water'}, unit: {'name': 'ml'}},
                {amount: 1, food: {'name': 'salt'}, unit: {'name': 'pinch'}},
            ]
        }
    },
    mounted() {

        const decoMatcher = new MatchDecorator({
            regexp: /\{\{ (?:scale\(\d+\)|ingredients\[\d+\]) \}\}/g,
            decorate: (add, from, to, match, view) => {
                const templatePreview = new TemplatePreviewWidget(match[0], this.ingredients);
                add(to, to, Decoration.widget({widget: templatePreview, side: 1}));
            },
        })

        const placeholders = ViewPlugin.fromClass(class {
            decorations

            constructor(view) {
                this.decorations = decoMatcher.createDeco(view)
            }

            update(viewUpdate) {
                this.decorations = decoMatcher.updateDeco(viewUpdate, this.decorations)
            }
        }, {
            decorations: instance => instance.decorations,

        })

        let startState = EditorState.create({
            doc: "## Header\n\nDas ist eine Beschreibung [test](https://google.com) \nPacke {{ ingredients[1] }} in das Fass mit {{ ingredients[3] }}\nTest Bla Bla {{ scale(100) }} \n\n- test\n- test 2\n- test3",
            extensions: [
                history(),
                syntaxHighlighting(defaultHighlightStyle),
                keymap.of(defaultKeymap),
                placeholders,
                markdown({base: markdownLanguage, highlightFormatting: true}),
                autocompletion({override: [this.foodTemplateAutoComplete]})
            ]
        })

        let view = new EditorView({
            state: startState,
            extensions: [],
            parent: document.getElementById("editor")
        })
    },
    methods: {
        foodTemplateAutoComplete: function (context) {
            let word = context.matchBefore(/\w*/)
            if (word.from === word.to && !context.explicit)
                return null
            return {
                from: word.from,
                options: this.autocomplete_options
            }
        },
    },
}
</script>
