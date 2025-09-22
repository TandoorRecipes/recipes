<template>

    <v-btn v-bind="props" :color="props.color" :variant="props.variant" :density="props.density" :icon="props.icon" :prepend-icon="props.prependIcon" :loading="props.loading">
        {{ props.text }}

        <v-menu activator="parent">

            <v-list>
                <v-list-item
                    v-for="provider in aiProviders"
                    :key="provider.id!"
                    @click="emit('selected', provider.id!)"
                >
                    <v-list-item-title>
                        {{ provider.name }}
                    </v-list-item-title>
                </v-list-item>
            </v-list>
        </v-menu>
    </v-btn>


</template>

<script setup lang="ts">

import {AiProvider, ApiApi} from "@/openapi";
import {onMounted, PropType, ref} from "vue";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore.ts";


const emit = defineEmits(['selected'])

const props = defineProps({
    text: {type: String, default: 'AI'},
    color: {type: String, default: ''},
    variant: {type: undefined, default: undefined},
    density: {type: undefined, default: undefined},
    icon: {type: String, default: undefined},
    prependIcon: {type: String, default: undefined},
    loading: {type: Boolean, default: false},
})

const aiProviders = ref([] as AiProvider[])

onMounted(() => {
    loadAiProviders()
})

function loadAiProviders() {
    let api = new ApiApi()

    api.apiAiProviderList().then(r => {
        aiProviders.value = r.results
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    })
}

</script>


<style scoped>

</style>