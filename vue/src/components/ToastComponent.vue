

<script>
export default {
  name: 'HelloWorld',
  methods: {
    makeToastComponent: function (title, message, variant = null) {
      this.$bvToast.toast(message, {
        title: title,
        variant: variant,
        toaster: 'b-toaster-top-center',
        solid: true
      })
    }
  }
}
</script>

