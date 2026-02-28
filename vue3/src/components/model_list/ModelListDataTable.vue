<script lang="ts">
import {type Component, defineComponent, h} from 'vue'
import {VDataTableServer} from 'vuetify/components'

/**
 * Thin wrapper around VDataTableServer that merges static template slots
 * with programmatic slots (passed via `dynamicSlots` prop).
 *
 * Needed because Vue 3 templates cannot generate multiple named slots
 * via iteration (v-for + v-slot is a compiler error), but the column
 * system requires dynamic per-column cell slots driven by model config.
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
            return h(VDataTableServer as Component, attrs, mergedSlots)
        }
    },
})
</script>
