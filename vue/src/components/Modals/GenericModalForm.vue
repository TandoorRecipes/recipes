<template>
    <div>
        <template v-if="form_component !== undefined && (action === Actions.UPDATE || action === Actions.CREATE)">
            <component :is="form_component" :id="'modal_' + id" :show="show" @hidden="cancelAction" :item1="item1"></component>
        </template>
        <template v-else>
            <b-modal :id="'modal_' + id" @hidden="cancelAction" size="lg">
                <template v-slot:modal-title>
                    <h4 class="d-inline">{{ form.title }}</h4>
                    <help-badge v-if="form.show_help" @show="show_help = true" @hide="show_help = false" :component="`GenericModal${form.title}`"/>
                </template>
                <div v-for="(f, i) in form.fields" v-bind:key="i">
                    <p v-if="visibleCondition(f, 'instruction')">{{ f.label }}</p>
                    <lookup-input v-if="visibleCondition(f, 'lookup')" :form="f" :model="listModel(f.list)" @change="storeValue" :help="showHelp && f.help" :optional="f.optional"/>
                    <checkbox-input class="mb-3" v-if="visibleCondition(f, 'checkbox')" :label="f.label" :value="f.value" :field="f.field" :help="showHelp && f.help"/>
                    <text-input v-if="visibleCondition(f, 'text')" :label="f.label" :value="f.value" :field="f.field" :placeholder="f.placeholder" :help="showHelp && f.help" :subtitle="f.subtitle" :disabled="f.disabled" :optional="f.optional"/>
                    <text-area-input v-if="visibleCondition(f, 'textarea')" :label="f.label" :value="f.value" :field="f.field" :placeholder="f.placeholder" :help="showHelp && f.help" :subtitle="f.subtitle" :disabled="f.disabled" :optional="f.optional"/>
                    <choice-input v-if="visibleCondition(f, 'choice')" :label="f.label" :value="f.value" :field="f.field" :options="f.options" :placeholder="f.placeholder" :optional="f.optional"/>
                    <file-input v-if="visibleCondition(f, 'file')" :label="f.label" :value="f.value" :field="f.field" @change="storeValue" :optional="f.optional"/>
                    <small-text v-if="visibleCondition(f, 'smalltext')" :value="f.value" />
                    <date-input v-if="visibleCondition(f, 'date')" :label="f.label" :value="f.value" :field="f.field" :help="showHelp && f.help" :subtitle="f.subtitle" :optional="f.optional"/>
                    <color-input v-if="visibleCondition(f, 'color')" :label="f.label" :value="f.value" :field="f.field" :help="showHelp && f.help" :subtitle="f.subtitle" :optional="f.optional"/>
                    <number-input v-if="visibleCondition(f, 'number')" :label="f.label" :value="f.value" :field="f.field" :placeholder="f.placeholder" :help="showHelp && f.help" :subtitle="f.subtitle" :optional="f.optional"/>
                </div>
                <template v-slot:modal-footer>
                    <div class="row w-100">
                        <div class="col-6 align-self-end">
                            <b-form-checkbox v-if="advancedForm" sm switch v-model="show_advanced">{{ $t("Advanced") }}</b-form-checkbox>
                        </div>
                        <div class="col-auto justify-content-end">
                            <b-button class="mx-1" variant="secondary" v-on:click="cancelAction">{{ $t("Cancel") }}</b-button>
                            <b-button class="mx-1" variant="primary" v-on:click="doAction">{{ form.ok_label }}</b-button>
                        </div>
                    </div>
                </template>
            </b-modal>
        </template>

    </div>
</template>

<script>
import Vue from "vue"
import {BootstrapVue} from "bootstrap-vue"
import {getForm, formFunctions} from "@/utils/utils"

Vue.use(BootstrapVue)

import {ApiApiFactory} from "@/utils/openapi/api"
import {ApiMixin, StandardToasts, ToastMixin, getUserPreference} from "@/utils/utils"
import CheckboxInput from "@/components/Modals/CheckboxInput"
import LookupInput from "@/components/Modals/LookupInput"
import TextInput from "@/components/Modals/TextInput"
import DateInput from "@/components/Modals/DateInput"
import ChoiceInput from "@/components/Modals/ChoiceInput"
import FileInput from "@/components/Modals/FileInput"
import SmallText from "@/components/Modals/SmallText"
import HelpBadge from "@/components/Badges/Help"
import NumberInput from "@/components/Modals/NumberInput.vue";
import TextAreaInput from "@/components/Modals/TextAreaInput.vue";
import ColorInput from "@/components/Modals/ColorInput.vue";

export default {
    name: "GenericModalForm",
    components: {
        FileInput,
        CheckboxInput,
        LookupInput,
        TextInput,
        ChoiceInput,
        SmallText,
        HelpBadge,
        DateInput,
        NumberInput,
        TextAreaInput,
        ColorInput
    },
    mixins: [ApiMixin, ToastMixin],
    props: {
        model: {required: true, type: Object},
        action: {
            type: Object,
            default() {
                return {}
            },
        },
        item1: {
            type: Object,
            default() {
                return {}
            },
        },
        item2: {
            type: Object,
            default() {
                return {}
            },
        },
        show: {required: true, type: Boolean, default: false},
        models: {required: false, type: Function, default: null}
    },
    data() {
        return {
            id: undefined,
            form_data: {},
            form: {},
            dirty: false,
            special_handling: false,
            show_help: false,
            show_advanced: false,
        }
    },
    mounted() {
        this.id = Math.random()
        this.$root.$on("change", this.storeValue) // bootstrap modal placed at document so have to listen at root of component

        if (this.models !== null) {
            this.Models = this.models // override models definition file with prop
        }
    },
    computed: {
        advancedForm() {
            return this.form.fields
                .map((x) => {
                    return x?.advanced ?? false
                })
                .includes(true)
        },
        buttonLabel() {
            return this.buttons[this.action].label
        },
        showHelp() {
            if (this.show_help) {
                return true
            } else {
                return undefined
            }
        },
        form_component() {
            // TODO this leads webpack to create one .js file for each component in this folder because at runtime any one of them could be requested
            // TODO this is not necessarily bad but maybe there are better options to do this
            if (this.form.component !== undefined) {
                return () => import(/* webpackChunkName: "header-component" */ `@/components/${this.form.component}`)
            } else {
                return undefined
            }
        },
    },
    watch: {
        show: function () {
            if (this.show) {
                this.form = getForm(this.model, this.action, this.item1, this.item2)
                if (this.form?.form_function) {
                    this.form = formFunctions[this.form.form_function](this.form)
                }
                this.dirty = true
                this.$bvModal.show("modal_" + this.id)
            } else {
                this.$bvModal.hide("modal_" + this.id)
                this.form_data = {}
            }
        },
    },
    methods: {
        doAction: function () {
            this.dirty = false
            switch (this.action) {
                case this.Actions.DELETE:
                    this.delete()
                    break
                case this.Actions.CREATE:
                    this.save()
                    break
                case this.Actions.UPDATE:
                    this.form_data.id = this.item1.id
                    this.save()
                    break
                case this.Actions.MERGE:
                    this.merge(this.item1, this.form_data.target.id, this.item1?.automate ?? false)
                    break
                case this.Actions.MOVE:
                    this.move(this.item1.id, this.form_data.target.id)
                    break
            }
        },
        cancelAction: function () {
            if (this.dirty) {
                this.dirty = false
                this.$emit("finish-action", "cancel")
                this.$emit("hidden")
            }
        },
        storeValue: function (field, value) {
            this.form_data[field] = value
        },
        listModel: function (m) {
            if (m === "self") {
                return this.model
            } else {
                return this.Models[m]
            }
        },
        detectOverride: function (form) {
            for (const [k, v] of Object.entries(form)) {
                if (form[k].__override__) {
                    form[k] = form[k].__override__
                }
            }
            return form
        },
        delete: function () {
            this.genericAPI(this.model, this.Actions.DELETE, {id: this.item1.id})
                .then((result) => {
                    this.$emit("finish-action")
                    StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_DELETE)
                })
                .catch((err) => {
                    if (err.response.status === 403) {
                        StandardToasts.makeStandardToast(this, StandardToasts.FAIL_DELETE_PROTECTED, err)
                    } else {
                        StandardToasts.makeStandardToast(this, StandardToasts.FAIL_DELETE, err)
                    }
                    this.$emit("finish-action", "cancel")
                })
        },
        save: function () {
            if (!this.item1?.id) {
                // if there is no item id assume it's a new item
                this.genericAPI(this.model, this.Actions.CREATE, this.form_data)
                    .then((result) => {
                        this.$emit("finish-action", {item: result.data})
                        StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_CREATE)
                    })
                    .catch((err) => {
                        console.log(err)
                        StandardToasts.makeStandardToast(this, StandardToasts.FAIL_CREATE)
                        this.$emit("finish-action", "cancel")
                    })
            } else {
                this.genericAPI(this.model, this.Actions.UPDATE, this.form_data)
                    .then((result) => {
                        this.$emit("finish-action", {item: result.data})
                        StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_UPDATE)
                    })
                    .catch((err) => {
                        StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
                        this.$emit("finish-action", "cancel")
                    })
            }
        },
        move: function () {
            if (this.item1.id === this.form_data.target.id) {
                this.makeToast(this.$t("Error"), this.$t("err_move_self"), "danger")
                this.$emit("finish-action", "cancel")
                return
            }
            if (this.form_data.target.id === undefined || this.item1?.parent == this.form_data.target.id) {
                this.makeToast(this.$t("Warning"), this.$t("nothing"), "warning")
                this.$emit("finish-action", "cancel")
                return
            }
            this.genericAPI(this.model, this.Actions.MOVE, {source: this.item1.id, target: this.form_data.target.id})
                .then((result) => {
                    this.$emit("finish-action", {target: this.form_data.target.id})
                    StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_MOVE)
                })
                .catch((err) => {
                    StandardToasts.makeStandardToast(this, StandardToasts.FAIL_MOVE, err)
                    this.$emit("finish-action", "cancel")
                })
        },
        merge: function () {
            if (this.item1.id === this.form_data.target.id) {
                this.makeToast(this.$t("Error"), this.$t("err_merge_self"), "danger")
                this.$emit("finish-action", "cancel")
                return
            }
            if (!this.item1.id || !this.form_data.target.id) {
                this.makeToast(this.$t("Warning"), this.$t("nothing"), "warning")
                this.$emit("finish-action", "cancel")
                return
            }
            this.genericAPI(this.model, this.Actions.MERGE, {
                source: this.item1.id,
                target: this.form_data.target.id,
            })
                .then((result) => {
                    this.$emit("finish-action", {
                        target: this.form_data.target.id,
                        target_object: this.form_data.target
                    }) //TODO temporary workaround to not change other apis
                    StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_MERGE)
                })
                .catch((err) => {
                    StandardToasts.makeStandardToast(this, StandardToasts.FAIL_MERGE, err)
                    this.$emit("finish-action", "cancel")
                })

            if (this.item1.automate) {
                let apiClient = new ApiApiFactory()
                let automation = {
                    name: `Merge ${this.item1.name} with ${this.form_data.target.name}`,
                    param_1: this.item1.name,
                    param_2: this.form_data.target.name,
                }

                if (this.model === this.Models.FOOD) {
                    automation.type = "FOOD_ALIAS"
                }
                if (this.model === this.Models.UNIT) {
                    automation.type = "UNIT_ALIAS"
                }
                if (this.model === this.Models.KEYWORD) {
                    automation.type = "KEYWORD_ALIAS"
                }

                apiClient.createAutomation(automation)
            }
        },
        visibleCondition(field, field_type) {
            let type_match = field?.type == field_type
            let checks = true
            let show_advanced = true
            if (field?.advanced) {
                show_advanced = this.show_advanced
            }

            if (type_match && field?.condition) {
                const value = this.item1[field?.condition?.field]
                const preference = getUserPreference(field?.condition?.field)
                checks = false
                switch (field?.condition?.condition) {
                    case "field_exists":
                        if ((value != undefined) === field.condition.value) {
                            checks = true
                        }
                        break
                    case "preference__array_exists":
                        if (preference?.length > 0 === field.condition.value) {
                            checks = true
                        }
                        break
                    case "preference_equals":
                        if (preference === field.condition.value) {
                            checks = true
                        }
                        break
                    case "gt":
                        if (value > field.condition.value) {
                            checks = true
                        }
                }
            }
            return type_match && checks && show_advanced
        },
    },
}
</script>
