<template>
    <v-dialog max-width="600" activator="parent" v-model="dialog">
        <supermarket-category-editor :item="item" @create="createEvent" @save="saveEvent" @delete="deleteEvent" dialog @close="dialog = false" v-if="model == 'SupermarketCategory'"></supermarket-category-editor>
        <unit-conversion-editor :item="item" @create="createEvent" @save="saveEvent" @delete="deleteEvent" dialog @close="dialog = false" v-if="model == 'UnitConversion'" :disabled-fields="disabledFields"></unit-conversion-editor>
        <property-type-editor :item="item" @create="createEvent" @save="saveEvent" @delete="deleteEvent" dialog @close="dialog = false" v-if="model == 'PropertyType'" :disabled-fields="disabledFields"></property-type-editor>
        <access-token-editor :item="item" @create="createEvent" @save="saveEvent" @delete="deleteEvent" dialog @close="dialog = false" v-if="model == 'AccessToken'"></access-token-editor>
        <invite-link-editor :item="item" @create="createEvent" @save="saveEvent" @delete="deleteEvent" dialog @close="dialog = false" v-if="model == 'InviteLink'"></invite-link-editor>
        <supermarket-editor :item="item" @create="createEvent" @save="saveEvent" @delete="deleteEvent" dialog @close="dialog = false" v-if="model == 'Supermarket'"></supermarket-editor>
        <automation-editor :item="item" @create="createEvent" @save="saveEvent" @delete="deleteEvent" dialog @close="dialog = false" v-if="model == 'Automation'"></automation-editor>
        <user-space-editor :item="item" @create="createEvent" @save="saveEvent" @delete="deleteEvent" dialog @close="dialog = false" v-if="model == 'UserSpace'"></user-space-editor>
        <meal-type-editor :item="item" @create="createEvent" @save="saveEvent" @delete="deleteEvent" dialog @close="dialog = false" v-if="model == 'MealType'"></meal-type-editor>
        <property-editor :item="item" @create="createEvent" @save="saveEvent" @delete="deleteEvent" dialog @close="dialog = false" v-if="model == 'Property'"></property-editor>
        <food-editor :item="item" @create="createEvent" @save="saveEvent" @delete="deleteEvent" dialog @close="dialog = false" v-if="model == 'Food'"></food-editor>
    </v-dialog>
</template>

<script setup lang="ts">


import {PropType, ref} from "vue";
import AccessTokenEditor from "@/components/model_editors/AccessTokenEditor.vue";
import {AccessToken, Food} from "@/openapi";
import InviteLinkEditor from "@/components/model_editors/InviteLinkEditor.vue";
import UserSpaceEditor from "@/components/model_editors/UserSpaceEditor.vue";
import MealTypeEditor from "@/components/model_editors/MealTypeEditor.vue";
import PropertyEditor from "@/components/model_editors/PropertyEditor.vue";
import UnitConversionEditor from "@/components/model_editors/UnitConversionEditor.vue";
import FoodEditor from "@/components/model_editors/FoodEditor.vue";
import SupermarketEditor from "@/components/model_editors/SupermarketEditor.vue";
import SupermarketCategoryEditor from "@/components/model_editors/SupermarketCategoryEditor.vue";
import PropertyTypeEditor from "@/components/model_editors/PropertyTypeEditor.vue";
import AutomationEditor from "@/components/model_editors/AutomationEditor.vue";

const emit = defineEmits(['create', 'save', 'delete'])

const props = defineProps({
    model: {
        type: String as PropType<'UnitConversion' | 'AccessToken'| 'InviteLink' | 'UserSpace' | 'MealType' | 'Property' | 'Food' | 'Supermarket' | 'SupermarketCategory' | 'PropertyType' | 'Automation'>,
        required: true,
    },
    item: {default: null},
    disabledFields: {default: []},
    closeAfterCreate: {default: true},
    closeAfterSave: {default: true},
    closeAfterDelete: {default: true},
})

const dialog = ref(false)

function createEvent(arg: any) {
    emit('create', arg)
    dialog.value = dialog.value && !props.closeAfterCreate
}

function saveEvent(arg: any) {
    emit('save', arg)
    dialog.value = dialog.value && !props.closeAfterSave
}

function deleteEvent(arg: any) {
    emit('delete', arg)
    dialog.value = dialog.value && !props.closeAfterDelete
}

</script>

<style scoped>

</style>