<template>
    <div style="cursor:pointer">
        <a v-if="!button" class="dropdown-item" @click="clipboard" href="#"><i :class="icon"></i> {{ label }}</a>
        <b-button v-if="button" @click="clipboard">{{ label }}</b-button>
    </div>
</template>

<script>
import { makeToast } from "@/utils/utils"
export default {
    name: "CopyToClipboard",

    props: {
        items: { type: Array },
        icon: { type: String },
        label: { type: String },
        button: { type: Boolean, default: false },
        settings: { type: Object },
        format: { type: String, default: "delim" },
    },
    methods: {
        clipboard: function () {
            let text = ""
            switch (this.format) {
                case "delim":
                    text = this.delimited()
                    break
                case "table":
                    text = this.table()
                    break
            }

            navigator.clipboard.writeText(text).then(makeToast(this.$t("Success"), this.$t("SuccessClipboard"), "success"))
        },
        delimited: function () {
            let csvContent = ""
            let delim = this.settings.csv_delim || ","
            let prefix = this.settings.csv_prefix || ""
            csvContent += [prefix + Object.keys(this.items[0]).join(delim), ...this.items.map((x) => prefix + Object.values(x).join(delim))].join("\n").replace(/(^\[)|(\]$)/gm, "")
            return csvContent
        },
        table: function () {
            let table = ""
            let delim = "|"
            table += [
                delim + Object.keys(this.items[0]).join(delim) + delim,
                delim +
                    Object.keys(this.items[0])
                        .map((x) => {
                            return ":---"
                        })
                        .join(delim) +
                    delim,
                ...this.items.map((x) => delim + Object.values(x).join(delim) + delim),
            ]
                .join("\n")
                .replace(/(^\[)|(\]$)/gm, "")
            return table
        },
    },
}
</script>
