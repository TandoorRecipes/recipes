<template>
    <div>
        <h1>EDITOR</h1>
        <div id="editor" style="" class="bg-info">

        </div>

    </div>

</template>

<script>

import {EditorState} from "@codemirror/state"
import {keymap, EditorView} from "@codemirror/view"
import {defaultKeymap} from "@codemirror/commands"

import {markdown} from "@codemirror/lang-markdown"
import {autocompletion} from "@codemirror/autocomplete"

export default {
    name: "MarkdownEditorComponent",
    props: {},
    computed: {},
    mounted() {


        let startState = EditorState.create({
            doc: "Das ist eine Beschreibung \nPacke {{ ingredients[1] }} in das Fass mit {{ ingredients[3] }}\nTest Bla Bla",
            extensions: [keymap.of(defaultKeymap), markdown(), autocompletion({override: [this.foodTemplateAutoComplete]})]
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
