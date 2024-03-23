<template>
    <v-dialog width="500" activator="parent" v-model="dialog">
        <template v-slot:activator="{ props }">
            <slot name="activator">
                <v-btn v-bind="props" text="Open Dialog"></v-btn>
            </slot>
        </template>

        <template v-slot:default="{ isActive }">
            <v-card :title="title">

                <v-card-text>

                    <v-number-input v-model="mutable_number" @update:modelValue="updateNumber('set')" control-variant="split" :min="0" >
                    </v-number-input>

                    <v-btn-group divided class="d-flex">
                        <v-btn  variant="tonal" class="flex-grow-1" @click="updateNumber( 'half')">
                            <i class="fas fa-divide"></i> 2
                        </v-btn>
                        <v-btn variant="tonal" class="flex-grow-1" @click="updateNumber('double')">
                            <i class="fas fa-times"></i> 2
                        </v-btn>
                    </v-btn-group>

                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn class="float-right" rounded @click="dialog = false">Close</v-btn>
                </v-card-actions>
            </v-card>

        </template>
    </v-dialog>
</template>

<script lang="ts">

import {defineComponent} from 'vue'
import {VNumberInput} from 'vuetify/labs/VNumberInput' //TODO remove once component is out of labs
export default defineComponent({
    name: "NumberScalerDialog",
    components: {VNumberInput},
    emits: {
        change(payload: { number: number }) {
            return payload
        }
    },
    props: {
        number: {type: Number, default: 0},
        title: {type: String, default: 'Number'}
    },
    data() {
        return {
            dialog: false,
            mutable_number: 0
        }
    },
    watch: {
        number: function (newVal) {
            this.mutable_number = newVal
        }
    },
    mounted() {
        this.mutable_number = this.number
    },
    methods: {
        /**
         * perform given operation on linked number
         * @param operation update mode
         */
        updateNumber: function (operation: string) {
            if (operation === 'half') {
                this.mutable_number = this.number / 2
            }
            if (operation === 'double') {
                this.mutable_number = this.number * 2
            }
            if (operation === 'add') {
                this.mutable_number = this.number + 1
            }
            if (operation === 'sub') {
                this.mutable_number = this.number - 1
            }

            this.$emit('change', {number: this.mutable_number})
        }
    },
})
</script>


<style scoped>

</style>