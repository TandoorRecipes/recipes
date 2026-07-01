<template>
    <v-table v-if="!mobile" density="compact" class="ingredient-table">
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
                                <v-icon v-else-if="i.food.substituteOnhand" icon="fa-solid fa-right-left" color="success" size="x-small" class="ml-1" :aria-label="substituteLabel(i)"></v-icon>
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
                    <td v-if="showActions" style="width: 1%; text-wrap: nowrap">
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

    <!-- Mobile (Option C): list-item rows that grow DOWN — never clip; kebab always reachable -->
    <v-list v-else class="ingredient-list bg-transparent pa-0" density="compact">
        <template v-for="(i, idx) in ingredients" :key="i.id">
            <v-list-subheader v-if="i.isHeader" class="font-weight-bold">{{ i.note }}</v-list-subheader>
            <v-list-item v-else data-test="ingredient-item" class="px-1" @click="i.checked = !i.checked">
                <template #prepend v-if="showCheckbox">
                    <v-checkbox-btn v-model="i.checked" color="success" density="compact" @click.stop></v-checkbox-btn>
                </template>
                <v-list-item-title>
                    <span v-if="!i.noAmount && i.amount != 0" class="text-medium-emphasis text-no-wrap mr-2"><span v-html="calculateFoodAmount(i.amount, props.ingredientFactor, useUserPreferenceStore().userSettings.useFractions)"></span><span v-if="i.unit" class="ms-2">{{ ingredientToUnitString(i, ingredientFactor) }}</span></span><wbr>
                    <template v-if="i.food">
                        <router-link v-if="i.food.recipe" :to="{name: 'RecipeViewPage', params: {id: i.food.recipe.id}}" @click.stop>{{ ingredientToFoodString(i, ingredientFactor) }}</router-link>
                        <a v-else-if="i.food.url" :href="i.food.url" target="_blank" @click.stop>{{ ingredientToFoodString(i, ingredientFactor) }}</a>
                        <span v-else>{{ ingredientToFoodString(i, ingredientFactor) }}</span>
                    </template>
                    <template v-if="mobileStatus && i.food">
                        <v-icon v-if="isOnHand(i)" icon="fa-solid fa-clipboard-check" color="success" size="x-small" class="ml-1" :aria-label="$t('OnHand')"></v-icon>
                        <v-icon v-if="isOnShoppingList(i)" icon="fa-solid fa-cart-shopping" color="success" size="x-small" class="ml-1" :aria-label="$t('Shopping')"></v-icon>
                        <v-icon v-if="i.food.ignoreShopping" icon="fa-solid fa-ban" color="warning" size="x-small" class="ml-1" :aria-label="$t('IgnoreShopping')"></v-icon>
                    </template>
                </v-list-item-title>
                <v-list-item-subtitle v-if="hasContinuationLine(i)" class="mt-1">
                    <span v-if="hasNote(i) && notesDisplay === 'inline'" class="font-italic">— {{ i.note }}</span>
                    <span v-else-if="hasNote(i) && notesDisplay === 'truncate'" data-test="ingredient-note" class="font-italic" style="cursor: pointer;" @click.stop="toggleNoteExpand(idx)">— {{ expandedNotes[idx] ? i.note : truncateNote(i.note) }}</span>
                    <v-chip v-if="mobileStatus && !isOnHand(i) && substituteChip(i)" data-test="ingredient-substitute"
                            size="x-small" label class="ml-1" variant="tonal" color="success"
                            prepend-icon="fa-solid fa-right-left">
                        {{ substituteChip(i)!.name }}<span v-if="substituteChip(i)!.extra > 0" class="ms-1">+{{ substituteChip(i)!.extra }}</span>
                    </v-chip>
                </v-list-item-subtitle>
                <template #append>
                    <v-icon v-if="hasNote(i) && notesDisplay === 'bubble' && !useUserPreferenceStore().isPrintMode" class="far fa-comment" size="small" @click.stop="openNoteIdx = openNoteIdx === idx ? null : idx">
                        <v-tooltip :model-value="openNoteIdx === idx" activator="parent" location="start" :open-on-hover="false" :open-on-click="false">{{ i.note }}</v-tooltip>
                    </v-icon>
                    <IngredientContextMenu v-if="showActions && i.food" :ingredient="i" :ingredient-factor="ingredientFactor" @scale="(factor: number) => emit('scale', factor)" />
                </template>
            </v-list-item>
        </template>
    </v-list>

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

// Status indicators on the mobile list layout (desktop uses showInlineStatus above).
const mobileStatus = computed(() =>
    mobile.value && (props.context === 'overview'
        ? deviceSettings.recipe_overviewInlineStatus
        : deviceSettings.recipe_stepInlineStatus)
)

// The chip surfaces only the food's on-hand / in-pantry substitutes
// (availableSubstitutes — the serializer fills it from on-hand OR pantry).
// Substitutes that are merely *defined* but not available are intentionally
// not shown (showing them would advertise substitutes you don't have).
function substituteChip(i: Ingredient): {name: string, extra: number} | null {
    const subs = i.food?.availableSubstitutes ?? []
    if (!subs.length) return null
    return {name: subs[0].name ?? '', extra: subs.length - 1}
}

// Whether the mobile row needs a second (continuation) line for note and/or chip.
function hasContinuationLine(i: Ingredient): boolean {
    const noteLine = hasNote(i) && (notesDisplay.value === 'inline' || notesDisplay.value === 'truncate')
    const subChip = mobileStatus.value && !isOnHand(i) && !!substituteChip(i)
    return noteLine || subChip
}

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

<style scoped>
/*
 * Option-C mobile rows must let the ingredient name wrap and grow DOWN so it
 * never clips. Vuetify's `.v-list-item-title` / `-subtitle` default to
 * white-space:nowrap + ellipsis, and the `.text-wrap` utility class is NOT
 * shipped in our built bundle (tree-shaken), so we enforce wrapping here.
 */
.ingredient-list :deep(.v-list-item-title),
.ingredient-list :deep(.v-list-item-subtitle) {
    white-space: normal;
    overflow: visible;
    -webkit-line-clamp: unset;
    /* Wrap only at word boundaries — never split a word mid-character, even when
     * a long no-wrap quantity leaves little room on the first line. */
    overflow-wrap: normal;
    word-break: normal;
}

/* Top-align the checkbox / kebab with the ingredient's first line so they
 * don't float to the vertical centre of a tall, multi-line row. Vuetify sets
 * align-self:center on these slots, so we override the slots directly. */
.ingredient-list :deep(.v-list-item__prepend),
.ingredient-list :deep(.v-list-item__append) {
    align-self: flex-start;
}

/* A little breathing room between the checkbox and the quantity/name. */
.ingredient-list :deep(.v-list-item__prepend) {
    margin-inline-end: 8px;
}
</style>

