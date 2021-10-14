<template>
  <div>

    <div v-if="max_file_size_mb === -1">
      <b-alert show variant="warning">
        {{ $t('file_upload_disabled') }}
      </b-alert>
    </div>

    <b-progress :max="progress_max" v-else>
      <b-progress-bar :value="current_file_size_mb" style="text-align: center">
        <span><strong class="text-dark ">{{ current_file_size_mb.toFixed(2) }} / {{ display_max }} MB</strong></span>
      </b-progress-bar>
    </b-progress>

  </div>
</template>

<script>
export default {
  name: "StorageQuota",
  props: {},
  computed: {
    progress_max() {
      if (this.max_file_size_mb === 0) {
        return this.current_file_size_mb * 4
      }
      return this.max_file_size_mb
    },
    display_max(){
      if (this.max_file_size_mb === 0) {
        return '∞'
      }
      return this.max_file_size_mb
    }
  },
  data: function () {
    return {
      current_file_size_mb: window.CURRENT_FILE_SIZE_MB,
      max_file_size_mb: window.MAX_FILE_SIZE_MB
    }
  },
  mounted() {

  },
}
</script>

<style scoped>

</style>