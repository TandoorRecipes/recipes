<template>

  <div>
    <hr/>

    <template v-if="step.type === 'TEXT'">
      <div class="row" v-if="recipe.steps.length > 1">
        <div class="col col-md4">
          <h5 class="text-primary">
            <template v-if="step.name">{{ step.name }}</template>
            <template v-else>{{ _('Step') }} {{ index + 1 }}</template>
            <small style="margin-left: 4px" class="text-muted" v-if="step.time !== 0"><i class="fas fa-user-clock"></i>
              {{ step.time }} {{ _('min') }}

            </small>
            <small v-if="start_time !== ''">
              <b-link :id="`id_reactive_popover_${step.id}`" @click="openPopover" href="#">
                {{ moment(start_time).add(step.time_offset, 'minutes').format('HH:mm') }}
              </b-link>
            </small>
          </h5>
        </div>
        <div class="col col-md-8" style="text-align: right">
          <b-button @click="details_visible = !details_visible" style="border: none; background: none"
                    class="shadow-none" :class="{ 'text-primary': details_visible, 'text-success': !details_visible}">
            <i class="far fa-check-circle"></i>
          </b-button>
        </div>
      </div>

      <b-collapse id="collapse-1" v-model="details_visible">
        <div class="row">
          <div class="col col-md-4" v-if="step.ingredients.length > 0 && recipe.steps.length > 1">
            <Ingredients :step="step" :servings="servings"></Ingredients>
          </div>
          <div class="col" :class="{ 'col-md-8':  recipe.steps.length > 1, 'col-md-12':  recipe.steps.length <= 1,}">
            <compile-component :code="step.ingredients_markdown" :servings="servings"></compile-component>
          </div>
        </div>
      </b-collapse>
    </template>

    <template v-if="step.type === 'TIME'">
      <div class="row">
        <div class="col-10 offset-1" style="text-align: center">
          <h4 class="text-primary">
            <template v-if="step.name">{{ step.name }}</template>
            <template v-else>{{ _('Step') }} {{ index + 1 }}</template>
          </h4>
          <span style="margin-left: 4px" class="text-muted" v-if="step.time !== 0"><i class="fa fa-stopwatch"></i>
              {{ step.time }} {{ _('min') }}</span>
          <b-link :id="`id_reactive_popover_${step.id}`" @click="openPopover" href="#" v-if="start_time !== ''">
            {{ moment(start_time).add(step.time_offset, 'minutes').format('HH:mm') }}
          </b-link>
        </div>

        <div class="col-1" style="text-align: right">
          <b-button @click="details_visible = !details_visible" style="border: none; background: none"
                    class="shadow-none" :class="{ 'text-primary': details_visible, 'text-success': !details_visible}">
            <i class="far fa-check-circle"></i>
          </b-button>
        </div>
      </div>

      <b-collapse id="collapse-1" v-model="details_visible">
        <div class="row" v-if="step.instruction !== ''">
          <div class="col col-md-12" style="text-align: center">
            <compile-component :code="step.ingredients_markdown" :servings="servings"></compile-component>
          </div>
        </div>
      </b-collapse>
    </template>

    <div v-if="start_time !== ''">
      <b-popover
          :target="`id_reactive_popover_${step.id}`"
          triggers="click"
          placement="bottom"
          :ref="`id_reactive_popover_${step.id}`"
          :title="_('Step start time')">
        <div>
          <b-form-group
              label="Time"
              label-for="popover-input-1"
              label-cols="3"
              class="mb-1">
            <b-form-input
                type="datetime-local"
                id="popover-input-1"
                v-model.datetime-local="set_time_input"
                size="sm"
            ></b-form-input>
          </b-form-group>
        </div>
        <div class="row" style="margin-top: 1vh">
          <div class="col-12" style="text-align: right">
            <b-button @click="closePopover" size="sm" variant="secondary" style="margin-right:8px">Cancel</b-button>
            <b-button @click="updateTime" size="sm" variant="primary">Ok</b-button>
          </div>
        </div>
      </b-popover>
    </div>
  </div>

</template>

<script>

import {calculateAmount} from "@/utils/utils";

import {GettextMixin} from "@/utils/utils";

import CompileComponent from "@/components/CompileComponent";
import Vue from "vue";
import moment from "moment";
import Ingredients from "@/components/Ingredients";

Vue.prototype.moment = moment

export default {
  name: 'Step',
  mixins: [
    GettextMixin,
  ],
  components: {
    Ingredients,
    CompileComponent,
  },
  props: {
    step: Object,
    servings: Number,
    index: Number,
    recipe: Object,
    start_time: String,
  },
  data() {
    return {
      details_visible: true,
      set_time_input: '',
    }
  },
  mounted() {
    this.set_time_input = moment(this.start_time).add(this.step.time_offset, 'minutes').format('yyyy-MM-DDTHH:mm')
  },
  methods: {
    calculateAmount: function (x) {
      // used by the jinja2 template
      return calculateAmount(x, this.servings)
    },
    updateTime: function () {
      this.$emit('update-start-time', moment(this.set_time_input).add(this.time_offset * -1, 'minutes').format('yyyy-MM-DDTHH:mm'))
      this.closePopover()
    },
    closePopover: function () {
      this.$refs[`id_reactive_popover_${this.step.id}`].$emit('close')
    },
    openPopover: function () {
      this.$refs[`id_reactive_popover_${this.step.id}`].$emit('open')
    }
  }
}
</script>
