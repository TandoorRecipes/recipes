<template>
    <div class="cv-header">
        <div class="cv-header-nav d-none d-md-block">
            <b-button-toolbar key-nav aria-label="Toolbar with button groups">
                <b-button-group class="mx-1">
                    <b-button v-html="'<<'" @click="onInput(headerProps.previousPeriod)" class="text-white" v-b-tooltip.hover.top :title="$t('Previous_Period')"></b-button>
                    <b-button v-html="'<'" @click="onDayBack" class="text-white" v-b-tooltip.hover.top :title="$t('Previous_Day')"></b-button>
                </b-button-group>
                <b-button-group class="mx-1">
                    <b-button @click="onInput(headerProps.currentPeriod)" class="text-white" v-b-tooltip.hover.top :title="$t('Current_Period')"><i class="fas fa-home"></i> </b-button>
                    <b-form-datepicker button-only button-variant="secondary" v-b-tooltip.hover.top :title="$t('Date')" @context="dateSelect" class="text-white"></b-form-datepicker>
                </b-button-group>
                <b-button-group class="mx-1">
                    <b-button v-html="'>'" @click="onDayForward" class="text-white" v-b-tooltip.hover.top :title="$t('Next_Day')"></b-button>
                    <b-button v-html="'>>'" @click="onInput(headerProps.nextPeriod)" class="text-white" v-b-tooltip.hover.top :title="$t('Next_Period')"></b-button>
                </b-button-group>
            </b-button-toolbar>
        </div>
        <div class="periodLabel">
            <slot name="label">{{ headerProps.periodLabel }}</slot>
        </div>
        <div class="actionArea pt-1 pb-1 d-none d-lg-flex">
            <span class="period-span-1 pt-1 pb-1 pl-1 pr-1 d-none d-xl-inline-flex text-body align-items-center">
                <small>{{ $t('Period') }}:</small>
                <b-form-select class="ml-1" id="UomInput" v-model="settings.displayPeriodUom" :options="options.displayPeriodUom"></b-form-select>
            </span>
            <span class="period-span-2 pt-1 pb-1 pl-1 pr-1 mr-1 ml-1 d-none d-xl-inline-flex text-body align-items-center">
                <small>{{ $t('Periods') }}:</small>
                <b-form-select class="ml-1" id="UomInput" v-model="settings.displayPeriodCount" :options="options.displayPeriodCount"></b-form-select>
            </span>
            <span
                class="delete-area text-danger p-1 mr-2 ml-1 d-none d-sm-flex align-items-center rounded"
                @drop.prevent="onDeleteDrop($event)"
                @dragenter.prevent="onDeleteDragEnter($event)"
                @dragleave.prevent="onDeleteDragLeave($event)"
                @dragover.prevent="onDeleteDragEnter"
                ><i class="fa fa-trash"></i> {{ $t("Drag_Here_To_Delete") }}</span
            >
        </div>
    </div>
</template>
<script>
export default {
    name: "MealPlanCalenderHeader",
    computed: {
        settings: {
            get: function () {
                return this.settings_prop
            },
            set: function (value) {
                this.$emit("change", value)
            },
        },
    },
    props: {
        headerProps: {
            type: Object,
            required: true,
        },
        options: {},
        previousYearLabel: { type: String, default: "<<" },
        previousPeriodLabel: { type: String, default: "<" },
        nextPeriodLabel: { type: String, default: ">" },
        nextYearLabel: { type: String, default: ">>" },
        iCalUrl: { type: String, default: "" },
        settings_prop: {},
    },
    methods: {
        onDayForward() {
            this.$emit("set-starting-day-forward")
        },
        onDayBack() {
            this.$emit("set-starting-day-back")
        },
        dateSelect(ctx) {
            this.$emit("input", ctx.selectedDate)
        },
        onInput(d) {
            this.$emit("input", d)
        },
        onDeleteDragEnter(e) {
            e.currentTarget.classList.add("draghover")
        },
        onDeleteDragLeave(e) {
            e.currentTarget.classList.remove("draghover")
        },
        onDeleteDrop(e) {
            e.currentTarget.classList.remove("draghover")
            this.$emit("delete-dragged")
        },
    },
}
</script>
<style>
.cv-header {
    display: flex;
    flex: 0 1 auto;
    flex-flow: row nowrap;
    align-items: center;
    min-height: 2.5em;
    border-width: 1px 1px 0 1px;
}

.cv-header .periodLabel {
    display: flex;
    flex: 1 1 auto;
    flex-flow: row nowrap;
    min-height: 1.5em;
    line-height: 1;
    font-size: 1.5em;
}

.cv-header .actionArea {
    display: flex;
    flex: 1 1 auto;
    flex-flow: row nowrap;
    min-height: 1.5em;
    line-height: 1;
    font-size: 1em;
}

.period-span-1 {
    margin-left: auto;
    order: 1;
    user-select: none;
}

.period-span-2 {
    order: 2;
    user-select: none;
}

.delete-area {
    border-style: dotted;
    order: 3;
    user-select: none;
}

.delete-area.draghover {
    box-shadow: inset 0 0 0.1em 0.1em #a7240e !important;
}

.cv-header,
.cv-header button {
    border-style: solid;
    border-color: #ddd;
}

.cv-header-nav,
.cv-header .periodLabel {
    margin: 0.1em 0.6em;
}

.cv-header-nav button,
.cv-header .periodLabel {
    padding: 0.4em 0.6em;
}

.cv-header button {
    box-sizing: border-box;
    line-height: 1em;
    font-size: 1em;
    border-width: 1px;
}
</style>
