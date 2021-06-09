<template>

  <div>
    <b-button v-b-modal="'modal-file-editor'+file_id" v-bind:class="{'btn-success': (file_id === undefined)}">
      <template v-if="this.file_id">{{ $t('Edit') }}</template>
      <template v-else>{{ $t('New') }}</template>
    </b-button>

    <b-modal :id="'modal-file-editor'+file_id" v-bind:title="$t('File')" @ok="modalOk()">
      <template v-if="file!==undefined">
        {{ $t('Name') }}
        <b-input v-model="file.name"></b-input>
        <br/>
        {{ $t('File') }}
        <b-form-file v-model="file.file"></b-form-file>
      </template>
      <br/>
      <br/>
      <template #modal-footer="">
        <b-button size="sm" variant="success" @click="modalOk()">
          {{ $t('Ok') }}
        </b-button>

        <b-button size="sm" variant="secondary" @click="$bvModal.hide('modal-file-editor'+file_id)">
          {{ $t('Cancel') }}
        </b-button>

        <b-button size="sm" variant="danger" @click="deleteFile()">
          {{ $t('Delete') }}
        </b-button>
      </template>

    </b-modal>
  </div>
</template>

<script>
import {ApiApiFactory} from "@/utils/openapi/api";
import {makeToast} from "@/utils/utils";

export default {
  name: "FileEditor",
  data() {
    return {
      file: undefined
    }
  },
  props: {
    file_id: Number,
  },
  mounted() {
    if (this.file_id !== undefined) {
      this.loadFile(this.file_id.toString())
    } else {
      this.file = {
        name: '',
        file: undefined
      }
    }
  },
  methods: {
    loadFile: function (id) {
      let apiClient = new ApiApiFactory()

      apiClient.retrieveUserFile(id).then(result => {
        this.file = result.data
      })
    },
    modalOk: function () {
      if (this.file_id === undefined) {
        console.log('CREATING')
        this.createFile()
      } else {
        console.log('UPDATING')
        this.updateFile()
      }
    },
    updateFile: function () {
      let apiClient = new ApiApiFactory()

      let passedFile = undefined
      if (!(typeof this.file.file === 'string' || this.file.file instanceof String)) { // only update file if it was changed
        passedFile = this.file.file
      }

      apiClient.updateUserFile(this.file.id, this.file.name, passedFile).then(request => {
        makeToast(this.$t('Success'), this.$t('success_updating_resource'), 'success')
        this.$emit('change',)
      }).catch(err => {
        makeToast(this.$t('Error'), this.$t('err_updating_resource') + '\n' + err.response.data, 'danger')
        console.log(err.request, err.response)
      })
    },
    createFile: function () {
      let apiClient = new ApiApiFactory()

      apiClient.createUserFile(this.file.name, this.file.file).then(request => {
        makeToast(this.$t('Success'), this.$t('success_creating_resource'), 'success')
        this.$emit('change',)
        this.file = {
          name: '',
          file: undefined
        }
      }).catch(err => {
        makeToast(this.$t('Error'), this.$t('err_creating_resource') + '\n' + err.response.data, 'danger')
        console.log(err.request, err.response)
      })
    },
    deleteFile: function () {
      let apiClient = new ApiApiFactory()

      apiClient.destroyUserFile(this.file.id).then(results => {
        makeToast(this.$t('Success'), this.$t('success_deleting_resource'), 'success')
        this.$emit('change',)
      }).catch(err => {
        makeToast(this.$t('Error'), this.$t('err_deleting_resource') + '\n' + err.response.data, 'danger')
        console.log(err.request, err.response)
      })
    }
  }
}
</script>
