<template>
    <li @click="$emit('click', $event)" role="presentation">
        <slot />
    </li>
</template>

<script>
export default {
    name: "ContextMenuItem.vue",
}
</script>

<style scoped></style>
