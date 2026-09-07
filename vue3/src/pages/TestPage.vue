<template>
    <v-container>
        <!--        <model-select model="Food" :object="false" allow-create></model-select>-->

        <!--        <v-model-select model="Food" create label="Food(Create)"></v-model-select>-->
        <!--        <v-model-select model="Food" create chips multiple label="Food(Create+Tags+Mult)"></v-model-select>-->
        <!--        <v-model-select model="Recipe" clearable label="Recipe"></v-model-select>-->

<!--        <v-expansion-panels>-->
<!--            <v-expansion-panel title="Test">-->
<!--                <v-expansion-panel-text>-->
<!--                    <v-model-select model="Keyword" v-model="value" :return-object="true" multiple chips label="Keyword (id)"></v-model-select>-->
<!--                </v-expansion-panel-text>-->
<!--            </v-expansion-panel>-->
<!--        </v-expansion-panels>-->

        <br/>
        <br/>

        <v-model-select model="Keyword" v-model="value" :return-object="false" multiple chips label="Keyword (id)"></v-model-select>
        <v-model-select model="Keyword" v-model="value" :return-object="false" multiple chips label="Keyword (id)"></v-model-select>



        {{value}}
    </v-container>
</template>

<script setup lang="ts">


import VModelSelect from "@/components/inputs/VModelSelect.vue";
import ModelSelect from "@/components/inputs/ModelSelect.vue";
import {ref} from "vue";
import {useRouteQuery} from "@vueuse/router";
import {toNumberArray} from "@/utils/utils.ts";

// let props = {
//         id: 'keywords',
//         label: "Test",
//         hint:"Test hint",
//         enabled: false,
//         default: [],
//         is: VModelSelect,
//         model: 'Keyword',
//         modelValueId: useRouteQuery('keywords2', [], {transform: toNumberArray}),
//         multiple: true,
//         chips: true,
//     }

//let value = useRouteQuery('keywords', [], {transform: toNumberArray})
let value = ref([])

let model = ref([])

</script>


<style scoped>

</style>