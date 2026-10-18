<template>
    <v-container style="max-width: 450px; margin: auto;">
        <v-row>
            <v-col>
                <v-card>
                    <v-card-title>{{ $t('Login') }}</v-card-title>
                    <v-divider></v-divider>
                    <v-card-text>

                        <v-form v-if="!useUserPreferenceStore().serverSettings.socialaccountOnly">
                            <v-alert class="mb-4" v-if="generalError" type="warning">{{ generalError }}</v-alert>

                            <v-text-field :label="$t('Username')" autofocus v-model="username" :disabled="loading" :error-messages="usernameError" :error="!!usernameError"/>
                            <v-text-field :label="$t('Password')" type="password" v-model="password" :disabled="loading" @keyup.enter="login()" :error-messages="passwordError"
                                          :error="!!passwordError"/>

                            <v-btn block @click="login()" variant="elevated" :loading="loading" :disabled="providerLoading != ''" color="success">{{ $t('Login') }}</v-btn>
                        </v-form>

                        <v-divider v-if="socialProviders.length > 0 && !useUserPreferenceStore().serverSettings.socialaccountOnly" class="mt-5 mb-5">{{ $t('or') }}</v-divider>
                        <v-row>
                            <v-col md="6" cols="12" v-for="p in socialProviders" :key="p.id">
                                <v-btn block @click="startProviderFlow(p.id)" :disabled="providerLoading != '' || loading" :loading="providerLoading == p.id" variant="outlined">
                                    {{  p.name }}
                                </v-btn>
                            </v-col>
                        </v-row>

                        <v-row v-if="useUserPreferenceStore().serverSettings.enableSignup && !useUserPreferenceStore().serverSettings.socialaccountOnly">
                            <v-col>
                                <v-divider class="mb-5">{{ $t('or') }}</v-divider>
                                <v-btn block :to="{name: 'SignUpPage'}" variant="elevated" :disabled="providerLoading != ''|| loading" color="info" >{{ $t('SignUp') }}</v-btn>
                            </v-col>
                        </v-row>


                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <v-row>
            <v-col>
                <div class="text-center mt-2">
                    <router-link :to="{name: 'PasswordResetPage'}">{{ $t('ForgotPassword') }}</router-link>
                </div>
            </v-col>
        </v-row>

        <v-row>
            <v-col class="text-center">
                <a :href="useUserPreferenceStore().serverSettings.privacyUrl" v-if="useUserPreferenceStore().serverSettings.privacyUrl" class="me-4">{{ $t('PrivacyPolicy') }}</a>
                <a :href="useUserPreferenceStore().serverSettings.termsUrl" v-if="useUserPreferenceStore().serverSettings.termsUrl" class="me-4">{{ $t('TermsOfService') }}</a>
                <a :href="useUserPreferenceStore().serverSettings.imprintUrl" v-if="useUserPreferenceStore().serverSettings.imprintUrl" class="me-4">{{ $t('Imprint') }}</a>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">

import {onMounted, ref} from "vue";
import {AuthenticationAccountApi, AuthenticationProvidersApi, ConfigurationApi, Provider} from "@/authapi";
import {ErrorMessageType, useMessageStore} from "@/stores/MessageStore.ts";
import {useRouter} from "vue-router";
import {useUserPreferenceStore} from "@/stores/UserPreferenceStore.ts";
import {useI18n} from "vue-i18n";
import {getCookie} from "@/utils/cookie.ts";
import {useDjangoUrls} from "@/composables/useDjangoUrls.ts";

const router = useRouter()
const {t} = useI18n()

const loading = ref(false)
const providerLoading = ref("")
const username = ref('')
const password = ref('')

const generalError = ref('')
const passwordError = ref('')
const usernameError = ref('')

const socialProviders = ref<Provider[]>([] as Provider[])

const next = useRouter().currentRoute.value.query.next

onMounted(() => {
    loadProviders()

    useUserPreferenceStore().loadServerSettings()
})

function login() {
    let accountApi = new AuthenticationAccountApi()
    loading.value = true

    generalError.value = ''
    passwordError.value = ''
    usernameError.value = ''

    accountApi.allauthClientV1AuthLoginPost({client: 'browser', login: {username: username.value, password: password.value}}).then(r => {
        useUserPreferenceStore().init().then(r => {
            if (next && typeof next === 'string') {
                router.push(next)
            } else {
                router.push({name: 'StartPage'})
            }
        })

    }).catch(err => {
        try {
            err.response.json().then(responseJson => {
                if (responseJson.status == 429) {
                    generalError.value = t('RateLimitHelp')
                } else if (responseJson.status == 401) {
                    generalError.value = t('AwaitingEmailConfirmation')
                } else {
                    responseJson.errors.forEach(error => {
                        if (error.param == 'password') {
                            passwordError.value = error.message
                        } else if (error.param == 'username') {
                            usernameError.value = error.message
                        } else {
                            generalError.value += error.message + ' (' + error.param + ')\n'
                        }
                    })

                }
            })
        } catch (e) {
            console.error(e)
            useMessageStore().addError(ErrorMessageType.UPDATE_ERROR, err)
        }
        loading.value = false
    })
}

function loadProviders() {
    const configurationApi = new ConfigurationApi()

    configurationApi.allauthClientV1ConfigGet({client: "browser"}).then(r => {
        if (r.data.socialaccount) {
            socialProviders.value = r.data.socialaccount.providers
        }
    }).catch(err => {
        useMessageStore().addError(ErrorMessageType.FETCH_ERROR, err)
    })
}

function startProviderFlow(provider: string) {

    providerLoading.value = provider

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = useDjangoUrls().getDjangoUrl(`/_allauth/browser/v1/auth/provider/redirect`, false);

    const fields: Record<string, string> = {
        provider: provider,
        process: 'login',
        callback_url: useDjangoUrls().getDjangoUrl(`/account/social-signup/`),
    };

    const csrfToken = getCookie('csrftoken');
    if (csrfToken) {
        fields['csrfmiddlewaretoken'] = csrfToken;
    }

    for (const [name, value] of Object.entries(fields)) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = value;
        form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
}

</script>

<style scoped>


</style>