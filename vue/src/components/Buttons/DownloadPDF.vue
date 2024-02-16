<template>
    <div style="cursor:pointer;">
        <a v-if="!button" class="dropdown-item" @click="downloadFile" href="#"><i :class="icon"></i> {{ label }}</a>
        <b-button class="dropdown-item" v-if="button" @click="downloadFile">{{ label }}</b-button>
    </div>
</template>

<script>

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
            window.print()
        },
    },
}
</script>
