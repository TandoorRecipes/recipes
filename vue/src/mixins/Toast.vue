<script>
let toast_mixin = Vue.mixin({
  methods: {
    makeToast: function (title, message, variant = null) {
      this.$bvToast.toast(message, {
        title: title,
        variant: variant,
        toaster: 'b-toaster-top-center',
        solid: true
      })
    }
  }
})
</script>