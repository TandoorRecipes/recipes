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
}

const pluginModules = import.meta.glob('@/plugins/*/plugin.ts', { eager: true })
export let TANDOOR_PLUGINS = [] as TandoorPlugin[]
Object.values(pluginModules).forEach(module => {
    TANDOOR_PLUGINS.push(module.plugin)
})