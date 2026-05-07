<template>
    <v-table density="compact" class="ingredient-table">
        <tbody>
        <template v-for="(i, idx) in ingredients" :key="i.id">
            <tr @click="i.checked = !i.checked">
                <template v-if="i.isHeader">
                    <td colspan="5" class="font-weight-bold">{{ i.note }}</td>
                </template>
                <template v-else>
                    <td style="width: 1%; text-wrap: nowrap" class="pa-0 d-print-none" v-if="showCheckbox">
                        <v-checkbox-btn v-model="i.checked" color="success" v-if="!i.isHeader"></v-checkbox-btn>
                    </td>
                    <!-- display calculated food amount or empty cell -->
                    <td style="width: 1%; text-wrap: nowrap"
                        class="pr-1"
                        v-html="calculateFoodAmount(i.amount, props.ingredientFactor, useUserPreferenceStore().userSettings.useFractions)"
                        v-if="!i.noAmount && i.amount != 0">
                    </td>
                    <td style="width: 1%; text-wrap: nowrap" class="pr-1" v-else></td>

                    <td style="width: 1%; text-wrap: nowrap" class="pr-1">
                        <template v-if="i.unit && !i.noAmount && i.amount != 0"> {{ ingredientToUnitString(i, ingredientFactor) }}</template>
                    </td>
                    <td>
                        <template v-if="i.food">
                            <router-link v-if="i.food.recipe" :to="{name: 'RecipeViewPage', params: {id: i.food.recipe.id}}">
                                {{ ingredientToFoodString(i, ingredientFactor) }}
                            </router-link>
                            <a v-else-if="i.food.url" :href="i.food.url" target="_blank">{{ ingredientToFoodString(i, ingredientFactor) }}</a>
                            <span v-else>{{ ingredientToFoodString(i, ingredientFactor) }}</span>

                            <template v-if="showInlineStatus">
                                <v-icon v-if="isOnHand(i)" icon="fa-solid fa-clipboard-check" color="success" size="x-small" class="ml-1" :aria-label="$t('OnHand')"></v-icon>
                                <v-icon v-else-if="i.food.substituteOnhand" icon="fa-solid fa-right-left" color="warning" size="x-small" class="ml-1" :aria-label="substituteLabel(i)"></v-icon>
                                <v-icon v-if="isOnShoppingList(i)" icon="fa-solid fa-cart-shopping" color="success" size="x-small" class="ml-1" :aria-label="$t('Shopping')"></v-icon>
                                <v-icon v-if="i.food.ignoreShopping" icon="fa-solid fa-ban" color="warning" size="x-small" class="ml-1" :aria-label="$t('IgnoreShopping')"></v-icon>
                                <span v-if="!isOnHand(i) && i.food.availableSubstitutes?.length && !mobile" class="text-caption text-medium-emphasis ml-1">
                                    ({{ substituteText(i) }})
                                </span>
                            </template>
                        </template>
                        <span v-if="hasNote(i) && notesDisplay === 'inline'" class="text-disabled font-italic ml-1">— {{ i.note }}</span>
                        <span v-if="hasNote(i) && notesDisplay === 'truncate'" class="text-disabled font-italic ml-1" style="cursor: pointer;"
                              @click.stop="toggleNoteExpand(idx)">—
                            {{ expandedNotes[idx] ? i.note : truncateNote(i.note, inlineSubstituteLength(i)) }}
                        </span>
                    </td>
                    <td v-if="useUserPreferenceStore().isPrintMode">
                        <span class="text-disabled font-italic"> {{ i.note }}</span>
                    </td>
                    <td style="width: 1%; text-wrap: nowrap" v-if="!useUserPreferenceStore().isPrintMode">
                        <v-icon class="far fa-comment float-right"
                                v-if="hasNote(i) && notesDisplay === 'bubble'"
                                @click.stop="openNoteIdx = openNoteIdx === idx ? null : idx">
                            <v-tooltip :model-value="openNoteIdx === idx" activator="parent" location="start"
                                       :open-on-hover="false" :open-on-click="false">{{ i.note }}</v-tooltip>
                        </v-icon>
                    </td>
                    <td v-if="showActions && mobile" style="width: 1%; text-wrap: nowrap; padding-left: 0; padding-right: 4px;">
                        <IngredientContextMenu
                            v-if="!i.isHeader && i.food"
                            :ingredient="i"
                            :ingredient-factor="ingredientFactor"
                            @scale="(factor: number) => emit('scale', factor)"
                        />
                    </td>
                    <td v-if="showActions && !mobile" style="width: 1%; text-wrap: nowrap">
                        <IngredientContextMenu
                            v-if="!i.isHeader && i.food"
                            :ingredient="i"
                            :ingredient-factor="ingredientFactor"
                            @scale="(factor: number) => emit('scale', factor)"
                        />
                    </td>
                </template>
            </tr>
        </template>
        </tbody>
    </v-table>

</template>

<script lang="ts" setup>
import {computed, reactive, ref} from 'vue'
import {Ingredient} from "@/openapi";
import {calculateFoodAmount} from "../../utils/number_utils";
import {useUserPreferenceStore} from "../../stores/UserPreferenceStore";
import {ingredientToFoodString, ingredientToUnitString} from "@/utils/model_utils.ts";
import IngredientContextMenu from "@/components/inputs/IngredientContextMenu.vue";
import {useDisplay} from "vuetify";

const emit = defineEmits(['scale'])
const {mobile} = useDisplay()

const props = defineProps({
    showNotes: {
        type: Boolean,
        default: true
    },
    ingredientFactor: {
        type: Number,
        required: true,
    },
    showCheckbox: {
        type: Boolean,
        default: true
    },
    showActions: {
        type: Boolean,
        default: false
    },
    context: {
        type: String as () => 'overview' | 'step',
        default: 'step'
    },
})

const ingredients = defineModel<Ingredient[]>({required: true})

const openNoteIdx = ref<number | null>(null)
const expandedNotes = reactive<Record<number, boolean>>({})

const deviceSettings = useUserPreferenceStore().deviceSettings

const showInlineStatus = computed(() =>
    !mobile.value && (props.context === 'overview'
        ? deviceSettings.recipe_overviewInlineStatus
        : deviceSettings.recipe_stepInlineStatus)
)

const notesDisplay = computed(() =>
    props.context === 'overview'
        ? deviceSettings.recipe_overviewNotesDisplay
        : deviceSettings.recipe_stepNotesDisplay
)

function toggleNoteExpand(idx: number) {
    expandedNotes[idx] = !expandedNotes[idx]
}

function hasNote(i: Ingredient): boolean {
    return i.note != null && i.note !== ''
}

function truncateNote(note: string | undefined, reserved: number = 0): string {
    if (!note) return ''
    const max = deviceSettings.recipe_notesTruncateLength || 30
    const budget = Math.max(5, max - reserved)
    return note.length > budget ? note.substring(0, budget) + '...' : note
}

/** Matches FoodList.ts isInInventory pattern — annotation comes as "True"/"False" string */
function isOnHand(i: Ingredient): boolean {
    const inv = i.food?.inInventory
    if (inv === true || inv === 'True' || inv === 'true') return true
    return !!i.food?.foodOnhand
}

function isOnShoppingList(i: Ingredient): boolean {
    const s = i.food?.shopping
    return s === true || s === 'True' || s === 'true'
}

const substitutePickCache = new Map<number, string>()

function substituteText(i: Ingredient): string {
    const subs = i.food?.availableSubstitutes ?? []
    if (!subs.length) return ''
    const key = i.id as number | undefined
    if (key != null && substitutePickCache.has(key)) {
        return substitutePickCache.get(key)!
    }
    const pick = subs[Math.floor(Math.random() * subs.length)]?.name ?? ''
    if (key != null) substitutePickCache.set(key, pick)
    return pick
}

// Number of display characters the inline substitute block contributes when
// shown next to the note (" (name)" — leading space + parens + name). Used
// to shrink the truncate budget so the row stays within the user's limit.
function inlineSubstituteLength(i: Ingredient): number {
    if (isOnHand(i) || mobile.value) return 0
    const txt = substituteText(i)
    if (!txt) return 0
    return txt.length + 3
}

function substituteLabel(i: Ingredient): string {
    const subs = i.food?.availableSubstitutes ?? []
    if (subs.length) return `Substitute available: ${subs.map(s => s.name).join(', ')}`
    return 'Substitute available'
}

</script>

