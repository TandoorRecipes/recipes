<template>
    <div id="app">

        <div class="row  mt-2">
            <div class="col col-12">
                <div v-if="space !== undefined">
                    <h6><i class="fas fa-book"></i> {{ $t('Recipes') }}</h6>
                    <b-progress height="1.5rem" :max="space.max_recipes" variant="success" :striped="true">
                        <b-progress-bar :value="space.recipe_count">
                            {{ space.recipe_count }} /
                            <template v-if="space.max_recipes === 0">∞</template>
                            <template v-else>{{ space.max_recipes }}</template>
                        </b-progress-bar>
                    </b-progress>

                    <h6 class="mt-2"><i class="fas fa-users"></i> {{ $t('Users') }}</h6>
                    <b-progress height="1.5rem" :max="space.max_users" variant="success" :striped="true">
                        <b-progress-bar :value="space.user_count">
                            {{ space.user_count }} /
                            <template v-if="space.max_users === 0">∞</template>
                            <template v-else>{{ space.max_users }}</template>
                        </b-progress-bar>
                    </b-progress>

                    <h6 class="mt-2"><i class="fas fa-file"></i> {{ $t('Files') }}</h6>
                    <b-progress height="1.5rem" :max="space.max_file_storage_mb" variant="success" :striped="true">
                        <b-progress-bar :value="space.file_size_mb">
                            {{ space.file_size_mb }} /
                            <template v-if="space.max_file_storage_mb === 0">∞</template>
                            <template v-else>{{ space.max_file_storage_mb }}</template>
                        </b-progress-bar>
                    </b-progress>

                </div>
            </div>
        </div>

        <div class="row mt-4">
            <div class="col col-12">
                <div v-if="user_spaces !== undefined">
                    <h4 class="mt-2"><i class="fas fa-users"></i> {{ $t('Users') }}</h4>
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
                <div v-if="invite_links !== undefined">
                    <h4 class="mt-2"><i class="fas fa-users"></i> {{ $t('Invites') }}</h4>
                    <table class="table">
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>{{ $t('Email') }}</th>
                            <th>{{ $t('Group') }}</th>
                            <th></th>
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
                            <td><input type="date" v-model="il.valid_until" class="form-control"></td>
                            <td>
                                <b-dropdown no-caret right>
                                    <template #button-content>
                                        <i class="fas fa-ellipsis-v"></i>
                                    </template>

                                    <!--                                    <b-dropdown-item>-->
                                    <!--                                        <i class="fas fa-share-alt"></i>-->
                                    <!--                                    </b-dropdown-item>-->

                                    <b-dropdown-item @click="copyToClipboard(il, true)">
                                        <i class="fas fa-link"></i> {{ $t('Copy Link') }}
                                    </b-dropdown-item>

                                    <b-dropdown-item @click="copyToClipboard(il, false)">
                                        <i class="far fa-clipboard"></i> {{ $t('Copy Token') }}
                                    </b-dropdown-item>

                                    <b-dropdown-item @click="deleteInviteLink(il)">
                                        <i class="fas fa-trash-alt"></i> {{ $t('Delete') }}
                                    </b-dropdown-item>


                                </b-dropdown>

                            </td>
                        </tr>
                    </table>
                    <b-button variant="primary" @click="show_invite_create = true">{{ $t('Create') }}</b-button>
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
        copyToClipboard: function (inviteLink, link) {
            let content = inviteLink.uuid
            if (link) {
                content = localStorage.BASE_PATH + this.resolveDjangoUrl('view_invite', inviteLink.uuid)
            }
            navigator.clipboard.writeText(content)
        },
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
        },
        deleteInviteLink: function (inviteLink) {
            let apiFactory = new ApiApiFactory()
            apiFactory.destroyInviteLink(inviteLink.id).then(r => {
                this.invite_links = this.invite_links.filter(i => i !== inviteLink)
                StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_DELETE)
            }).catch(err => {
                StandardToasts.makeStandardToast(this, StandardToasts.FAIL_DELETE, err)
            })

        },
    },
}
</script>

<style></style>
