<template>

</template>

<script>
import Vue from 'vue'
import {BootstrapVue, IconsPlugin} from 'bootstrap-vue'

// Import Bootstrap an BootstrapVue CSS files (order is important)
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

// Make BootstrapVue available throughout your project
Vue.use(BootstrapVue)
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin)

import draggable from 'vuedraggable'

import VueCookies from 'vue-cookies'

Vue.use(VueCookies)

import moment from 'moment'

import ToastComponent from './components/ToastComponent.vue'

Vue.prototype.this.gettext = window.this.gettext

//moment.locale('{{request.LANGUAGE_CODE}}');

let csrftoken = Cookies.get('csrftoken');
Vue.http.headers.common['X-CSRFToken'] = csrftoken;

export default {
  name: 'App',
  components: {
    draggable,
    ToastComponent
  },
  delimiters: ['[[', ']]'],
  el: '#app',
  mixin: [],
  data() {
    return {
      start_date: undefined,
      start_offset: 0,
      dates: [],
      number_of_days:this.$cookies.isKey('number_of_days') ?this.$cookies.get('number_of_days') : 7,
      plan_entries: [],
      meal_types: [],
      meal_types_edit: [],
      meal_plan: {},
      plan_detail: {shared: []},
      recipes: [],
      recipe_query: '',
      pseudo_note_list: [
        {id: 0, title: '', text: ''}
      ],
      new_note_title: '',
      new_note_text: '',
      new_note_servings: '',
      default_shared_users: [],
      user_id_update: [],
      user_names: {},
      shopping: false,
      shopping_list: [],
    }
  },
  mounted: function () {

    this.user_id_update = Array.from(this.default_shared_users)

    this.start_offset =this.$cookies.isKey('start_offset') ?this.$cookies.get('start_offset') : 0;
    this.start_date = moment().weekday(0).add(this.start_offset, 'days').format('YYYY-MM-DD')

    this.updatePlan();
    this.getRecipes();

    //this.makeToast('success', 'this actually works', 'success')
  },
  methods: {
    makeToast: function (title, message, variant = null) {
      this.$bvToast.toast(message, {
        title: title,
        variant: variant,
        toaster: 'b-toaster-top-center',
        solid: true
      })
    },
    updatePlan: function () {
      this.dates = [];
      for (var i = 0; i <= (this.number_of_days - 1); i++) {
        this.dates.push(moment(this.start_date).add(i, 'days'));
      }

      let planEntryPromise = this.getPlanEntries();
      let planTypePromise = this.getPlanTypes();

      Promise.allSettled([planEntryPromise, planTypePromise]).then(() => {
        this.buildGrid()
      })
    },
    getPlanEntries: function () {
      return this.$http.get("{% url 'api:mealplan-list' %}?from_date=" + this.dates[0].format('YYYY-MM-DD') + "&to_date=" + this.dates[this.dates.length - 1].format('YYYY-MM-DD')).then((response) => {
        this.plan_entries = response.data;
      }).catch((err) => {
        console.log("getPlanEntries error: ", err);
        this.makeToast(this.gettext('Error'), this.gettext('There was an error loading a resource!') + err.bodyText, 'danger')
      })
    },
    getPlanTypes: function () {
      return this.$http.get("{% url 'api:mealtype-list' %}").then((response) => {
        this.meal_types = response.data;
        this.meal_types_edit = jQuery.extend(true, [], response.data);
        for (let mte of this.meal_types_edit) {
          this.$set(mte, 'delete', false)
        }
      }).catch((err) => {
        console.log("getPlanTypes error: ", err);
        this.makeToast(this.gettext('Error'), this.gettext('There was an error loading a resource!') + err.bodyText, 'danger')
      })
    },
    buildGrid: function () {
      this.meal_plan = {}

      for (let e of this.plan_entries) {
        let new_type = {id: e.meal_type, name: e.meal_type_name, created_by: e.created_by}
        if (this.meal_types.filter(el => el.name === new_type.name).length === 0) {
          this.meal_types.push(new_type)
        }
      }

      for (let t of this.meal_types) {
        this.$set(this.meal_plan, t.name, {
          name: t.name,
          meal_type: t.id,
          days: {}
        })
        for (let d of this.dates) {
          this.$set(this.meal_plan[t.name].days, d.format('YYYY-MM-DD'), {
            name: this.formatDateDayname(d),
            date: d.format('YYYY-MM-DD'),
            items: []
          })
        }
      }
      for (let e of this.plan_entries) {
        this.meal_plan[e.meal_type_name].days[e.date].items.push(e)

        for (let u of e.shared) {
          if (!this.user_id_update.includes(parseInt(u))) {
            this.user_id_update.push(parseInt(u))
          }
        }
      }

      this.updateUserNames()
    },
    getRandomRecipes: function () {
      this.$set(this, 'recipe_query', '');
      this.getRecipes();
    },
    getRecipes: function () {
      let url = "{% url 'api:recipe-list' %}?limit=5"
      if (this.recipe_query !== '') {
        url += '&query=' + this.recipe_query;
      } else {
        url += '&random=True'
      }

      this.$http.get(url).then((response) => {
        this.recipes = response.data;
      }).catch((err) => {
        console.log("getRecipes error: ", err);
        this.makeToast(this.gettext('Error'), this.gettext('There was an error loading a resource!') + err.bodyText, 'danger')
      })
    },
    getMdNote: function () {
      let url = "{% url 'api:recipe-list' %}?limit=5"
      if (this.recipe_query !== '') {
        url += '&query=' + this.recipe_query;
      }

      this.$http.get(url).then((response) => {
        this.recipes = response.data;
      }).catch((err) => {
        console.log("getRecipes error: ", err);
        this.makeToast(this.gettext('Error'), this.gettext('There was an error loading a resource!') + err.bodyText, 'danger')
      })
    },
    updateUserNames: function () {
      return this.$http.get("{% url 'api:username-list' %}?filter_list=[" + this.user_id_update + ']').then((response) => {
        for (let u of response.data) {
          this.$set(this.user_names, u.id, u.username);
        }

      }).catch((err) => {
        console.log("updateUserNames error: ", err);
        this.makeToast(this.gettext('Error'), this.gettext('There was an error loading a resource!') + err.bodyText, 'danger')
      })
    },
    dragChanged: function (date, meal_type, evt) {
      if (evt.added !== undefined) {
        let plan_entry = evt.added.element

        plan_entry.date = date
        plan_entry.meal_type = meal_type.id
        plan_entry.meal_type_name = meal_type.name

        if (plan_entry.is_new) { // its not a meal plan object
          plan_entry.created_by = 0;
          plan_entry.shared = this.default_shared_users

          this.$http.post(`{% url 'api:mealplan-list' %}`, plan_entry).then((response) => {
            let entry = response.data
            this.meal_plan[entry.meal_type_name].days[entry.date].items = this.meal_plan[entry.meal_type_name].days[entry.date].items.filter(item => !item.is_new)
            this.meal_plan[entry.meal_type_name].days[entry.date].items.push(entry)
          }).catch((err) => {
            console.log("dragChanged create error", err);
          })
        } else {
          this.$http.put(`{% url 'api:mealplan-list' %}${plan_entry.id}/`, plan_entry).then((response) => {
          }).catch((err) => {
            console.log("dragChanged update error", err);
            this.makeToast(this.gettext('Error'), this.gettext('There was an error loading a resource!') + err.bodyText, 'danger')
          })
        }
      }
    },
    deleteEntry: function (entry) {
      $('#id_plan_detail_modal').modal('hide')
      this.$http.delete(`{% url 'api:mealplan-list' %}${entry.id}/`, entry).then((response) => {
        this.meal_plan[entry.meal_type_name].days[entry.date].items = this.meal_plan[entry.meal_type_name].days[entry.date].items.filter(item => item !== entry)
      }).catch((err) => {
        console.log("deleteEntry error: ", err);
        this.makeToast(this.gettext('Error'), this.gettext('There was an error loading a resource!') + err.bodyText, 'danger')
      })
    },
    updatePlanTypes: function () {
      let promise_list = []
      let i = 0
      for (let x of this.meal_types_edit) {
        x.order = i
        i++
        if (x.id === undefined && !x.delete) {
          x.created_by = 0
          promise_list.push(this.$http.post("{% url 'api:mealtype-list' %}", x).then((response) => {
          }).catch((err) => {
            console.log("updatePlanTypes create error: ", err);
            this.makeToast(this.gettext('Error'), this.gettext('There was an error loading a resource!') + err.bodyText, 'danger')
          }))
        } else if (x.delete) {
          if (x.id !== undefined) {
            promise_list.push(this.$http.delete(`{% url 'api:mealtype-list' %}${x.id}/`, x).then((response) => {
            }).catch((err) => {
              console.log("updatePlanTypes delete error: ", err);
              this.makeToast(this.gettext('Error'), this.gettext('There was an error loading a resource!') + err.bodyText, 'danger')
            }))
          }
        } else {
          promise_list.push(this.$http.put(`{% url 'api:mealtype-list' %}${x.id}/`, x).then((response) => {

          }).catch((err) => {
            console.log("updatePlanTypes update error: ", err);
            this.makeToast(this.gettext('Error'), this.gettext('There was an error loading a resource!') + err.bodyText, 'danger')
          }))
        }
      }
      Promise.allSettled(promise_list).then(() => {
        this.updatePlan()
        $('#id_plan_types_modal').modal('hide')
      })
    },
    markTypeDelete: function (element) {
      if (confirm(this.gettext('When deleting a meal type all entries using that type will be deleted as well. Deletion will apply when configuration is saved. Do you want to proceed?'))) {
        element.delete = true
      }
    },
    cloneRecipe: function (recipe) {
      let r = {
        id: Math.round(Math.random() * 1000) + 10000,
        recipe: recipe.id,
        recipe_name: recipe.name,
        servings: (this.new_note_servings > 1) ? this.new_note_servings : recipe.servings,
        title: this.new_note_title,
        note: this.new_note_text,
        is_new: true
      }

      this.new_note_title = ''
      this.new_note_text = ''
      this.new_note_servings = ''

      return r
    },
    cloneNote: function () {
      let new_entry = {
        id: Math.round(Math.random() * 1000) + 10000,
        title: this.new_note_title,
        note: this.new_note_text,
        servings: 1,
        is_new: true,
      }

      if (new_entry.title === '') {
        new_entry.title = this.gettext('Title')
      }

      this.new_note_title = ''
      this.new_note_text = ''
      this.new_note_servings = ''
      return new_entry
    },
    planElementName: function (element) {
      if (element.title) {
        return element.title
      } else if (element.recipe_name) {
        return element.recipe_name
      } else {
        return element.name
      }
    },
    planDetailRecipeUrl: function () {
      return "{% url 'view_recipe' 12345 %}".replace(/12345/, this.plan_detail.recipe);
    },
    planDetailEditUrl: function () {
      return "{% url 'edit_meal_plan' 12345 %}".replace(/12345/, this.plan_detail.id);
    },
    planDetailUserList: function () {
      let users = []
      for (let u of this.plan_detail.shared) {
        users.push(this.user_names[u])
      }
      return users.join(', ')
    },
    formatLocalDate: function (date) {
      return moment(date).format('LL')
    },
    formatDateDay: function (date) {
      return moment(date).format('D')
    },
    formatDateDayname: function (date) {
      return moment(date).format('dddd')
    },
    changeStartDate: function (change) {
      this.start_date = moment(this.start_date).add(change, 'days').format('YYYY-MM-DD')
      this.updatePlan();
    },
    getShoppingUrl: function () {
      let url = "{% url 'view_shopping' %}"
      let first = true
      for (let se of this.shopping_list) {
        if (first) {
          url += `?r=[${se.recipe},${se.servings}]`
          first = false
        } else {
          url += `&r=[${se.recipe},${se.servings}]`
        }
      }
      return url
    },
    getIcalUrl: function () {
      if (this.dates.length === 0) {
        return ""
      }
      return "{% url 'api_get_plan_ical' 12345 6789 %}".replace(/12345/, this.dates[0].format('YYYY-MM-DD')).replace(/6789/, this.dates[this.dates.length - 1].format('YYYY-MM-DD'));
    },
    addDayToShopping: function (date) {
      for (let t of this.meal_types) {
        for (let i of this.meal_plan[t.name].days[date.format('YYYY-MM-DD')].items) {
          if (!this.shopping_list.includes(i)) {
            this.shopping_list.push(i)
          }
        }
      }
    }
  }
}
</script>
