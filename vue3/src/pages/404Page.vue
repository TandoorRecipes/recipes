<script setup lang="ts">

</script>

<template>
<v-container>
    <v-row>
        <v-col class="text-center">
            <h1>404</h1>
            Oops, there is nothing here.
        </v-col>
    </v-row>

    <v-row>
        <v-col class="text-center">
            <v-btn :to="{name: 'StartPage'}">{{$t('Home')}}</v-btn>
        </v-col>
    </v-row>
</v-container>
</template>

<style scoped>

</style>