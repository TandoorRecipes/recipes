<template>
    <!-- TODO label is not showing for some reason, for now in placeholder -->

    <v-label class="mt-2" v-if="props.label">{{ props.label }}</v-label>
    <v-input :hint="props.hint" persistent-hint :label="props.label" :hide-details="props.hideDetails">
        <template #prepend v-if="$slots.prepend">
            <slot name="prepend"></slot>
        </template>

        <!-- TODO resolve-on-load false for now, race condition with model class, make prop once better solution is found -->
        <Multiselect
            :ref="`ref_${props.id}`"
            class="material-multiselect "
            :class="{'model-select--density-compact': props.density == 'compact', 'model-select--density-comfortable': props.density == 'comfortable', 'model-select--density-default': props.density == ''}"
            :resolve-on-load="props.searchOnLoad"
            v-model="model"
            :options="search"
            :on-create="createObject"
            :createOption="props.allowCreate"
            :delay="300"
            :object="props.object"
            :valueProp="itemValue"
            :label="itemLabel"
            :searchable="true"
            :strict="false"
            :disabled="props.disabled"
            :mode="props.mode"
            :can-clear="props.canClear"
            :can-deselect="props.canClear"
            :limit="props.limit"
            :placeholder="$t(modelClass.model.localizationKey)"
            :noOptionsText="$t('No_Results')"
            :noResultsText="$t('No_Results')"
            :loading="loading"
            @open="multiselect.refreshOptions()"
            :append-to-body="props.appendToBody"
            :classes="{
                dropdown: 'multiselect-dropdown z-3000',
                containerActive: '',
            }"
        >
            <template #option="{ option }" v-if="props.allowCreate">
                <div class="d-flex align-center justify-space-between w-100">
                    <span>{{ option[itemLabel] }}</span>
                    <v-chip size="x-small" variant="flat" color="create" class="ml-2" v-if="option.__CREATE__">
                        <v-icon icon="$create"></v-icon>
                        <template class="d-none d-lg-block"> {{ $t('Create') }}</template>
                    </v-chip>
                </div>
            </template>

            <template #clear="{ clear }" v-if="props.canClear">
                <span @click="clear" aria-hidden="true" tabindex="-1" role="button" data-clear="" aria-roledescription="❎" class="multiselect-clear">
                  <span class="multiselect-clear-icon"></span>
                </span>
            </template>

            <template v-if="hasMoreItems && !loading" #afterlist>
                <span class="text-disabled font-italic text-caption ms-3">{{ $t('ModelSelectResultsHelp') }}</span>
            </template>
        </Multiselect>

        <template #append v-if="$slots.append">
            <slot name="append">

            </slot>
        </template>
    </v-input>
</template>

<script lang="ts" setup>
import {computed, onBeforeMount, onMounted, PropType, ref, useTemplateRef} from "vue"
import {EditorSupportedModels, GenericModel, getGenericModelFromString} from "@/types/Models"
import Multiselect from '@vueform/multiselect'
import {ErrorMessageType, MessageType, PreparedMessage, useMessageStore} from "@/stores/MessageStore";
import {useI18n} from "vue-i18n";

const {t} = useI18n()

const emit = defineEmits(['update:modelValue', 'create'])

const props = defineProps({
    model: {type: String as PropType<EditorSupportedModels>, required: true},

    id: {type: String, required: false, default: Math.floor(Math.random() * 10000).toString()},

    limit: {type: Number, default: 25},

    disabled: {type: Boolean, default: false},
    canClear: {type: Boolean, default: true},

    mode: {type: String as PropType<'single' | 'multiple' | 'tags'>, default: 'single'},
    appendToBody: {type: Boolean, default: false},
    object: {type: Boolean, default: true}, // TODO broken either fix or finally get other multiselect working

    allowCreate: {type: Boolean, default: false},
    placeholder: {type: String, default: undefined},

    noOptionsText: {type: String, default: undefined},
    noResultsText: {type: String, default: undefined},
    label: {type: String, default: ''},

    hint: {type: String, default: ''},
    hideDetails: {type: Boolean, default: false},
    density: {type: String as PropType<'' | 'compact' | 'comfortable'>, default: ''},

    searchOnLoad: {type: Boolean, default: false},
})

/**
 * check if model has a non-standard value attribute defined, if not use "id" as the value attribute
 */
const itemValue = computed(() => {
    if (modelClass.value.model.itemValue) {
        return modelClass.value.model.itemValue
    }
    return 'id'
})

/**
 * check if model has a non-standard label attribute defined, if not use "name" as the value attribute
 */
const itemLabel = computed(() => {
    if (modelClass.value.model.itemLabel) {
        return modelClass.value.model.itemLabel
    }
    return 'name'
})

const model = defineModel()
const modelClass = ref({} as GenericModel)
const loading = ref(false)
const hasMoreItems = ref(false)

const multiselect = useTemplateRef(`ref_${props.id}`)

/**
 * create instance of model class when mounted
 */
onBeforeMount(() => {
    modelClass.value = getGenericModelFromString(props.model, t)
})

/**
 * performs the API request to search for the selected input
 * @param query input to search for on the API
 */
function search(query: string) {
    loading.value = true
    return modelClass.value.list({query: query, page: 1, pageSize: props.limit}).then((r: any) => {
        if (modelClass.value.model.isPaginated) {
            hasMoreItems.value = !!r.next
            return r.results
        } else {
            hasMoreItems.value = false
            return r
        }
    }).catch((err: any) => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    }).finally(() => {
        loading.value = false
    })
}

/**
 * handle new object being created
 *
 * @param object object with two keys (itemValue/itemLabel) both having the string of the newly created item (query) as a value {<itemValue>: query, <itemLabel>: query}
 * @param select$ reference to multiselect instance
 */
async function createObject(object: any, select$: Multiselect) {
    return await modelClass.value.create({name: object[itemLabel.value]}).then((createdObj: any) => {
        useMessageStore().addPreparedMessage(PreparedMessage.CREATE_SUCCESS, createdObj)
        emit('create', object)
        return createdObj
    }).catch((err: any) => {
        useMessageStore().addError(ErrorMessageType.CREATE_ERROR, err)
    })
}


</script>

<style src="@vueform/multiselect/themes/default.css"></style>
<!-- style can't be scoped (for whatever reason) -->
<style>
.material-multiselect {
    --ms-bg: rgba(210, 210, 210, 0.1);
    --ms-border-color: 0;
    --ms-border-color-active: 0;
    border-bottom: inset 1px rgba(50, 50, 50, 0.8);
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
}

.model-select--density-compact {
    --ms-line-height: 1.3;
}

.model-select--density-comfortable {
    --ms-line-height: 1.8;
}

.model-select--density-default {
    --ms-line-height: 2.3;
}


.multiselect-tag {
    background-color: #b98766 !important;
}

.z-3000 {
    z-index: 3000;
}
</style>
