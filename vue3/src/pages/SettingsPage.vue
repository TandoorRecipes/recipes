<template>
    <v-container>

        <v-row>
            <v-col cols="12" md="3" offset-md="1" offset-xl="2" xl="2">
                <v-list class="bg-transparent">
                    <v-list-item :to="{name: 'view_settings_account'}" prepend-icon="fa-solid fa-user">{{ $t('Profile') }}</v-list-item>

                    <v-divider></v-divider>
                    <v-list-subheader>{{ $t('Settings') }}</v-list-subheader>
                    <v-list-item :to="{name: 'view_settings_cosmetic'}" prepend-icon="fa-solid fa-palette">{{ $t('Cosmetic') }}</v-list-item>
                    <v-list-item :to="{name: 'view_settings_shopping'}" prepend-icon="$shopping">{{ $t('Shopping_list') }}</v-list-item>
                    <v-list-item :to="{name: 'view_settings_mealplan'}" prepend-icon="$mealplan">{{ $t('Meal_Plan') }}</v-list-item>
<!--                    <v-list-item prepend-icon="$search">{{ $t('Search') }}</v-list-item>-->
                    <v-divider></v-divider>
                    <v-list-subheader>Space</v-list-subheader>
                    <v-list-item :to="{name: 'view_settings_user_space'}" prepend-icon="$spaces">{{ $t('YourSpaces') }}</v-list-item>
                    <v-list-item :to="{name: 'view_settings_space'}" prepend-icon="$settings">{{ $t('SpaceSettings') }}</v-list-item>
                    <v-list-item :to="{name: 'view_settings_space_member'}" prepend-icon="fa-solid fa-users">{{ $t('SpaceMembers') }}</v-list-item>
                    <v-divider></v-divider>
                    <v-list-subheader>Admin</v-list-subheader>
                    <v-list-item :to="{name: 'view_settings_api'}" prepend-icon="fa-solid fa-code">{{ $t('API') }}</v-list-item>
                    <v-list-item prepend-icon="fa-solid fa-server">{{ $t('System') }}</v-list-item>
                </v-list>

            </v-col>
            <v-col cols="12" md="7" xl="6">
                <router-view/>

            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">


import AccountSettings from "@/components/settings/AccountSettings.vue";

const props = defineProps({
    page: {type: String, default: 'ACCOUNT'}
})
</script>


<style scoped>

</style>