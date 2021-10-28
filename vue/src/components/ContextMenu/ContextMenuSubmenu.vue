<template>
    <div>
        <div style="position: static;" class=" btn-group">
            <div class="dropdown b-dropdown position-static">
                <li @click="$refs.submenu.open($event)" role="presentation" class="btn dropdown-toggle btn-link text-decoration-none text-body pr-1 dropdown-toggle-no-caret">
                    <slot />
                </li>
            </div>
        </div>
        <ContextMenu ref="submenu">
            <template #menu="{ contextData }">
                <ContextMenuItem
                    @click="
                        $refs.menu.close()
                        moveEntry(contextData)
                    "
                >
                    <a class="dropdown-item p-2" href="#"><i class="fas fa-cubes"></i> submenu item</a>
                </ContextMenuItem>
            </template>
        </ContextMenu>
    </div>
</template>

<script>
import ContextMenu from "@/components/ContextMenu/ContextMenu"
import ContextMenuItem from "@/components/ContextMenu/ContextMenuItem"
export default {
    name: "ContextSubmenu.vue",
    components: { ContextMenu, ContextMenuItem },
}
</script>

<style scoped></style>
