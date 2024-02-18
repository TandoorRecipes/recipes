<template>
    <div>
        <b-button-group class="w-100 mt-1">
            <b-button @click="updateNumber( 'half')" variant="outline-info"
                      :disabled="disable"><i class="fas fa-divide"></i> 2
            </b-button>
            <b-button variant="outline-info" @click="updateNumber( 'sub')"
                      :disabled="disable"><i class="fas fa-minus"></i>
            </b-button>
            <b-button variant="outline-info" @click="updateNumber('prompt')"
                      :disabled="disable">
                {{ number }}
            </b-button>
            <b-button variant="outline-info" @click="updateNumber( 'add')"
                      :disabled="disable"><i class="fas fa-plus"></i>
            </b-button>
            <b-button @click="updateNumber('multiply')" variant="outline-info"
                      :disabled="disable"><i class="fas fa-times"></i> 2
            </b-button>
        </b-button-group>
    </div>
</template>

<script>
import Vue from "vue"
import {BootstrapVue} from "bootstrap-vue"
import "bootstrap-vue/dist/bootstrap-vue.css"

Vue.use(BootstrapVue)

export default {
    name: "NumberScalerComponent",
    props: {
        number: {type: Number, default:0},
        disable: {type: Boolean, default: false}
    },
    data() {
        return {}
    },
    methods: {
        /**
         * perform given operation on linked number
         * @param operation update mode
         */
        updateNumber: function(operation) {
            if (operation === 'half') {
                this.$emit('change', this.number / 2)
            }
            if (operation === 'multiply') {
                this.$emit('change', this.number * 2)
            }
            if (operation === 'add') {
                this.$emit('change', this.number + 1)
            }
            if (operation === 'sub') {
                this.$emit('change', this.number - 1)
            }
            if (operation === 'prompt') {
                let input_number = prompt(this.$t('Input'), this.number);
                if (input_number !== null && input_number !== "" && !isNaN(input_number) && !isNaN(parseFloat(input_number))) {
                    this.$emit('change', parseFloat(input_number))
                } else {
                    console.log('Invalid number input in  prompt', input_number)
                }
            }
        },
    },
}
</script>


<style scoped>

</style>