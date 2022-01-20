<template>
    <div style="cursor:pointer">
        <a v-if="!button" class="dropdown-item" @click="downloadFile"><i :class="icon"></i> {{ label }}</a>
        <b-button v-if="button" @click="downloadFile">{{ label }}</b-button>
    </div>
</template>

<script>
import html2pdf from "html2pdf.js"

export default {
    name: "DownloadPDF",

    props: {
        dom: { type: String },
        name: { type: String },
        icon: { type: String },
        label: { type: String },
        button: { type: Boolean, default: false },
    },
    methods: {
        downloadFile() {
            const doc = document.querySelector(this.dom)
            var options = {
                margin: 1,
                filename: this.name,
            }
            html2pdf().from(doc).set(options).save()
        },
    },
}
</script>
