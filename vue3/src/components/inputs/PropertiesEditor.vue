<template>
    <v-btn-group density="compact">
        <v-btn color="create" @click="properties.push({} as Property)" prepend-icon="$create">{{ $t('Add') }}</v-btn>
        <v-btn color="secondary" @click="addAllProperties" prepend-icon="fa-solid fa-list">{{ $t('AddAll') }}</v-btn>
    </v-btn-group>

    <v-row class="d-none d-md-flex mt-2" v-for="p in properties" dense>
        <v-col cols="0" md="5">
            <v-number-input :step="10" v-model="p.propertyAmount" control-variant="stacked">
                <template #append-inner v-if="p.propertyType">
                    <v-chip class="me-4">{{ p.propertyType.unit }} / {{ props.amountFor }}
                    </v-chip>
                </template>
            </v-number-input>
        </v-col>
        <v-col cols="0" md="6">
            <!-- TODO fix card overflow invisible, overflow-visible class is not working -->
            <model-select :label="$t('Property')" v-model="p.propertyType" model="PropertyType"></model-select>
        </v-col>
        <v-col cols="0" md="1">
            <v-btn color="delete" @click="deleteProperty(p)">
                <v-icon icon="$delete"></v-icon>
            </v-btn>
        </v-col>
    </v-row>
    <v-list class="d-md-none">
        <v-list-item v-for="p in properties" border>
            <span v-if="p.propertyType">{{ p.propertyAmount }} {{ p.propertyType.unit }} {{ p.propertyType.name }} / {{ props.amountFor }}
            </span>
            <span v-else><i><{{ $t('New') }}></i></span>
            <template #append>
                <v-btn color="edit">
                    <v-icon icon="$edit"></v-icon>
                    <model-edit-dialog model="Property" :item="p"></model-edit-dialog>
                </v-btn>
            </template>
        </v-list-item>
    </v-list>
</template>

<script setup lang="ts">

import {ApiApi, Property} from "@/openapi";
import {VNumberInput} from 'vuetify/labs/VNumberInput'
import ModelEditDialog from "@/components/dialogs/ModelEditDialog.vue";
import ModelSelect from "@/components/inputs/ModelSelect.vue";

const props = defineProps({
    amountFor: {type: String, required: true}
})

const properties = defineModel<Property[]>({required: true})

/**
 * remove a property from the list
 * @param property property to delete
 */
function deleteProperty(property: Property) {
    properties.value = properties.value.filter(p => p !== property)
    // TODO delete from DB, needs endpoint for property relation to either recipe or food
}

/**
 * load list of property types from server and add all types that are not yet
 * in the list to the list
 */
function addAllProperties() {
    const api = new ApiApi()
    api.apiPropertyTypeList().then(r => {
        r.results.forEach(pt => {
            if (properties.value.findIndex(x => x.propertyType.name == pt.name) == -1) {
                properties.value.push({propertyAmount: 0, propertyType: pt} as Property)
            }
        })
    })
}


</script>

<style scoped>

</style>