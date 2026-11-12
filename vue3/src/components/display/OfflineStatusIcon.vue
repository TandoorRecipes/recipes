<template>
  <v-tooltip v-if="!isOnline" :text="$t('OfflineMode')" location="bottom">
    <template v-slot:activator="{ props }">
      <v-icon v-bind="props" icon="fa-solid fa-triangle-exclamation" color="error" class="pulse-animation" size="small"></v-icon>
    </template>
  </v-tooltip>
</template>

<script lang="ts" setup>
import { useOfflineDetection } from "@/composables/useOfflineDetection"

const { isOnline } = useOfflineDetection()
</script>

<style scoped>
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.pulse-animation {
  animation: pulse 2s ease-in-out infinite;
}
</style>
