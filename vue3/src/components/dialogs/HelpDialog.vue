<template>

    <v-dialog height="70vh" activator="parent" v-model="dialog">
        <v-card>
            <v-closable-card-title v-model="dialog" :title="$t('Help')" icon="fa-solid fa-question">
                <template #content>
                    <div class="d-flex align-center">

                        <v-btn variant="text" icon="fa-solid fa-bars" @click.stop="drawer = !drawer"></v-btn>
                        <span>{{ $t('Help') }}</span>
                    </div>
                </template>
            </v-closable-card-title>
            <v-divider></v-divider>
            <v-card-text class="pa-0">
                <v-layout style="height: 100%">

                    <v-navigation-drawer style="height: calc(100% + 0px)" v-model="drawer">
                        <v-list>

                            <v-list-item>
                                <v-text-field density="compact" variant="outlined" class="pt-2 pb-2" :label="$t('Search')" hide-details clearable></v-text-field>
                            </v-list-item>
                            <v-divider></v-divider>
                            <v-list-item link title="Start" @click="window = 'start'"></v-list-item>
                            <v-list-item link title="Space" @click="window = 'space'"></v-list-item>
                        </v-list>

                    </v-navigation-drawer>

                    <v-main>
                        <v-container>
                            <v-window v-model="window">
                                <v-window-item value="start">
                                    <h2>Welcome to Tandoor 2</h2>
                                    <p class="mt-3">Tandoor is one of the most most powerful recipe management suits available. It has constantly been improved since its first
                                        version in 2018.
                                        This knowledgebase explains all important features and concepts. Explore it to find out how Tandoor can help you improve your daily cooking
                                        routine or search
                                        for specific features to help you understand them.</p>

                                    <p class="mt-3">Some of the most important concepts are Spaces, Recipes, Foods and Units.</p>

                                    <v-alert class="mt-3" border="start" variant="tonal" color="success">
                                        <v-alert-title>Did you know?</v-alert-title>
                                        Tandoor is Open Source and available to anyone for free to host on their own server. Thousands of hours have been spend
                                        making Tandoor what it is today. You can help make Tandoor even better by contributing or helping financing the effort.
                                        <br/>
                                        <v-btn class="mt-2" href="https://docs.tandoor.dev/contribute/contribute/" target="_blank" prepend-icon="fa-solid fa-code-branch">
                                            Contribute
                                        </v-btn>
                                        <v-btn class="mt-2 ms-2" href="https://github.com/sponsors/vabene1111" target="_blank" prepend-icon="fa-solid fa-dollar-sign">Sponsor
                                        </v-btn>
                                    </v-alert>

                                </v-window-item>
                                <v-window-item value="space">
                                    <p class="mt-3">All your data is stored in a Space where you can invite other people to collaborate on your recipe database. Typcially the members of a space
                                        belong to one family/household/organization.</p>

                                    <p class="mt-3">While everyone can access all recipes by default, Books, Shopping Lists and Mealplans are not shared by default. You can share them with other members of your space
                                        using the settings.
                                    </p>
                                    <p class="mt-3">You can create and be a member of multiple spaces. Switch between them freely using the navigation or space settings. Depending
                                        on the permission configured by the space owner you might not have access to all features of a space.</p>
                                    <p class="mt-3"></p>

                                    <v-btn color="primary" variant="tonal" prepend-icon="fa-solid fa-database" class="me-2" :to="{name: 'UserSpaceSettings'}">{{ $t('YourSpaces') }}</v-btn>
                                    <v-btn color="primary" variant="tonal" prepend-icon="$settings" class="me-2" :to="{name: 'SpaceSettings'}">{{ $t('SpaceSettings') }}</v-btn>
                                    <v-btn color="primary" variant="tonal" prepend-icon="fa-solid fa-users" class="me-2" :to="{name: 'SpaceMemberSettings'}">{{ $t('Invites') }}</v-btn>

                                </v-window-item>
                            </v-window>
                        </v-container>
                    </v-main>
                </v-layout>

            </v-card-text>
        </v-card>
    </v-dialog>

</template>

<script setup lang="ts">

import VClosableCardTitle from "@/components/dialogs/VClosableCardTitle.vue";
import {ref} from "vue";

const dialog = ref(false)
const window = ref('start')
const drawer = ref(true)

</script>


<style scoped>

</style>