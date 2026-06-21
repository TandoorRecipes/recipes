<template>
    <v-dialog max-width="900" v-model="dialog" activator="model">
        <v-card>

            <v-closable-card-title v-model="dialog" icon="fas fa-jar" :title="dialogTitle"></v-closable-card-title>

            <v-card-text>

                <v-row v-if="['add','remove','move'].includes(bookingMode)">
                    <v-col>
                        <v-form>
                            <model-select model="InventoryEntry" v-model="inventoryEntry" v-if="['remove','move'].includes(bookingMode)"
                                          @update:modelValue="inventoryEntrySelected()">
                            </model-select>

                            <model-select model="Food" allow-create v-model="food" v-if="['add'].includes(bookingMode)"></model-select>

                            <model-select model="InventoryLocation" v-model="inventoryLocation" v-if="['add','move'].includes(bookingMode)">
                                <template #append>
                                    <v-btn icon>
                                        <v-icon icon="$create"></v-icon>
                                        <model-edit-dialog model="InventoryLocation" @create="args => inventoryLocation = args"></model-edit-dialog>
                                    </v-btn>
                                </template>
                            </model-select>

                            <v-number-input :label="$t('Amount')" :precision="2" v-model="amount" v-if="['add', 'remove'].includes(bookingMode)"></v-number-input>
                            <model-select model="Unit" allow-create v-model="unit" v-if="['add'].includes(bookingMode)"></model-select>

                            <v-date-input :label="$t('Expires')" v-model="expires" v-if="['add'].includes(bookingMode)">
                                <template #append-inner>
                                    <v-btn variant="text" @click.stop="freezerExpiryDialog = true">
                                        <v-icon icon="fa-solid fa-snowflake"></v-icon>
                                        <freezer-expiry-dialog v-model:date="expires" v-model="freezerExpiryDialog"></freezer-expiry-dialog>
                                    </v-btn>
                                </template>
                            </v-date-input>

                            <v-text-field :label="$t('SubLocation')" :hint="$t('SubLocationHelp')" v-model="subLocation" v-if="['add','move'].includes(bookingMode)"></v-text-field>

                            <closable-help-alert :text="$t('CodeHelp')" class="mb-2"></closable-help-alert>
                            <v-text-field :label="$t('Code')" v-model="code" v-if="['add'].includes(bookingMode)"></v-text-field>

                            <v-btn block @click="save" prepend-icon="$save" color="save">{{ $t('Save') }}</v-btn>
                        </v-form>
                    </v-col>
                </v-row>
                <v-row v-if="['confirm'].includes(bookingMode) && bookingConfirmEntry != null">
                    <v-col>

                        <v-card variant="outlined">
                            <v-card-text>
                                <p>
                                    {{ ingredientToString({food: bookingConfirmEntry.food, unit: bookingConfirmEntry.unit, amount: bookingConfirmEntry.amount} as Ingredient) }}
                                </p>

                                <p class="text-disabled mt-4">{{ $t('Code') }}</p>
                                <p class="text-h3 text-pre">
                                    #{{ bookingConfirmEntry.code }}
                                </p>

                                <template v-if="bookingConfirmEntry.expires">
                                    <p class="text-disabled mt-4">{{ $t('Expires') }}</p>
                                    <p>
                                        <v-chip label :color="(bookingConfirmEntry.expires < DateTime.now() ? 'error' : 'success')">
                                            {{ DateTime.fromJSDate(bookingConfirmEntry.expires).toLocaleString(DateTime.DATE_MED) }}
                                        </v-chip>
                                    </p>
                                </template>

                            </v-card-text>
                        </v-card>

                        <p class="mt-10">

                            <v-select
                                v-model="selectedCopyOptions"
                                chips
                                :label="$t('Copy')"
                                :items="copyOptions"
                                multiple
                                hide-details
                            >
                            </v-select>
                            <v-btn class="" block color="success" prepend-icon="$copy" @click="copyConfirmEntry">{{ $t('Copy') }}</v-btn>
                            <v-btn class="mt-4" block color="info" prepend-icon="$close" @click="dialog = false; resetForm();">{{ $t('Close') }}</v-btn>

                        </p>

                    </v-col>
                </v-row>
            </v-card-text>

        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">

import VClosableCardTitle from "@/components/dialogs/VClosableCardTitle.vue";
import {TInventoryLocation} from "@/types/Models.ts";
import {DateTime} from "luxon";
import {ingredientToString} from "@/utils/model_utils.ts";
import {ApiApi, ApiInventoryEntryListRequest, Food, Ingredient, InventoryEntry, InventoryLocation, Unit} from "@/openapi";
import FreezerExpiryDialog from "@/components/dialogs/FreezerExpiryDialog.vue";
import ClosableHelpAlert from "@/components/display/ClosableHelpAlert.vue";
import {VDateInput} from "vuetify/labs/VDateInput";
import ModelEditDialog from "@/components/dialogs/ModelEditDialog.vue";
import ModelSelect from "@/components/inputs/ModelSelect.vue";
import {useI18n} from "vue-i18n";
import {computed, onMounted, ref, watch} from "vue";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore.ts";
import {ErrorMessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore.ts";
import {VDataTableUpdateOptions} from "@/vuetify.ts";

const emits = defineEmits(['update'])

const dialog = defineModel<boolean>()
const props = defineProps<{
    bookingMode: string,
    inventoryEntryId?: number,
}>()

const {t} = useI18n()

// form
const formLoading = ref(false)
const freezerExpiryDialog = ref(false)

const bookingMode = ref('add')
const food = ref<Food | null>(null)
const inventoryEntry = ref<InventoryEntry | null>(null)
const inventoryLocation = ref<InventoryLocation | null>(null)
const subLocation = ref<string | undefined>('')
const code = ref('')
const amount = ref<number | undefined>(1)
const unit = ref<Unit | undefined | null>(useUserPreferenceStore().defaultUnitObj)
const expires = ref<Date | undefined>(undefined)

const bookingConfirmEntry = ref<InventoryEntry | null>(null)

const copyOptions = [
    {value: 'food', title: t('Food')},
    {value: 'inventoryLocation', title: t('InventoryLocation')},
    {value: 'amount', title: t('Amount')},
    {value: 'unit', title: t('Unit')},
    {value: 'expires', title: t('Expires')},
    {value: 'subLocation', title: t('SubLocation')},
]

const selectedCopyOptions = ref<string[]>(['food', 'inventoryLocation', 'amount', 'unit', 'expires', 'subLocation'])

const dialogTitle = computed(() => {
    if (bookingMode.value == 'add') {
        return t('Add')
    } else if (bookingMode.value == 'remove') {
        return t('Remove')
    } else if (bookingMode.value == 'move') {
        return t('Move')
    } else if (bookingMode.value == 'confirm') {
        return t('Confirm')
    } else {
        return t('Error')
    }
})

watch(dialog, (newValue, oldValue) => {
    if (!newValue) {
        resetForm()
    } else {
        bookingMode.value = props.bookingMode

        if (props.inventoryEntryId) {
            let api = new ApiApi()
            api.apiInventoryEntryRetrieve({id: props.inventoryEntryId}).then(r => {
                inventoryEntry.value = r
                inventoryEntrySelected()
            })
        }
    }
})

onMounted(() => {
    bookingMode.value = props.bookingMode

    if (props.inventoryEntryId) {
        let api = new ApiApi()
        api.apiInventoryEntryRetrieve({id: props.inventoryEntryId}).then(r => {
            inventoryEntry.value = r
            inventoryEntrySelected()
        })
    }
})

/**
 * save form depending on selected booking mode
 */
function save() {
    if (bookingMode.value == 'add') {
        addInventory()
    } else if (bookingMode.value == 'remove') {
        removeInventory()
    } else if (bookingMode.value == 'move') {
        moveInventory()
    }

}

/**
 * add new inventory entry
 */
function addInventory() {
    let api = new ApiApi()
    formLoading.value = true

    // set time to noon because ISO string conversion might shift dates instead of just cutting of time
    if (expires.value) {
        expires.value.setHours(12, 0, 0, 0)
    }

    let inventoryEntry = {
        food: food.value,
        inventoryLocation: inventoryLocation.value,
        subLocation: subLocation.value,
        amount: amount.value,
        unit: unit.value,
        expires: expires.value,
        code: code.value,
    } as InventoryEntry

    api.apiInventoryEntryCreate({inventoryEntry: inventoryEntry}).then(r => {
        useMessageStore().addPreparedMessage(PreparedMessage.CREATE_SUCCESS)
        bookingConfirmEntry.value = r
        bookingMode.value = 'confirm'
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
    }).finally(() => {
        formLoading.value = false
        emits('update')
    })
}

/**
 * subtract amount from inventory entry and save to DB
 */
function removeInventory() {
    let api = new ApiApi()

    if (inventoryEntry.value != null) {
        formLoading.value = true

        if (inventoryEntry.value.amount != undefined && amount.value != undefined) {
            inventoryEntry.value.amount = Math.max(inventoryEntry.value.amount - amount.value, 0)
        }

        api.apiInventoryEntryUpdate({id: inventoryEntry.value.id!, inventoryEntry: inventoryEntry.value}).then(r => {
            useMessageStore().addPreparedMessage(PreparedMessage.UPDATE_SUCCESS)
            if (inventoryEntry.value && inventoryEntry.value.amount == 0) {
                bookingMode.value = 'add'
                resetForm(true, true)
            } else {
                inventoryEntrySelected()
            }
        }).catch(err => {
            useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
        }).finally(() => {
            formLoading.value = false
            dialog.value = false
            emits('update')
        })
    }
}

function moveInventory() {
    let api = new ApiApi()

    if (inventoryEntry.value != null) {
        formLoading.value = true
        let changed = false

        if (inventoryLocation.value != null && inventoryEntry.value.inventoryLocation != inventoryLocation.value) {
            inventoryEntry.value.inventoryLocation = inventoryLocation.value
            changed = true
        }
        if (subLocation.value != null && inventoryEntry.value.subLocation != subLocation.value) {
            inventoryEntry.value.subLocation = subLocation.value
            changed = true
        }

        if (changed) {
            api.apiInventoryEntryUpdate({id: inventoryEntry.value.id!, inventoryEntry: inventoryEntry.value}).then(r => {
                useMessageStore().addPreparedMessage(PreparedMessage.UPDATE_SUCCESS)
                inventoryEntrySelected()
            }).catch(err => {
                useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
            }).finally(() => {
                formLoading.value = false
                dialog.value = false
                emits('update')
            })
        } else {
            formLoading.value = false
            dialog.value = false
        }

    }
}


/**
 * reset form to default values
 */
function resetForm() {
    food.value = null
    inventoryLocation.value = null
    inventoryEntry.value = null
    subLocation.value = ''
    amount.value = 1
    unit.value = useUserPreferenceStore().defaultUnitObj
    expires.value = undefined
    code.value = ''
}

/**
 * when an inventory entry is selected, fill form with values from inventory entry
 */
function inventoryEntrySelected() {
    if (inventoryEntry.value) {
        food.value = inventoryEntry.value.food
        unit.value = inventoryEntry.value.unit
        //inventoryLocation.value = inventoryEntry.value.inventoryLocation
        //subLocation.value = inventoryEntry.value.subLocation
        amount.value = inventoryEntry.value.amount
        //expires.value = inventoryEntry.value.expires
    }
}

/**
 * function to copy selected fields from booking confirm entry to form
 */
function copyConfirmEntry() {
    resetForm()

    if (bookingConfirmEntry.value == null) {
        return;
    }
    if (selectedCopyOptions.value.includes('food')) {
        food.value = bookingConfirmEntry.value.food
    }
    if (selectedCopyOptions.value.includes('inventoryLocation')) {
        inventoryLocation.value = bookingConfirmEntry.value.inventoryLocation
    }
    if (selectedCopyOptions.value.includes('amount')) {
        amount.value = bookingConfirmEntry.value.amount
    }
    if (selectedCopyOptions.value.includes('unit')) {
        unit.value = bookingConfirmEntry.value.unit
    }
    if (selectedCopyOptions.value.includes('expires')) {
        expires.value = bookingConfirmEntry.value.expires
    }
    if (selectedCopyOptions.value.includes('subLocation')) {
        subLocation.value = bookingConfirmEntry.value.subLocation
    }

    bookingMode.value = 'add'
}


</script>

<style scoped>

</style>