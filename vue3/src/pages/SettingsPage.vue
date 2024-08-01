<template>
    <v-container>

        <v-row>
            <v-col cols="2" offset="2">
                <v-list class="bg-transparent">
                    <v-list-item>Profil</v-list-item>

                    <v-divider></v-divider>
                    <v-list-subheader>Einstellungen</v-list-subheader>
                    <v-list-item>Kosmetisch</v-list-item>
                    <v-list-item>Einkaufsliste</v-list-item>
                    <v-list-item>Speiseplan</v-list-item>
                    <v-list-item>Suchen</v-list-item>
                    <v-divider></v-divider>
                    <v-list-subheader>Space</v-list-subheader>
                    <v-list-item>Meine Spaces</v-list-item>
                    <v-list-item>Space Einstellungen</v-list-item>
                    <v-list-item>Space Mitglieder</v-list-item>
                    <v-divider></v-divider>
                    <v-list-subheader>Admin</v-list-subheader>
                    <v-list-item>API</v-list-item>
                    <v-list-item>System</v-list-item>
                </v-list>

            </v-col>
            <v-col cols="6">
                <v-form>
                    <v-text-field :label="$t('Username')" disabled :hint="$t('theUsernameCannotBeChanged')" persistent-hint></v-text-field>
                    <v-text-field :label="$t('First_name')"></v-text-field>
                    <v-text-field :label="$t('Last_name')"></v-text-field>
                </v-form>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">


</script>


<style scoped>

</style>