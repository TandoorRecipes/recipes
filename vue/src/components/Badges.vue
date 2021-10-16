<template>
    <span>
        <linked-recipe v-if="linkedRecipe"
            :item="item"/>
        <icon-badge v-if="Icon"
            :item="item"/>
    </span>
</template>

<script>
import LinkedRecipe from "@/components/Badges/LinkedRecipe";
import IconBadge from "@/components/Badges/Icon";

export default {
  name: 'CardBadges',
  components: {LinkedRecipe, IconBadge},
  props: {
    item: {type: Object},
    model: {type: Object}
  },
  data() {
    return {
    }
  },
  mounted() {
  },
  computed: {
    linkedRecipe: function () {
        return this.model?.badges?.linked_recipe ?? false
    },
    Icon: function () {
        return this.model?.badges?.icon ?? false
    }
  },
  watch: {
  },
  methods: {
  }
}
</script>