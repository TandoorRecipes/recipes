<template>
    <div id="app">

        <div class="row  mt-2">
            <div class="col col-12">
                <div v-if="space !== undefined">
                    <h6><i class="fas fa-book"></i> {{ $t('Recipes') }}</h6>
                    <b-progress height="1.5rem" :max="space.max_recipes" variant="success" :striped="true">
                        <b-progress-bar :value="space.recipe_count" class="text-dark font-weight-bold">
                            {{ space.recipe_count }} /
                            <template v-if="space.max_recipes === 0">∞</template>
                            <template v-else>{{ space.max_recipes }}</template>
                        </b-progress-bar>
                    </b-progress>

                    <h6 class="mt-2"><i class="fas fa-users"></i> {{ $t('Users') }}</h6>
                    <b-progress height="1.5rem" :max="space.max_users" variant="success" :striped="true">
                        <b-progress-bar :value="space.user_count" class="text-dark font-weight-bold">
                            {{ space.user_count }} /
                            <template v-if="space.max_users === 0">∞</template>
                            <template v-else>{{ space.max_users }}</template>
                        </b-progress-bar>
                    </b-progress>

                    <h6 class="mt-2"><i class="fas fa-file"></i> {{ $t('Files') }}</h6>
                    <b-progress height="1.5rem" :max="space.max_file_storage_mb" variant="success" :striped="true">
                        <b-progress-bar :value="space.file_size_mb" class="text-dark font-weight-bold">
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
                        <tr v-for="il in active_invite_links" :key="il.id">
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

        <div class="row mt-4" v-if="space !== undefined">
            <div class="col col-12">
                <h4 class="mt-2"><i class="fas fa-cogs"></i> {{ $t('Settings') }}</h4>

                <label>{{ $t('Message') }}</label>
                <b-form-textarea v-model="space.message"></b-form-textarea>

                <b-form-checkbox v-model="space.show_facet_count"> Facet Count</b-form-checkbox>
                <span class="text-muted small">{{ $t('facet_count_info') }}</span><br/>

                <label>{{ $t('FoodInherit') }}</label>
                <generic-multiselect :initial_selection="space.food_inherit"
                                     :model="Models.FOOD_INHERIT_FIELDS"
                                     @change="space.food_inherit = $event.val;">
                </generic-multiselect>
                <span class="text-muted small">{{ $t('food_inherit_info') }}</span><br/>

                <a class="btn btn-success" @click="updateSpace()">{{ $t('Update') }}</a><br/>
                <a class="btn btn-warning mt-1" @click="resetInheritance()">{{ $t('reset_food_inheritance') }}</a><br/>
                <span class="text-muted small">{{ $t('reset_food_inheritance_info') }}</span>
            </div>
        </div>

        <div class="row mt-4">
            <div class="col col-12">
                <h4 class="mt-2"><i class="fas fa-trash"></i> {{ $t('Delete') }}</h4>

                {{ $t('warning_space_delete') }}
                <br/>
                <a class="btn btn-danger" :href="resolveDjangoUrl('delete_space', ACTIVE_SPACE_ID)">{{
                        $t('Delete')
                    }}</a>
            </div>
        </div>

        <br/>
        <br/>

        <generic-modal-form :model="Models.INVITE_LINK" :action="Actions.CREATE" :show="show_invite_create"
                            @finish-action="show_invite_create = false; loadInviteLinks()"/>

    </div>
</template>

<script>
import Vue from "vue"
import {BootstrapVue} from "bootstrap-vue"

import "bootstrap-vue/dist/bootstrap-vue.css"

import {ApiMixin, resolveDjangoUrl, ResolveUrlMixin, StandardToasts, ToastMixin} from "@/utils/utils"

import {ApiApiFactory} from "@/utils/openapi/api.ts"
import GenericMultiselect from "@/components/GenericMultiselect";
import GenericModalForm from "@/components/Modals/GenericModalForm";
import axios from "axios";

Vue.use(BootstrapVue)

export default {
    name: "SupermarketView",
    mixins: [ResolveUrlMixin, ToastMixin, ApiMixin],
    components: {GenericMultiselect, GenericModalForm},
    data() {
        return {
            ACTIVE_SPACE_ID: window.ACTIVE_SPACE_ID,
            space: undefined,
            user_spaces: [],
            invite_links: [],
            show_invite_create: false
        }
    },
    computed: {
        active_invite_links: function () {
            return this.invite_links.filter(il => il.used_by === null)
        },
    },
    mounted() {
        this.$i18n.locale = window.CUSTOM_LOCALE

        let apiFactory = new ApiApiFactory()
        apiFactory.retrieveSpace(this.ACTIVE_SPACE_ID).then(r => {
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
        updateSpace: function () {
            let apiFactory = new ApiApiFactory()
            apiFactory.partialUpdateSpace(this.ACTIVE_SPACE_ID, this.space).then(r => {
                StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_UPDATE)
            }).catch(err => {
                StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
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
        resetInheritance: function () {
            axios.get(resolveDjangoUrl('api_reset_food_inheritance')).then(r => {
                StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_UPDATE)
            }).catch(err => {
                StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
            })
        },
    },
}
</script>

<style></style>
