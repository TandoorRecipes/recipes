<template>

    <div>
        <iframe :src="pdfUrl" width="100%" height="700px" style="border: none;"></iframe>
    </div>

</template>

<script>

import {resolveDjangoStatic, resolveDjangoUrl, ResolveUrlMixin} from "@/utils/utils";


export default {
    name: 'PdfViewer',
    mixins: [
        ResolveUrlMixin
    ],
    props: {
        recipe: Object,
    },
    computed: {
        pdfUrl: function () {
            return resolveDjangoStatic('pdfjs/viewer.html?file=' + resolveDjangoUrl('api_get_recipe_file', (this.recipe.id)))
        }
    },
}
</script>
