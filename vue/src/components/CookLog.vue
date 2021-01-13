<template>

  <div>

    <b-modal class="modal" id="id_modal_cook_log" :title="_('Log Recipe Cooking')" :ok-title="_('Save')"
             :cancel-title="_('Close')" @ok="logCook()">

      <p>{{ _('All fields are optional and can be left empty.') }}</p>
      <form>

        <label for="id_log_servings">{{ _('Servings') }}</label>
        <input class="form-control" type="number" id="id_log_servings" v-model="logObject.servings">
        <label style="margin-top: 2vh" for="id_log_rating">{{ _('Rating') }} - <span
            id="id_rating_show">{{ logObject.rating }}/5</span></label>
        <input type="range" class="custom-range" min="0" max="5" id="id_log_rating" name="log_rating"
               value="0" v-model="logObject.rating">

        <label for="id_date" style="margin-top: 2vh">{{ _('Date') }}</label>
        <input type="datetime-local" id="id_date" class="form-control" v-model="logObject.created_at">
      </form>
    </b-modal>
  </div>
</template>

<script>

import {GettextMixin} from "@/utils/utils";

import moment from 'moment'

Vue.prototype.moment = moment

import Vue from "vue";
import {BootstrapVue} from "bootstrap-vue";
import {apiLogCooking} from "@/utils/api";

Vue.use(BootstrapVue)

export default {
  name: 'CookLog',
  mixins: [
    GettextMixin,
  ],
  props: {
    recipe: Object,
  },
  data() {
    return {
      logObject: {
        recipe: this.recipe.id,
        servings: 0,
        rating: 0,
        created_at: moment().format('yyyy-MM-DDTHH:mm')
      }
    }
  },
  methods: {
    logCook: function () {
      apiLogCooking(this.logObject)
    },
  }
}
</script>
