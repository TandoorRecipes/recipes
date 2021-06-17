<template>

  <div>
    <b-modal class="modal" :id="`id_modal_cook_log_${modal_id}`" :title="$t('Log_Recipe_Cooking')" :ok-title="$t('Save')"
             :cancel-title="$t('Close')" @ok="logCook()">

      <p>{{ $t('all_fields_optional') }}</p>
      <form>

        <label for="id_log_servings">{{ $t('Servings') }}</label>
        <input class="form-control" type="number" id="id_log_servings" v-model="logObject.servings">

        <label style="margin-top: 2vh">{{ $t('Rating') }} - <span
            id="id_rating_show">{{ logObject.rating }}/5</span></label>

        <b-form-rating v-model="logObject.rating"></b-form-rating>

        <label for="id_date" style="margin-top: 2vh">{{ $t('Date') }}</label>
        <input type="datetime-local" id="id_date" class="form-control" v-model="logObject.created_at">
      </form>
    </b-modal>
  </div>
</template>

<script>

import moment from 'moment'

Vue.prototype.moment = moment

import Vue from "vue";
import {BootstrapVue} from "bootstrap-vue";
import {apiLogCooking} from "@/utils/api";

Vue.use(BootstrapVue)

export default {
  name: 'CookLog',
  props: {
    recipe: Object,
    modal_id: Number
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
