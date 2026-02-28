<template>
    <v-card-text>
        {{ $t('MonthlyCreditsUsed') }} ({{ store.activeSpace.aiMonthlyCreditsUsed }} / {{ store.activeSpace.aiCreditsMonthly }})
        {{ $t('AiCreditsBalance') }} : {{ store.activeSpace.aiCreditsBalance }}
        <v-progress-linear
            :model-value="store.activeSpace.aiMonthlyCreditsUsed"
            :max="store.activeSpace.aiCreditsMonthly"
        />
    </v-card-text>
</template>

<script setup lang="ts">
import {useUserPreferenceStore} from '@/stores/UserPreferenceStore'
const store = useUserPreferenceStore()
</script>
