<template>

    <v-dialog v-model="dialog" activator="parent" style="max-width: 75vw;">
        <v-card>

            <v-closable-card-title :title="$t('Export')" v-model="dialog"></v-closable-card-title>
            <v-card-text>
                <v-row>
                    <v-col>

                        <v-btn-toggle border divided v-model="mode">
                            <v-btn value="md_list"><i class="fa-solid fa-list-check"></i></v-btn>
                            <v-btn value="md_table"><i class="fa-solid fa-table-cells"></i></v-btn>
                            <v-btn value="csv"><i class="fa-solid fa-file-csv"></i></v-btn>
                        </v-btn-toggle>
                    </v-col>
                </v-row>

                <v-row>
                    <v-col>
                        <v-text-field :label="$t('csv_delim_label')" :hint="$t('csv_delim_help')" persistent-hint
                                      v-model="useUserPreferenceStore().userSettings.csvDelim"></v-text-field>

                    </v-col>
                    <v-col>
                        <v-text-field :label="$t('csv_prefix_label')" :hint="$t('csv_prefix_help')" persistent-hint
                                      v-model="useUserPreferenceStore().userSettings.csvPrefix"></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-textarea :model-value="exportText" auto-grow max-rows="25" readonly>

                        </v-textarea>
                    </v-col>
                </v-row>
                <btn-copy class="float-right" :copy-value="exportText"></btn-copy>
            </v-card-text>
            <v-card-actions>
                <v-btn @click="downloadExport()" prepend-icon="fa-solid fa-download">{{ $t('Download') }}</v-btn>
                <v-btn @click="copy(exportText)" prepend-icon="$copy">{{ $t('Copy') }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

</template>

<script setup lang="ts">

import VClosableCardTitle from "@/components/dialogs/VClosableCardTitle.vue";
import {computed, ref} from "vue";
import {useShoppingStore} from "@/stores/ShoppingStore.ts";
import {isEntryVisible, isShoppingCategoryVisible, isShoppingListFoodVisible} from "@/utils/logic_utils.ts";
import {useI18n} from "vue-i18n";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore.ts";
import {ShoppingListEntry} from "@/openapi";
import BtnCopy from "@/components/buttons/BtnCopy.vue";
import {useClipboard} from "@vueuse/core";

const {t} = useI18n()
const {copy} = useClipboard()

const dialog = defineModel<boolean>()
const mode = ref<'md_list' | 'md_table' | 'csv'>('md_list')

/**
 * shorthand for csvDelim user preference
 */
const csvDelim = computed(() => {
    return useUserPreferenceStore().userSettings.csvDelim
})

/**
 * compute the export text
 */
const exportText = computed(() => {
    let textArray: string[] = []

    textArray.push(formatHeader())

    useShoppingStore().getEntriesByGroup.forEach(category => {
        if (isShoppingCategoryVisible(category)) {
            if (category.name === useShoppingStore().UNDEFINED_CATEGORY) {
                textArray.push(formatCategory(t('NoCategory')))
            } else {
                textArray.push(formatCategory(category.name))
            }

            category.foods.forEach(food => {
                if (isShoppingListFoodVisible(food, useUserPreferenceStore().deviceSettings)) {
                    food.entries.forEach(entry => {
                        if (isEntryVisible(entry, useUserPreferenceStore().deviceSettings)) {
                            textArray.push(formatEntry(entry))
                        }
                    })
                }
            })
        }
    })

    // delete first two empty lines in md list
    if (mode.value == 'md_list') {
        textArray.splice(0, 2)
    }

    return textArray.join('\n')
})

/**
 * create the header for the exported list depending on the mode
 */
function formatHeader() {
    if (mode.value == 'md_list') {
        return ''
    } else if (mode.value == 'md_table') {
        return `|${t('Amount')}|${t('Unit')}|${t('Food')}|\n|-|-|-|`
    } else if (mode.value == 'csv') {
        return `${t('Amount')} ${csvDelim.value} ${t('Unit')} ${csvDelim.value} ${t('Food')}`
    }
    return ''
}

/**
 * format category lines depending on the mode
 * @param categoryName name of the category
 */
function formatCategory(categoryName: string) {
    if (mode.value == 'md_list') {
        return `\n${categoryName}`
    } else if (mode.value == 'md_table') {
        return `|${categoryName}|`
    } else if (mode.value == 'csv') {
        return `${categoryName}${csvDelim.value}${csvDelim.value}`
    }
    return ''
}

/**
 * format the shopping list entry according to the selected mode
 * @param entry
 */
function formatEntry(entry: ShoppingListEntry) {
    if (mode.value == 'md_list') {
        return `${useUserPreferenceStore().userSettings.csvPrefix} ${entry.amount} ${entry.unit?.name} ${entry.food?.name}`
    } else if (mode.value == 'md_table') {
        return `|${entry.amount}|${entry.unit?.name}|${entry.food?.name}|`
    } else if (mode.value == 'csv') {
        return `${entry.amount}${csvDelim.value}${entry.unit?.name}${csvDelim.value}${entry.food?.name}`
    }
    return ''
}

/**
 * encode the exportText into a URI and trigger browser to download the export as a file
 */
function downloadExport() {
    let data = encodeURI("data:text/text;charset=utf-8," + exportText.value)
    let link = document.createElement("a")
    link.setAttribute("href", data)

    if (mode.value == 'md_list' || mode.value == 'md_table') {
        link.setAttribute("download", `${t('Shopping_list')}.md`)
    } else if (mode.value == 'csv') {
        link.setAttribute("download", `${t('Shopping_list')}.csv`)
    }
    link.click()
}

</script>

<style scoped>

</style>