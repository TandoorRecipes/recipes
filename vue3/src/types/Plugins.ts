import {RouteRecordRaw} from "vue-router";

export type TandoorPlugin = {
    name: string,
    basePath: string,
    defaultLocale: any,
    localeFiles: any,
    routes: RouteRecordRaw[]

    navigationDrawer: any[],
    bottomNavigation: any[],
    userNavigation: any[],

    disabled?: boolean
}

const pluginModules = import.meta.glob('@/plugins/*/plugin.ts', { eager: true })
export let TANDOOR_PLUGINS = [] as TandoorPlugin[]
Object.values(pluginModules).forEach(module => {
    if(!module.plugin.disabled){
        TANDOOR_PLUGINS.push(module.plugin)
    }
})