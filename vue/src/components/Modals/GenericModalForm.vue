<template>
    <div>
        <b-modal :id="'modal_' + id" @hidden="cancelAction">
            <template v-slot:modal-title>
                <h4>{{ form.title }}</h4>
            </template>
            <div v-for="(f, i) in form.fields" v-bind:key="i">
                <p v-if="visibleCondition(f, 'instruction')">{{ f.label }}</p>
                <lookup-input v-if="visibleCondition(f, 'lookup')" :form="f" :model="listModel(f.list)" @change="storeValue" />
                <checkbox-input class="mb-3" v-if="visibleCondition(f, 'checkbox')" :label="f.label" :value="f.value" :field="f.field" />
                <text-input v-if="visibleCondition(f, 'text')" :label="f.label" :value="f.value" :field="f.field" :placeholder="f.placeholder" />
                <choice-input v-if="visibleCondition(f, 'choice')" :label="f.label" :value="f.value" :field="f.field" :options="f.options" :placeholder="f.placeholder" />
                <emoji-input v-if="visibleCondition(f, 'emoji')" :label="f.label" :value="f.value" :field="f.field" @change="storeValue" />
                <file-input v-if="visibleCondition(f, 'file')" :label="f.label" :value="f.value" :field="f.field" @change="storeValue" />
                <small-text v-if="visibleCondition(f, 'smalltext')" :value="f.value" />
            </div>

            <template v-slot:modal-footer>
                <b-button class="float-right mx-1" variant="secondary" v-on:click="cancelAction">{{ $t("Cancel") }}</b-button>
                <b-button class="float-right mx-1" variant="primary" v-on:click="doAction">{{ form.ok_label }}</b-button>
            </template>
        </b-modal>
    </div>
</template>

<script>
import Vue from "vue"
import { BootstrapVue } from "bootstrap-vue"
import { getForm, formFunctions } from "@/utils/utils"

Vue.use(BootstrapVue)

import { ApiApiFactory } from "@/utils/openapi/api"
import { ApiMixin, StandardToasts, ToastMixin } from "@/utils/utils"
import CheckboxInput from "@/components/Modals/CheckboxInput"
import LookupInput from "@/components/Modals/LookupInput"
import TextInput from "@/components/Modals/TextInput"
import EmojiInput from "@/components/Modals/EmojiInput"
import ChoiceInput from "@/components/Modals/ChoiceInput"
import FileInput from "@/components/Modals/FileInput"
import SmallText from "@/components/Modals/SmallText"

export default {
    name: "GenericModalForm",
    components: { FileInput, CheckboxInput, LookupInput, TextInput, EmojiInput, ChoiceInput, SmallText },
    mixins: [ApiMixin, ToastMixin],
    props: {
        model: { required: true, type: Object },
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
        show: { required: true, type: Boolean, default: false },
    },
    data() {
        return {
            id: undefined,
            form_data: {},
            form: {},
            dirty: false,
            special_handling: false,
        }
    },
    mounted() {
        this.id = Math.random()
        this.$root.$on("change", this.storeValue) // bootstrap modal placed at document so have to listen at root of component
    },
    computed: {
        buttonLabel() {
            return this.buttons[this.action].label
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
            this.genericAPI(this.model, this.Actions.DELETE, { id: this.item1.id })
                .then((result) => {
                    this.$emit("finish-action")
                    StandardToasts.makeStandardToast(StandardToasts.SUCCESS_DELETE)
                })
                .catch((err) => {
                    console.log(err)
                    StandardToasts.makeStandardToast(StandardToasts.FAIL_DELETE)
                    this.$emit("finish-action", "cancel")
                })
        },
        save: function () {
            if (!this.item1?.id) {
                // if there is no item id assume it's a new item
                this.genericAPI(this.model, this.Actions.CREATE, this.form_data)
                    .then((result) => {
                        this.$emit("finish-action", { item: result.data })
                        StandardToasts.makeStandardToast(StandardToasts.SUCCESS_CREATE)
                    })
                    .catch((err) => {
                        console.log(err)
                        StandardToasts.makeStandardToast(StandardToasts.FAIL_CREATE)
                        this.$emit("finish-action", "cancel")
                    })
            } else {
                this.genericAPI(this.model, this.Actions.UPDATE, this.form_data)
                    .then((result) => {
                        this.$emit("finish-action")
                        StandardToasts.makeStandardToast(StandardToasts.SUCCESS_UPDATE)
                    })
                    .catch((err) => {
                        console.log(err, err.response)
                        StandardToasts.makeStandardToast(StandardToasts.FAIL_UPDATE)
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
            this.genericAPI(this.model, this.Actions.MOVE, { source: this.item1.id, target: this.form_data.target.id })
                .then((result) => {
                    this.$emit("finish-action", { target: this.form_data.target.id })
                    StandardToasts.makeStandardToast(StandardToasts.SUCCESS_MOVE)
                })
                .catch((err) => {
                    console.log(err)
                    StandardToasts.makeStandardToast(StandardToasts.FAIL_MOVE)
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
                    this.$emit("finish-action", { target: this.form_data.target.id })
                    StandardToasts.makeStandardToast(StandardToasts.SUCCESS_MERGE)
                })
                .catch((err) => {
                    //TODO error checking not working with OpenAPI methods
                    console.log("Error", err)
                    StandardToasts.makeStandardToast(StandardToasts.FAIL_MERGE)
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
            if (type_match && field?.condition) {
                if (field.condition?.condition === "exists") {
                    if ((this.item1[field.condition.field] != undefined) === field.condition.value) {
                        checks = true
                    } else {
                        checks = false
                    }
                }
            }

            return type_match && checks
        },
    },
}
</script>
