<template>

    <v-item-group selected-class=" border-opacity-100 border-primary" v-model="model" :multiple="props.multiple" >
        <v-row class="mb-2" dense>
            <v-col cols="12" md="4" v-for="g in groups" :key="g.id">
                <v-item v-slot="{isSelected, selectedClass, toggle}" :value="g">

                    <v-card class="border" @click="toggle" :class="[selectedClass]">
                        <v-card-title>{{ $t(g.name) }}</v-card-title>
                        <v-card-text>
                            <template v-if="g.name == 'guest'">{{ $t('PermissionHelpGuest') }}</template>
                            <template v-if="g.name == 'user'">{{ $t('PermissionHelpUser') }}</template>
                            <template v-if="g.name == 'admin'">{{ $t('PermissionHelpAdmin') }}</template>

                        </v-card-text>
                    </v-card>

                </v-item>
            </v-col>
        </v-row>
    </v-item-group>
</template>

<script setup lang="ts">
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore.ts";
import {ApiApi, Group} from "@/openapi";
import {onMounted, ref} from "vue";

const props = defineProps({
    multiple: {type: Boolean, default: false},
})

const groups = ref([] as Group[])
const model = defineModel<Group| Group[] | undefined>(undefined)

onMounted(() => {
    loadGroups()
})

function loadGroups() {
    let api = new ApiApi()

    api.apiGroupList().then(r => {
        groups.value = r
        if (!model.value) {
            model.value = groups.value[0]
        }
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    })
}
</script>


<style scoped>

</style>