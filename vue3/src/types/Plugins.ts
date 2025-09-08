import {RouteRecordRaw} from "vue-router";
import {Component} from "vue";

export type TandoorPlugin = {
    name: string,
    basePath: string,
    defaultLocale: any,
    localeFiles: any,
    routes: RouteRecordRaw[]

    navigationDrawer: any[],
    bottomNavigation: any[],
    userNavigation: any[],

    buildInputs?: string[],

    databasePageComponent?: Component,

    disabled?: boolean
}

export type PluginModule = {
  plugin: TandoorPlugin
}

const pluginModules = import.meta.glob('@/plugins/*/plugin.ts', { eager: true })
export let TANDOOR_PLUGINS = [] as TandoorPlugin[]
Object.values(pluginModules).forEach(module => {
    if(!module.plugin.disabled){
        TANDOOR_PLUGINS.push(module.plugin)
    }
})