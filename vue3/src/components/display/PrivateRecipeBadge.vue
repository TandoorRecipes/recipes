<template>
    <i class="fa-solid fa-lock"></i>
    <span v-if="props.showText" class="ms-1 me-1">{{ $t('Private_Recipe') }}</span>
    <v-chip class="me-1 mb-1" :color="props.color" :size="props.size" :variant="props.variant" v-for="u in users" :key="u.id" prepend-icon="fa-solid fa-share-nodes"> {{ u.displayName }}
    </v-chip>
</template>

<script setup lang="ts">

import {User} from "@/openapi";
import {PropType} from "vue";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore.ts";

const props = defineProps({
    showText: {type: Boolean, default: true},
    users: {type: [] as PropType<Array<User>>, required: false},

    size: {type: String, default: 'x-small'},
    color: {type: String, default: ''},
    variant: {type: String as PropType<NonNullable<"tonal" | "flat" | "text" | "elevated" | "outlined" | "plain"> | undefined>, default: 'tonal'},
})

</script>

<style scoped>

</style>