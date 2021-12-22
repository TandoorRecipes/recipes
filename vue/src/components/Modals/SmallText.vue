<template>
    <div class="small text-muted">
        {{ value }}
    </div>
</template>

<script>
export default {
    name: "TextInput",
    props: {
        value: { type: String, default: "" },
    },
    data() {
        return {}
    },
    mounted() {},
    watch: {},
    methods: {},
}
</script>
