<template>
    <!-- bottom button nav -->
    <div class="fixed-bottom p-1 pt-2 pl-2 pr-2 border-top text-center d-lg-none d-print-none bottom-action-bar bg-white">

        <slot name="custom_nav_content">

        </slot>


        <div class="d-flex flex-row justify-content-around">
            <div class="flex-column" v-if="show_button_1">
                <slot name="button_1">
                    <a class="nav-link bottom-nav-link p-0" v-bind:class="{'bottom-nav-link-active': activeView === 'view_search' }" v-bind:href="resolveDjangoUrl('view_search')">
                        <i class="fas fa-fw fa-book " style="font-size: 1.4em"></i><br/><small>{{ $t('Recipes') }}</small></a> <!-- TODO localize -->
                </slot>

            </div>
            <div class="flex-column" v-if="show_button_2">
                <slot name="button_2">
                    <a class="nav-link bottom-nav-link p-0" v-bind:class="{'bottom-nav-link-active': activeView === 'view_plan' }" v-bind:href="resolveDjangoUrl('view_plan')">
                        <i class="fas fa-calendar-alt" style="font-size: 1.4em"></i><br/><small>{{ $t('Meal_Plan') }}</small></a>
                </slot>

            </div>
            <div class="flex-column" v-if="show_button_create">
                <slot name="button_create">
                    <div class="dropup">
                        <a class="nav-link bottom-nav-link p-0" href="#" id="navbarDropdownMenuLink" data-toggle="dropdown"
                           aria-haspopup="true" aria-expanded="false"><i class="fas fa-plus-circle fa-2x bottom-nav-link bottom-nav-link-active"></i>
                        </a>
                        <div class="dropdown-menu center-dropup" aria-labelledby="navbarDropdownMenuLink">

                            <a class="dropdown-item" v-bind:href="resolveDjangoUrl('new_recipe')"><i
                                class="fas fa-fw fa-plus"></i> {{ $t('Create Recipe') }}</a>
                            <a class="dropdown-item" v-bind:href="resolveDjangoUrl('data_import_url')"><i
                                class="fas fa-fw fa-file-import"></i> {{ $t('Import Recipe') }}</a>
                            <div class="dropdown-divider" v-if="create_links.length > 0"></div>

                            <slot name="custom_create_functions">

                            </slot>

                            <a class="dropdown-item" v-bind:href="cl.url" v-for="cl in create_links" v-bind:key="cl.label">
                                <i :class="cl.icon + ' fa-fw'"></i> {{ cl.label }}
                            </a>
                        </div>


                    </div>
                </slot>

            </div>
            <div class="flex-column" v-if="show_button_3">
                <slot name="button_3">
                    <a class="nav-link bottom-nav-link p-0" v-bind:class="{'bottom-nav-link-active': activeView === 'view_shopping' }" v-bind:href="resolveDjangoUrl('view_shopping')">
                        <i class="fas fa-shopping-cart" style="font-size: 1.4em"></i><br/><small>{{ $t('Shopping_list') }}</small></a>
                </slot>
            </div>
            <div class="flex-column">

                <slot name="button_4" v-if="show_button_4">
                    <a class="nav-link bottom-nav-link p-0" v-bind:class="{'bottom-nav-link-active': activeView === 'view_books' }" v-bind:href="resolveDjangoUrl('view_books')">
                        <i class="fas fa-book-open" style="font-size: 1.4em"></i><br/><small>{{ $t('Books') }}</small></a> <!-- TODO localize -->
                </slot>

            </div>
        </div>

    </div>
</template>

<script>
import {ResolveUrlMixin} from "@/utils/utils";

export default {
    name: "BottomNavigationBar",
    mixins: [ResolveUrlMixin],
    props: {
        create_links: {
            type: Array, default() {
                return []
            }
        },
        show_button_1: {type: Boolean, default: true},
        show_button_2: {type: Boolean, default: true},
        show_button_3: {type: Boolean, default: true},
        show_button_4: {type: Boolean, default: true},
        show_button_create: {type: Boolean, default: true},
        activeView: {type: String, default: ""}
    }
}
</script>

<style scoped>

.bottom-nav-link {
    color: #666666
}

.bottom-nav-link-active {
    color: var(--primary);
}

.center-dropup {
    right: auto;
    left: 50%;
    -webkit-transform: translate(-50%, 0);
    -o-transform: translate(-50%, 0);
    transform: translate(-50%, 0);
}
</style>
