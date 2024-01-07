<template>
    <div id="app">

        <b-row class="mt-2">
            <b-col cols="12">
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
            </b-col>
        </b-row>

        <b-row class="mt-4">
            <b-col cols="12">
                <div v-if="user_spaces !== undefined">
                    <h4><i class="fas fa-users"></i> {{ $t('Users') }}</h4>
                    <table class="table">
                        <thead>
                        <tr>
                            <th>{{ $t('User') }}</th>
                            <th>{{ $t('Groups') }}</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tr v-for="us in user_spaces" :key="us.id">
                            <td>{{ us.user.display_name }}</td>
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
            </b-col>
        </b-row>


        <b-row class="mt-2">
            <b-col cols="12">
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
            </b-col>
        </b-row>

        <b-row class="mt-4" v-if="space !== undefined">
            <b-col cols="12">
                <h4>{{ $t('Cosmetic') }}</h4>
                <b-alert variant="warning" show><i class="fas fa-exclamation-triangle"></i> {{ $t('Space_Cosmetic_Settings') }}</b-alert>

                <b-form-group :label="$t('Image')" :description="$t('CustomImageHelp')">
                    <generic-multiselect :initial_single_selection="space.image"
                                         :model="Models.USERFILE"
                                         :multiple="false"
                                         @change="space.image = $event.val;"></generic-multiselect>
                </b-form-group>

                 <b-form-group :label="$t('Logo')" :description="$t('CustomNavLogoHelp')">
                    <generic-multiselect :initial_single_selection="space.nav_logo"
                                         :model="Models.USERFILE"
                                         :multiple="false"
                                         @change="space.nav_logo = $event.val;"></generic-multiselect>
                </b-form-group>

                <b-form-group :label="$t('Theme')">
                    <b-form-select v-model="space.space_theme">
                        <b-form-select-option value="BLANK">----</b-form-select-option>
                        <b-form-select-option value="TANDOOR">Tandoor</b-form-select-option>
                        <b-form-select-option value="TANDOOR_DARK">Tandoor Dark (Beta)</b-form-select-option>
                        <b-form-select-option value="BOOTSTRAP">Bootstrap</b-form-select-option>
                        <b-form-select-option value="DARKLY">Darkly</b-form-select-option>
                        <b-form-select-option value="FLATLY">Flatly</b-form-select-option>
                        <b-form-select-option value="SUPERHERO">Superhero</b-form-select-option>
                    </b-form-select>
                </b-form-group>


                <b-form-group :label="$t('CustomTheme')" :description="$t('CustomThemeHelp')">
                    <generic-multiselect :initial_single_selection="space.custom_space_theme"
                                         :model="Models.USERFILE"
                                         :multiple="false"
                                         @change="space.custom_space_theme = $event.val;"></generic-multiselect>

                </b-form-group>

                <b-form-group :label="$t('Nav_Color')" :description="$t('Nav_Color_Help')">
                    <b-input-group>
                        <b-form-input type="color" v-model="space.nav_bg_color"></b-form-input>
                        <b-input-group-append>
                            <b-button @click="space.nav_bg_color = ''">{{ $t('Reset') }}</b-button>
                        </b-input-group-append>
                    </b-input-group>
                </b-form-group>

                <b-form-group :label="$t('Nav_Text_Mode')" :description="$t('Nav_Text_Mode_Help')">
                    <b-form-select v-model="space.nav_text_color">
                        <b-form-select-option value="BLANK">----</b-form-select-option>
                        <b-form-select-option value="LIGHT">Light</b-form-select-option>
                        <b-form-select-option value="DARK">Dark</b-form-select-option>
                    </b-form-select>
                </b-form-group>

                <h5>{{ $t('CustomLogos') }}</h5>
                <p>{{$t('CustomLogoHelp')}} </p>
                <b-form-group :label="$t('Logo')+' 32x32px'">
                    <generic-multiselect :initial_single_selection="space.logo_color_32"
                                         :model="Models.USERFILE" :multiple="false" @change="space.logo_color_32 = $event.val;"></generic-multiselect>
                </b-form-group>
                <b-form-group :label="$t('Logo')+' 128x128px'">
                    <generic-multiselect :initial_single_selection="space.logo_color_128"
                                         :model="Models.USERFILE" :multiple="false" @change="space.logo_color_128 = $event.val;"></generic-multiselect>
                </b-form-group>
                <b-form-group :label="$t('Logo')+' 144x144px'">
                    <generic-multiselect :initial_single_selection="space.logo_color_144"
                                         :model="Models.USERFILE" :multiple="false" @change="space.logo_color_144 = $event.val;"></generic-multiselect>
                </b-form-group>
                <b-form-group :label="$t('Logo')+' 180x180px'">
                    <generic-multiselect :initial_single_selection="space.logo_color_180"
                                         :model="Models.USERFILE" :multiple="false" @change="space.logo_color_180 = $event.val;"></generic-multiselect>
                </b-form-group>
                <b-form-group :label="$t('Logo')+' 192x192px'">
                    <generic-multiselect :initial_single_selection="space.logo_color_192"
                                         :model="Models.USERFILE" :multiple="false" @change="space.logo_color_192 = $event.val;"></generic-multiselect>
                </b-form-group>
                <b-form-group :label="$t('Logo')+' 512x512px'">
                    <generic-multiselect :initial_single_selection="space.logo_color_512"
                                         :model="Models.USERFILE" :multiple="false" @change="space.logo_color_512 = $event.val;"></generic-multiselect>
                </b-form-group>
                <b-form-group :label="$t('Logo')+' SVG'">
                    <generic-multiselect :initial_single_selection="space.logo_color_svg"
                                         :model="Models.USERFILE" :multiple="false" @change="space.logo_color_svg = $event.val;"></generic-multiselect>
                </b-form-group>

                <b-button variant="success" @click="updateSpace()">{{ $t('Update') }}</b-button>
            </b-col>
        </b-row>

        <b-row class="mt-4" v-if="space !== undefined">
            <b-col cols="12">
                <h4><i class="fas fa-cogs"></i> {{ $t('Settings') }}</h4>

                <b-form-group :label="$t('Message')">
                    <b-form-textarea v-model="space.message"></b-form-textarea>
                </b-form-group>

                <b-form-group :label="$t('FoodInherit')" :description="$t('food_inherit_info')">
                    <generic-multiselect :initial_selection="space.food_inherit"
                                         :model="Models.FOOD_INHERIT_FIELDS"
                                         @change="space.food_inherit = $event.val;">
                    </generic-multiselect>
                </b-form-group>

                <b-form-group :description="$t('reset_food_inheritance_info')">
                    <b-button-group class="mt-2">
                        <b-button variant="success" @click="updateSpace()">{{ $t('Update') }}</b-button>
                        <b-button variant="warning" @click="resetInheritance()">{{ $t('reset_food_inheritance') }}</b-button>
                    </b-button-group>
                </b-form-group>

            </b-col>
        </b-row>

        <b-row class="mt-4">
            <b-col cols="12">
                <h4>{{ $t('Open_Data_Import') }}</h4>
                <open-data-import-component></open-data-import-component>
            </b-col>

        </b-row>


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
import VueClipboard from 'vue-clipboard2'
import OpenDataImportComponent from "@/components/OpenDataImportComponent.vue";

Vue.use(VueClipboard)

Vue.use(BootstrapVue)

export default {
    name: "SpaceManageView",
    mixins: [ResolveUrlMixin, ToastMixin, ApiMixin],
    components: {GenericMultiselect, GenericModalForm, OpenDataImportComponent},
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
        apiFactory.retrieveSpace(window.ACTIVE_SPACE_ID).then(r => {
            this.space = r.data
        })
        apiFactory.listUserSpaces(1, 25).then(r => { //TODO build proper pagination
            this.user_spaces = r.data.results
        })
        this.loadInviteLinks()
    },
    methods: {
        copyToClipboard: function (inviteLink, link) {
            let content = inviteLink.uuid
            if (link) {
                content = localStorage.BASE_PATH + this.resolveDjangoUrl('view_invite', inviteLink.uuid)
            }
            this.$copyText(content)
        },
        loadInviteLinks: function () {
            let apiFactory = new ApiApiFactory()
            apiFactory.listInviteLinks().then(r => {
                this.invite_links = r.data
            })
        },
        updateSpace: function () {
            let apiFactory = new ApiApiFactory()
            apiFactory.partialUpdateSpace(window.ACTIVE_SPACE_ID, this.space).then(r => {
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
