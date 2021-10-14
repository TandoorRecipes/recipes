<template>
  <b-alert show variant="warning">
    <b-badge>BETA</b-badge>
    {{ $t('warning_feature_beta') }}
  </b-alert>
</template>

<script>
export default {
  name: "BetaWarning"
}
</script>

<style scoped>

</style>