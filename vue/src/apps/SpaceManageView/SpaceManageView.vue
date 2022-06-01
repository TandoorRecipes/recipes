<template>
    <div id="app">

        <div class="row  mt-2">
            <div class="col col-12">
                <div v-if="space !== undefined">
                    Recipes {{ space.recipe_count }} / {{ space.max_recipes }}
                    Users {{ space.user_count }} / {{ space.max_users }}
                    Files {{ space.file_size_mb }} / {{ space.max_file_storage_mb }}
                </div>
            </div>
        </div>

        <div class="row mt-2">
            <div class="col col-12">
                <div v-if="user_spaces !== undefined">
                    <table class="table">
                        <thead>
                        <tr>
                            <th>{{ $t('User') }}</th>
                            <th>{{ $t('Groups') }}</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tr v-for="us in user_spaces" :key="us.id">
                            <td>{{ us.user.username }}</td>
                            <td>
                                <generic-multiselect
                                    class="input-group-text m-0 p-0"
                                    @change="us.groups = $event.val; updateUserSpace(us)"
                                    label="name"
                                    :initial_selection="us.groups"
                                    :model="Models.GROUP"
                                    style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
                                    :limit="10"
                                    :multiple="true"
                                />
                            </td>
                            <td>
                                <button class="btn btn-danger" @click="deleteUserSpace(us)">{{ $t('Delete') }}</button>
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>


    </div>
</template>

<script>
import Vue from "vue"
import {BootstrapVue} from "bootstrap-vue"

import "bootstrap-vue/dist/bootstrap-vue.css"

import {ApiMixin, ResolveUrlMixin, StandardToasts, ToastMixin} from "@/utils/utils"

import {ApiApiFactory} from "@/utils/openapi/api.ts"
import GenericMultiselect from "@/components/GenericMultiselect";

Vue.use(BootstrapVue)

export default {
    name: "SupermarketView",
    mixins: [ResolveUrlMixin, ToastMixin, ApiMixin],
    components: {GenericMultiselect},
    data() {
        return {
            space: undefined,
            user_spaces: []
        }
    },
    mounted() {
        this.$i18n.locale = window.CUSTOM_LOCALE

        let apiFactory = new ApiApiFactory()
        apiFactory.retrieveSpace(window.ACTIVE_SPACE_ID).then(r => {
            this.space = r.data
        })
        apiFactory.listUserSpaces().then(r => {
            this.user_spaces = r.data
        })
    },
    methods: {
        updateUserSpace: function (userSpace) {
            let apiFactory = new ApiApiFactory()
            apiFactory.partialUpdateUserSpace(userSpace.id, userSpace).then(r => {
                StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_UPDATE)
            }).catch(err => {
                StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
            })
        },
        deleteUserSpace: function (userSpace) {
            if (confirm(this.$t('confirm_delete', {object: this.$t("User")}))) {
                let apiFactory = new ApiApiFactory()
                apiFactory.destroyUserSpace(userSpace.id).then(r => {
                    this.user_spaces = this.user_spaces.filter(u => u !== userSpace)
                    StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_DELETE)
                }).catch(err => {
                    StandardToasts.makeStandardToast(this, StandardToasts.FAIL_DELETE, err)
                })
            }
        }
    },
}
</script>

<style></style>
