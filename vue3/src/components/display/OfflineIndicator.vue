<template>
  <v-snackbar v-model="showBanner" :timeout="5000" location="top" color="warning" multi-line>
    <div class="d-flex align-center">
      <v-icon icon="fa-solid fa-triangle-exclamation" class="me-2"></v-icon>
      <span>{{ $t("OfflineMode") }}</span>
    </div>
    <template v-slot:actions>
      <v-btn variant="text" @click="showBanner = false" size="small">
        {{ $t("Close") }}
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue"
import { useOfflineDetection } from "@/composables/useOfflineDetection"

const { isOnline } = useOfflineDetection()

const showBanner = ref(false)

watch(isOnline, (online) => {
  showBanner.value = !online
})
</script>
