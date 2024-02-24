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
                    Change Number
                </v-card-text>

                <v-card-text>
                    <v-btn-group divided color="primary">
                        <v-btn @click="updateNumber( 'half')"><i class="fas fa-divide"></i> 2
                        </v-btn>
                        <v-btn @click="updateNumber( 'sub')"><i class="fas fa-minus"></i>
                        </v-btn>
                        <v-btn @click="updateNumber('prompt')">
                            {{ mutable_number }}
                        </v-btn>
                        <v-btn @click="updateNumber( 'add')"><i class="fas fa-plus"></i>
                        </v-btn>
                        <v-btn @click="updateNumber('double')"><i class="fas fa-times"></i> 2
                        </v-btn>
                    </v-btn-group>

                    <v-text-field type="number" v-model.number="mutable_number" @change="updateNumber('set')"></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-btn rounded variant="outlined" @click="dialog = false">Close</v-btn>
                </v-card-actions>
            </v-card>

        </template>
    </v-dialog>
</template>

<script lang="ts">

import {defineComponent} from 'vue'

export default defineComponent({
    name: "NumberScalerDialog",
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