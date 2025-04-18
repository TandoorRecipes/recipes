<template>
    <v-dialog width="500" activator="parent" v-model="dialog">

            <v-card>
                <v-closable-card-title :title="title" v-model="dialog"></v-closable-card-title>

                <v-card-text>

                    <v-number-input precision="2" v-model="mutableNumber" @update:modelValue="updateNumber('set')" control-variant="split" :min="0">
                    </v-number-input>

                    <v-btn-group divided class="d-flex">
                        <v-btn variant="tonal" class="flex-grow-1" @click="updateNumber( 'half')">
                            <i class="fas fa-divide"></i> 2
                        </v-btn>
                        <v-btn variant="tonal" class="flex-grow-1" @click="updateNumber('double')">
                            <i class="fas fa-times"></i> 2
                        </v-btn>
                    </v-btn-group>

                </v-card-text>
                <v-card-actions>
                    <v-btn @click=" dialog=false">{{ $t('Close') }}</v-btn>
                    <v-btn color="save" prepend-icon="$save" @click="emit('confirm', mutableNumber); dialog=false">{{ $t('Save') }}</v-btn>
                </v-card-actions>
            </v-card>

    </v-dialog>
</template>

<script setup lang="ts">

import {defineComponent, onMounted, ref, watch} from 'vue'
import VClosableCardTitle from "@/components/dialogs/VClosableCardTitle.vue"; //TODO remove once component is out of labs

const emit = defineEmits({
    change(payload: number) {
        return payload
    },
    confirm(payload: number) {
        return payload
    }
})

const props = defineProps({
    number: {type: Number, default: 0},
    title: {type: String, default: 'Number'}
})

const dialog = ref(false)
const mutableNumber = ref(0)

watch(() => props.number, (newVal) => {
    mutableNumber.value = newVal
})

onMounted(() => {
    mutableNumber.value = props.number
})

/**
 * perform given operation on linked number
 * @param operation update mode
 */
function updateNumber(operation: string) {
    if (operation === 'half') {
        mutableNumber.value = mutableNumber.value / 2
    }
    if (operation === 'double') {
        mutableNumber.value = mutableNumber.value * 2
    }
    if (operation === 'add') {
        mutableNumber.value = mutableNumber.value + 1
    }
    if (operation === 'sub') {
        mutableNumber.value = mutableNumber.value - 1
    }

    emit('change', mutableNumber.value)
}
</script>


<style scoped>

</style>