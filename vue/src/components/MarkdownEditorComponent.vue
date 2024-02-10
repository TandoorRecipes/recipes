<template>
    <div>
        <h1>EDITOR</h1>
        <div id="editor" style="background-color: #fff; border: solid 1px">

        </div>


    </div>

</template>

<script>

import {EditorState} from "@codemirror/state"
import {keymap, EditorView, MatchDecorator, Decoration, WidgetType, ViewPlugin} from "@codemirror/view"
import {defaultKeymap, history} from "@codemirror/commands"

import {markdown, markdownLanguage} from "@codemirror/lang-markdown"
import {autocompletion} from "@codemirror/autocomplete"

import {defaultHighlightStyle, syntaxHighlighting} from "@codemirror/language";

class CheckboxWidget extends WidgetType {
    name = undefined

    constructor(name) {
        super()
        this.name = name
    }


    toDOM() {
        let wrap = document.createElement("span")
        wrap.innerText = this.name
        wrap.style.fontStyle = 'italic'

        let box = wrap.appendChild(document.createElement("b-badge"))
        box.setAttribute('variant', 'success')
        box.innerHTML = '1 g Test'
        box.style.cssText = ` border: 1px solid blue; border-radius: 4px; padding: 0 3px; background: lightblue;`
        return wrap
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

        const decoMatcher = new MatchDecorator({
            regexp: /\{\{ (?:scale\(\d+\)|ingredients\[\d+\]) \}\}/g,
            decoration: match => Decoration.replace({
                widget: new CheckboxWidget(match[0]),
            })
        })

        const placeholders = ViewPlugin.fromClass(class {
            placeholders

            constructor(view) {
                this.placeholders = decoMatcher.createDeco(view)
            }

            update(update) {
                this.placeholders = decoMatcher.updateDeco(update, this.placeholders)
            }
        }, {
            decorations: instance => instance.placeholders,
            provide: plugin => EditorView.atomicRanges.of(view => {
                return view.plugin(plugin)?.placeholders || Decoration.none
            })
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
            if (word.from == word.to && !context.explicit)
                return null
            return {
                from: word.from,
                options: [
                    {label: "Mehl", type: "text", apply: "{{ ingredients[1] }}", detail: "template"},
                    {label: "Butter", type: "text", apply: "{{ ingredients[2] }}", detail: "template"},
                    {label: "Salz", type: "text", apply: "{{ ingredients[3] }}", detail: "template"},
                    {label: "Scale", type: "text", apply: "{{ scale(100) }}", detail: "simple scalable number"},
                ]
            }
        }
    },
}
</script>
