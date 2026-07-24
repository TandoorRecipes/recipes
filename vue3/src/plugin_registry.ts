import type {TandoorPlugin, PluginModule} from "@/types/Plugins.ts";

// Runtime plugin discovery. Kept OUT of src/types/Plugins.ts (which stays a
// pure-type module) so vite.config.ts can import the types without pulling this
// Vite-only `import.meta.glob` runtime into the tsconfig.node project.
const pluginModules = import.meta.glob<PluginModule>('@/plugins/*/plugin.ts', {eager: true})
export let TANDOOR_PLUGINS = [] as TandoorPlugin[]
Object.values(pluginModules).forEach(module => {
    if (!module.plugin.disabled) {
        TANDOOR_PLUGINS.push(module.plugin)
    }
})
