<template>
    <v-btn density="compact" variant="plain" @click.stop="" icon :color="triggerColor" :aria-label="$t('IngredientMenu')">
        <v-icon icon="fa-solid fa-ellipsis-v"></v-icon>
        <v-menu activator="parent" :close-on-content-click="false" v-model="menuOpen">
            <v-list density="compact" min-width="220">
                <!-- Shopping List toggle -->
                <v-list-item prepend-icon="$shopping" @click="toggleShopping">
                    <v-list-item-title>{{ $t('Shopping') }}</v-list-item-title>
                    <template #append>
                        <v-progress-circular v-if="shoppingStatus === null" indeterminate size="16" width="2" class="ml-2"></v-progress-circular>
                        <v-icon v-else-if="shoppingStatus" icon="fa-solid fa-check" color="success" size="small" class="ml-2"></v-icon>
                    </template>
                </v-list-item>

                <!-- Inventory toggle -->
                <v-list-item prepend-icon="$pantry" @click="toggleInventory">
                    <v-list-item-title>{{ $t('Pantry') }}</v-list-item-title>
                    <template #append>
                        <v-progress-circular v-if="inventoryStatus === null" indeterminate size="16" width="2" class="ml-2"></v-progress-circular>
                        <v-icon v-else-if="inventoryStatus" icon="fa-solid fa-check" color="success" size="small" class="ml-2"></v-icon>
                    </template>
                </v-list-item>

                <!-- Ignore Shopping toggle -->
                <v-list-item prepend-icon="fa-solid fa-ban" @click="toggleIgnoreShopping">
                    <v-list-item-title>{{ $t('IgnoreShopping') }}</v-list-item-title>
                    <template #append>
                        <v-icon v-if="localIgnoreShopping" icon="fa-solid fa-check" color="warning" size="small" class="ml-2"></v-icon>
                    </template>
                </v-list-item>

                <v-divider v-if="hasSubstitutes"></v-divider>

                <!-- Substitutes (onhand-only via food.availableSubstitutes) -->
                <v-list-item v-if="hasSubstitutes" @click="toggleSubstitutes">
                    <v-list-item-title>
                        {{ $t('Substitutes') }}
                        <span v-if="allSubstitutes.length">({{ allSubstitutes.length }})</span>
                    </v-list-item-title>
                    <template #prepend>
                        <v-icon :icon="substitutesExpanded ? 'fa-solid fa-chevron-down' : 'fa-solid fa-chevron-right'" size="small"></v-icon>
                    </template>
                    <template #append>
                        <v-icon icon="fa-solid fa-check" color="success" size="small"></v-icon>
                    </template>
                </v-list-item>
                <template v-if="substitutesExpanded">
                    <v-list-item v-for="sub in allSubstitutes" :key="sub.id" class="pl-8" density="compact">
                        <v-list-item-title class="text-body-2">{{ sub.name }}</v-list-item-title>
                    </v-list-item>
                </template>

                <v-divider></v-divider>

                <!-- Scale -->
                <v-list-item v-if="!ingredient.noAmount && ingredient.amount" prepend-icon="fa-solid fa-sort-numeric-up">
                    {{ $t('Scale') }}
                    <number-scaler-dialog :number="ingredient.amount * ingredientFactor"
                                          @confirm="(target: number) => emit('scale', target / ingredient.amount)"></number-scaler-dialog>
                </v-list-item>

                <v-divider></v-divider>

                <!-- Edit links -->
                <v-list-item v-if="ingredient.food" link :to="{name: 'ModelEditPage', params: { model: 'Food', id: ingredient.food.id}}" :prepend-icon="TFood.icon">
                    {{ $t('Food') }}
                </v-list-item>
                <v-list-item v-if="ingredient.unit" link :to="{name: 'ModelEditPage', params: { model: 'Unit', id: ingredient.unit.id}}" :prepend-icon="TUnit.icon">
                    {{ $t('Unit') }}
                </v-list-item>
            </v-list>
        </v-menu>
    </v-btn>

    <ActionConfirmDialog ref="confirmDialogRef" />
    <InventoryQuickAddDialog ref="inventoryDialogRef" />
</template>

<script lang="ts" setup>
import {ref, computed, watch} from 'vue'
import {useI18n} from 'vue-i18n'
import {ApiApi, type Ingredient} from '@/openapi'
import ActionConfirmDialog from '@/components/dialogs/ActionConfirmDialog.vue'
import InventoryQuickAddDialog from '@/components/dialogs/InventoryQuickAddDialog.vue'
import NumberScalerDialog from '@/components/inputs/NumberScalerDialog.vue'
import {TFood, TUnit} from '@/types/Models.ts'
import {ErrorMessageType, PreparedMessage, useMessageStore} from '@/stores/MessageStore.ts'
import {useShoppingActions} from '@/composables/useShoppingActions'
import {useInventoryActions} from '@/composables/useInventoryActions'
import {useUserPreferenceStore} from '@/stores/UserPreferenceStore'

const props = defineProps<{
    ingredient: Ingredient
    ingredientFactor: number
}>()

const emit = defineEmits<{
    scale: [factor: number]
}>()

const {t} = useI18n()
const {addToShopping, removeFromShopping, checkShoppingStatus} = useShoppingActions()
const {quickAddToInventory, removeFromInventory, checkInventoryStatus} = useInventoryActions()
const userPrefStore = useUserPreferenceStore()

const menuOpen = ref(false)
const shoppingStatus = ref<boolean | null>(null)
const inventoryStatus = ref<boolean | null>(null)
const localIgnoreShopping = ref(false)
const substitutesExpanded = ref(false)
const allSubstitutes = ref<Array<{id: number, name: string}>>([])
const loadingShopping = ref(false)
const loadingInventory = ref(false)
const loadingIgnore = ref(false)
const confirmDialogRef = ref<InstanceType<typeof ActionConfirmDialog> | null>(null)
const inventoryDialogRef = ref<InstanceType<typeof InventoryQuickAddDialog> | null>(null)

const triggerColor = computed(() => {
    const mode = userPrefStore.deviceSettings.recipe_contextMenuColor
    if (mode === 'never') return undefined
    const food = props.ingredient.food
    if (!food) return undefined

    if (mode === 'onhand') {
        // After menu interaction, local inventory status overrides stale API data
        if (inventoryStatus.value !== null) {
            return inventoryStatus.value ? 'success' : undefined
        }
        const inv = food.inInventory
        if (inv === true || inv === 'True' || inv === 'true') return 'success'
        if (food.foodOnhand) return 'success'
        if (food.substituteOnhand) return 'warning'
        return undefined
    }

    if (mode === 'shopping') {
        if (shoppingStatus.value !== null) {
            return shoppingStatus.value ? 'success' : undefined
        }
        const s = food.shopping
        if (s === true || s === 'True' || s === 'true') return 'success'
        return undefined
    }

    return undefined
})

const hasSubstitutes = computed(() => {
    const food = props.ingredient.food
    return (food?.availableSubstitutes?.length ?? 0) > 0
})

watch(menuOpen, (open) => {
    if (!open) return
    const foodId = props.ingredient.food?.id
    if (!foodId) return

    localIgnoreShopping.value = props.ingredient.food?.ignoreShopping ?? false
    substitutesExpanded.value = false
    allSubstitutes.value = []

    // Re-fetch but keep last known value (don't reset to null) so
    // triggerColor doesn't flash back to stale API data after actions
    checkShoppingStatus(foodId).then(v => { shoppingStatus.value = v })
    checkInventoryStatus(foodId).then(v => { inventoryStatus.value = v })
})

function toggleSubstitutes() {
    substitutesExpanded.value = !substitutesExpanded.value
    if (!substitutesExpanded.value) return
    // The onhand subset already rides on the serialized Food object
    // (FoodSerializer.get_available_substitutes) — no network call needed.
    allSubstitutes.value = (props.ingredient.food?.availableSubstitutes ?? []).map(s => ({id: s.id!, name: s.name!}))
}

async function toggleShopping() {
    const food = props.ingredient.food
    if (!food?.id || loadingShopping.value) return
    loadingShopping.value = true

    try {
        if (shoppingStatus.value) {
            const dialog = confirmDialogRef.value
            if (!dialog) return
            const removed = await removeFromShopping({id: food.id, name: food.name}, dialog, t)
            if (removed) {
                shoppingStatus.value = await checkShoppingStatus(food.id)
                food.shopping = shoppingStatus.value ? 'True' : 'False'
            }
        } else {
            await addToShopping(
                {id: food.id, name: food.name},
                props.ingredient.amount * props.ingredientFactor,
                props.ingredient.unit,
            )
            shoppingStatus.value = true
            food.shopping = 'True'
            useMessageStore().addPreparedMessage(PreparedMessage.CREATE_SUCCESS)
        }
    } catch (err) {
        useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
    } finally {
        loadingShopping.value = false
    }
}

async function toggleInventory() {
    const food = props.ingredient.food
    if (!food?.id || loadingInventory.value) return
    loadingInventory.value = true

    try {
        if (inventoryStatus.value) {
            const dialog = confirmDialogRef.value
            if (!dialog) return
            const removed = await removeFromInventory({id: food.id, name: food.name}, dialog, t)
            if (removed) {
                inventoryStatus.value = await checkInventoryStatus(food.id)
                food.inInventory = inventoryStatus.value ? 'True' : 'False'
                food.foodOnhand = inventoryStatus.value
            }
        } else {
            const dialog = inventoryDialogRef.value
            if (!dialog) return
            const added = await quickAddToInventory(
                {id: food.id, name: food.name},
                dialog, t,
                {amount: props.ingredient.amount * props.ingredientFactor, unit: props.ingredient.unit ?? null},
            )
            if (added) {
                inventoryStatus.value = true
                food.inInventory = 'True'
                food.foodOnhand = true
                useMessageStore().addPreparedMessage(PreparedMessage.CREATE_SUCCESS)
            }
        }
    } catch (err) {
        useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
    } finally {
        loadingInventory.value = false
    }
}

async function toggleIgnoreShopping() {
    const food = props.ingredient.food
    if (!food?.id || loadingIgnore.value) return
    loadingIgnore.value = true

    const newValue = !localIgnoreShopping.value
    try {
        await new ApiApi().apiFoodPartialUpdate({id: food.id, patchedFood: {ignoreShopping: newValue}})
        localIgnoreShopping.value = newValue
        food.ignoreShopping = newValue
    } catch (err) {
        useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
    } finally {
        loadingIgnore.value = false
    }
}
</script>
