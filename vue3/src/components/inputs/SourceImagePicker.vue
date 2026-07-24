<template>
    <v-row density="compact">
        <v-col cols="4" v-for="img in images" :key="img">
            <v-card :variant="isSelected(img) ? 'outlined' : 'flat'"
                    :color="isSelected(img) ? 'primary' : undefined"
                    @click="toggle(img)" style="cursor: pointer; position: relative;">
                <v-img max-height="10vh" cover aspect-ratio="1" :src="img"></v-img>
                <v-chip v-if="isSelected(img)" size="x-small" color="primary" variant="flat"
                        class="ma-1" style="position: absolute; top: 0; left: 0;">
                    <template v-if="showCoverBadge">{{ indexOf(img) === 0 ? $t('Cover') : indexOf(img) + 1 }}</template>
                    <v-icon v-else icon="fa-solid fa-check" size="x-small"></v-icon>
                </v-chip>
            </v-card>
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
// Multi-select thumbnail grid for images scraped from a source page. Selection is an
// ordered array of URLs (v-model). With showCoverBadge the first-selected is flagged as
// the cover and the rest carry their position (import wizard); otherwise selected items
// get a plain check (recipe image editor, where additions just append to the gallery).
defineProps<{
    images: string[]
    showCoverBadge?: boolean
}>()

const selected = defineModel<string[]>({default: () => []})

function isSelected(url: string): boolean {
    return selected.value.includes(url)
}

function indexOf(url: string): number {
    return selected.value.indexOf(url)
}

function toggle(url: string) {
    const i = selected.value.indexOf(url)
    if (i >= 0) {
        selected.value = selected.value.filter((u) => u !== url)
    } else {
        selected.value = [...selected.value, url]
    }
}
</script>
