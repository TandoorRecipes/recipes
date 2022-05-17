<template>

  <div>

    <div v-if="isImage()">
      <b-img :src="url" :alt="$t('Image')" class="w-100"></b-img>
    </div>

    <div v-else-if="url.toLowerCase().includes('.pdf')">
      <iframe :src="`/static/pdfjs/viewer.html?file=${url}`" class="w-100" style="border: none; height: 30vh"></iframe>
    </div>

    <div v-else>
      <div class="h-20 w-100 border border-primary rounded text-center">
        <i class="fas fa-eye-slash fa-2x text-primary mt-2"></i>
        <br/>
        <a :href="url" target="_blank" rel="noreferrer nofollow" class="mt-4" download>{{$t('Download')}}</a>
      </div>
    </div>

  </div>

</template>

<script>

export default {
  name: 'FileViewer',
  props: {
    url: String,
  },
  methods: {
    isImage: function (){
      let cleaned_url = this.url.toLowerCase()
      return (cleaned_url.endsWith('.png') || cleaned_url.endsWith('.jpg') || cleaned_url.endsWith('.jpeg') || cleaned_url.endsWith('.gif'))
    }
  }
}
</script>
