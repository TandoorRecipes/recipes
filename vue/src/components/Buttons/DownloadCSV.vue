<template>
    <div style="cursor:pointer">
        <a v-if="!button" class="dropdown-item" @click="downloadFile" href="#"><i :class="icon"></i> {{ label }}</a>
        <b-button v-if="button" @click="downloadFile">{{ label }}</b-button>
    </div>
</template>

<script>
export default {
    name: "DownloadCSV",

    props: {
        items: { type: Array },
        name: { type: String },
        icon: { type: String },
        label: { type: String },
        button: { type: Boolean, default: false },
        delim: { type: String, default: "," },
    },
    methods: {
        downloadFile() {
            let csvContent = "data:text/csv;charset=utf-8,"
            csvContent += [Object.keys(this.items[0]).join(this.delim), ...this.items.map((x) => Object.values(x).join(this.delim))].join("\n").replace(/(^\[)|(\]$)/gm, "")

            const data = encodeURI(csvContent)
            const link = document.createElement("a")
            link.setAttribute("href", data)
            link.setAttribute("download", "export.csv")
            link.click()
        },
    },
}
</script>
