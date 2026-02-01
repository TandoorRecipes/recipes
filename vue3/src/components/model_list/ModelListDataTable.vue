<script lang="ts">
import {defineComponent, h, useSlots} from 'vue'
import {VDataTableServer} from 'vuetify/components'

/**
 * Thin wrapper around VDataTableServer that merges static template slots
 * with dynamically generated slots (passed as `dynamicSlots` prop).
 *
 * Static template slots (from parent) take priority over dynamic ones
 * for the same key, so there's no conflict.
 */
export default defineComponent({
    name: 'ModelListDataTable',
    inheritAttrs: false,
    props: {
        dynamicSlots: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props, {attrs, slots}) {
        return () => {
            // Merge: static template slots override dynamic ones
            const mergedSlots = {...props.dynamicSlots, ...slots}
            return h(VDataTableServer, attrs, mergedSlots)
        }
    },
})
</script>
