<template>
    <b-input-group class="mt-2">
        <treeselect
            v-model="settings.search_keywords"
            :options="facets.Keywords"
            :load-options="loadChildren"
            :multiple="true"
            :flat="true"
            :auto-load-root-options="false"
            searchNested
            :placeholder="$t('Keywords')"
            :normalizer="normalizer"
            @input="refreshData(false)"
            style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
        />
        <b-input-group-append>
            <b-input-group-text>
                <b-form-checkbox v-model="settings.search_keywords_or" name="check-button" @change="refreshData(false)" class="shadow-none" switch size="sm">
                    <span class="text-uppercase" v-if="settings.search_keywords_or">{{ $t("or") }}</span>
                    <span class="text-uppercase" v-else>{{ $t("and") }}</span>
                </b-form-checkbox>
            </b-input-group-text>
        </b-input-group-append>
    </b-input-group>
</template>

<script>
import { Treeselect, LOAD_CHILDREN_OPTIONS } from "@riophae/vue-treeselect"
import "@riophae/vue-treeselect/dist/vue-treeselect.css"

export default {
    name: "AdvancedTreeSelect",
    props: {
        selected: { type: Array },
    },
    components: { Treeselect },
    data() {
        return {
            shopping: false,
        }
    },
    mounted() {},
    computed: {},
    watch: {},
    methods: {
        loadChildren: function ({ action, parentNode, callback }) {
            if (action === LOAD_CHILDREN_OPTIONS) {
                if (this.facets?.cache_key) {
                    this.getFacets(this.facets.cache_key, "keyword", parentNode.id).then(callback())
                }
            }
        },
    },
}
</script>
