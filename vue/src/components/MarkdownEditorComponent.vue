<template>
    <div>
        <h1>EDITOR</h1>
        <div id="editor" style="" class="bg-info">

        </div>

    </div>

</template>

<script>

import {EditorState} from "@codemirror/state"
import {keymap, EditorView, MatchDecorator, Decoration, WidgetType, ViewPlugin} from "@codemirror/view"
import {defaultKeymap} from "@codemirror/commands"

import {markdown} from "@codemirror/lang-markdown"
import {autocompletion} from "@codemirror/autocomplete"

class PlaceholderWidget extends WidgetType { //TODO this is not working for some javascript magic reason
    name = undefined
    constructor(name) {
        console.log(name)
        super()
    }

    eq(other) {
        return this.name == other.name
    }

    toDOM() {
        let elt = document.createElement("span")
        elt.style.cssText = `
      border: 1px solid blue;
      border-radius: 4px;
      padding: 0 3px;
      background: lightblue;`

        elt.textContent = "Food"
        return elt
    }

    ignoreEvent() {
        return false
    }
}

export default {
    name: "MarkdownEditorComponent",
    props: {},
    computed: {},
    mounted() {

        const placeholderMatcher = new MatchDecorator({
            regexp: /\{\{\singredients\[\d\]\s\}\}/g,
            decoration: match => Decoration.replace({
                widget: new PlaceholderWidget(match[0]),
            })
        })

        const placeholders = ViewPlugin.fromClass(class {
            placeholders

            constructor(view) {
                this.placeholders = placeholderMatcher.createDeco(view)
            }

            update(update) {
                this.placeholders = placeholderMatcher.updateDeco(update, this.placeholders)
            }
        }, {
            decorations: instance => instance.placeholders,
            provide: plugin => EditorView.atomicRanges.of(view => {
                return view.plugin(plugin)?.placeholders || Decoration.none
            })
        })

        let startState = EditorState.create({
            doc: "Das ist eine Beschreibung \nPacke {{ ingredients[1] }} in das Fass mit {{ ingredients[3] }}\nTest Bla Bla",
            extensions: [keymap.of(defaultKeymap), placeholders, markdown(), autocompletion({override: [this.foodTemplateAutoComplete]})]
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
            if (word.from == word.to && !context.explicit)
                return null
            return {
                from: word.from,
                options: [
                    {label: "Mehl", type: "text", apply: "{{ ingredients[1] }}", detail: "template"},
                    {label: "Butter", type: "text", apply: "{{ ingredients[2] }}", detail: "template"},
                    {label: "Salz", type: "text", apply: "{{ ingredients[3] }}", detail: "template"},
                ]
            }
        }
    },
}
</script>
