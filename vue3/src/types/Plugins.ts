import {RouteRecordRaw} from "vue-router";
import {Model, registerModel} from "@/types/Models.ts";

export type TandoorPlugin = {
    name: string,
    routes: RouteRecordRaw[]
}
