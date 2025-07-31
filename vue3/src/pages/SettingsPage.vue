<template>
    <v-container>
        <v-row>
            <v-col cols="12" md="3" offset-md="1" offset-xl="2" xl="2">
                <v-list class="bg-transparent">
                    <v-list-item :to="{name: 'AccountSettings'}" prepend-icon="fa-solid fa-user">{{ $t('Profile') }}</v-list-item>

                    <v-divider></v-divider>
                    <v-list-subheader>{{ $t('Settings') }}</v-list-subheader>
                    <v-list-item :to="{name: 'CosmeticSettings'}" prepend-icon="fa-solid fa-palette">{{ $t('Cosmetic') }}</v-list-item>
                    <v-list-item :to="{name: 'ShoppingSettings'}" prepend-icon="$shopping">{{ $t('Shopping_list') }}</v-list-item>
                    <v-list-item :to="{name: 'MealPlanSettings'}" prepend-icon="$mealplan">{{ $t('Meal_Plan') }}</v-list-item>
                    <v-list-item :to="{name: 'SearchSettings'}" prepend-icon="$search">{{ $t('Search') }}</v-list-item>
                    <v-divider></v-divider>
                    <v-list-subheader>Space</v-list-subheader>
                    <v-list-item :to="{name: 'UserSpaceSettings'}" prepend-icon="$spaces">{{ $t('YourSpaces') }}</v-list-item>
                    <v-list-item :to="{name: 'SpaceSettings'}" prepend-icon="$settings">{{ $t('SpaceSettings') }}</v-list-item>
                    <v-list-item :to="{name: 'SpaceMemberSettings'}" prepend-icon="fa-solid fa-users">{{ $t('SpaceMembers') }}</v-list-item>
                    <v-list-item :to="{name: 'OpenDataImportSettings'}" prepend-icon="fa-solid fa-cloud-arrow-down">{{ $t('Open_Data_Import') }}</v-list-item>
                    <v-list-item :to="{name: 'ExportDataSettings'}" prepend-icon="fa-solid fa-file-export">{{ $t('Export') }}</v-list-item>
                    <v-divider></v-divider>
                    <v-list-subheader>Admin</v-list-subheader>
                    <v-list-item :to="{name: 'ApiSettings'}" prepend-icon="fa-solid fa-code">{{ $t('API') }}</v-list-item>
                    <v-list-item :href="getDjangoUrl('system')" target="_blank" prepend-icon="fa-solid fa-server">{{ $t('System') }}</v-list-item>
                </v-list>

            </v-col>
            <v-col cols="12" md="7" xl="6">
                <router-view/>

            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">

import {useDjangoUrls} from "@/composables/useDjangoUrls";

const {getDjangoUrl} = useDjangoUrls()

</script>


<style scoped>

</style>