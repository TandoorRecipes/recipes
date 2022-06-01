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


        <div class="row mt-2">
            <div class="col col-12">
                <button @click="show_invite_create = true">Create</button>
                <div v-if="invite_links !== undefined">
                    <table class="table">
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>{{ $t('Email') }}</th>
                            <th>{{ $t('Group') }}</th>
                            <th>{{ $t('Token') }}</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tr v-for="il in invite_links" :key="il.id">
                            <td>{{ il.id }}</td>
                            <td>{{ il.email }}</td>
                            <td>
                                <generic-multiselect
                                    class="input-group-text m-0 p-0"
                                    @change="il.group = $event.val;"
                                    label="name"
                                    :initial_single_selection="il.group"
                                    :model="Models.GROUP"
                                    style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
                                    :limit="10"
                                    :multiple="false"
                                />
                            </td>
                            <td><input class="form-control" disabled v-model="il.uuid"></td>
                            <td><input type="date" v-model="il.valid_until" class="form-control"></td>
                            <td>
                                <b-dropdown no-caret right>
                                    <template #button-content>
                                        <i class="fas fa-ellipsis-v"></i>
                                    </template>

                                    <b-dropdown-item>
                                        <i class="fas fa-share-alt"></i>
                                    </b-dropdown-item>

                                    <b-dropdown-item>
                                        <i class="fas fa-link"></i>
                                    </b-dropdown-item>

                                    <b-dropdown-item>
                                        <i class="far fa-clipboard"></i>
                                    </b-dropdown-item>

                                    <b-dropdown-item>
                                        {{ $t('Delete') }}
                                    </b-dropdown-item>


                                </b-dropdown>

                            </td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>

        <generic-modal-form :model="Models.INVITE_LINK" :action="Actions.CREATE" :show="show_invite_create"
                            @finish-action="show_invite_create = false; loadInviteLinks()"/>

    </div>
</template>

<script>
import Vue from "vue"
import {BootstrapVue} from "bootstrap-vue"

import "bootstrap-vue/dist/bootstrap-vue.css"

import {ApiMixin, ResolveUrlMixin, StandardToasts, ToastMixin} from "@/utils/utils"

import {ApiApiFactory} from "@/utils/openapi/api.ts"
import GenericMultiselect from "@/components/GenericMultiselect";
import GenericModalForm from "@/components/Modals/GenericModalForm";

Vue.use(BootstrapVue)

export default {
    name: "SupermarketView",
    mixins: [ResolveUrlMixin, ToastMixin, ApiMixin],
    components: {GenericMultiselect, GenericModalForm},
    data() {
        return {
            space: undefined,
            user_spaces: [],
            invite_links: [],
            show_invite_create: false
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
        this.loadInviteLinks()
    },
    methods: {
        loadInviteLinks: function () {
            let apiFactory = new ApiApiFactory()
            apiFactory.listInviteLinks().then(r => {
                this.invite_links = r.data
            })
        },
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
