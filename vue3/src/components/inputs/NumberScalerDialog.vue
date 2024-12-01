<template>
    <v-dialog width="500" activator="parent" v-model="dialog">

            <v-card>
                <v-closable-card-title :title="title" v-model="dialog"></v-closable-card-title>

                <v-card-text>

                    <v-number-input v-model="mutable_number" @update:modelValue="updateNumber('set')" control-variant="split" :min="0">
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
                    <v-btn color="save" prepend-icon="$save" @click="emit('confirm', mutable_number); dialog=false">{{ $t('Save') }}</v-btn>
                </v-card-actions>
            </v-card>

    </v-dialog>
</template>

<script setup lang="ts">

import {defineComponent, onMounted, ref, watch} from 'vue'
import {VNumberInput} from 'vuetify/labs/VNumberInput'
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
const mutable_number = ref(0)

watch(() => props.number, (newVal) => {
    mutable_number.value = newVal
})

onMounted(() => {
    mutable_number.value = props.number
})

/**
 * perform given operation on linked number
 * @param operation update mode
 */
function updateNumber(operation: string) {
    if (operation === 'half') {
        mutable_number.value = props.number / 2
    }
    if (operation === 'double') {
        mutable_number.value = props.number * 2
    }
    if (operation === 'add') {
        mutable_number.value = props.number + 1
    }
    if (operation === 'sub') {
        mutable_number.value = props.number - 1
    }

    emit('change', mutable_number.value)
}
</script>


<style scoped>

</style>