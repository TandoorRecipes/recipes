import {RouteRecordRaw} from "vue-router";
import {Component} from "vue";

export type TandoorPlugin = {
    name: string,
    basePath: string,
    defaultLocale: any,
    localeFiles: any,

    routes: RouteRecordRaw[]
    settingRoutes?: RouteRecordRaw[],

    navigationDrawer: any[],
    bottomNavigation: any[],
    userNavigation: any[],

    buildInputs?: string[],

    databasePageComponent?: Component,
    settingsComponent?: Component,

    disabled?: boolean
}

export type PluginModule = {
  plugin: TandoorPlugin
}