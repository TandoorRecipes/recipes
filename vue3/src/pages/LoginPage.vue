<template>
    <v-container style="max-width: 450px; margin: auto;">
        <v-row>
            <v-col>
                <v-card>
                    <v-card-title>{{ $t('Login') }}</v-card-title>
                    <v-divider></v-divider>
                    <v-card-text>

                        <v-form>
                            <v-alert class="mb-4" v-if="generalError" type="warning">{{ generalError }}</v-alert>

                            <v-text-field :label="$t('Username')" autofocus v-model="username" :disabled="loading" :error-messages="usernameError" :error="!!usernameError"/>
                            <v-text-field :label="$t('Password')" type="password" v-model="password" :disabled="loading" @keyup.enter="login()" :error-messages="passwordError"
                                          :error="!!passwordError"/>

                        </v-form>

                        <v-row>
                            <v-col md="6" cols="12" v-for="p in socialProviders" :key="p.id">
                                <v-btn block @click="startProviderFlow(p.id)">{{ p.name }}</v-btn>
                            </v-col>
                        </v-row>
                        {{ socialProviders }}

                        <!-- TODO email send screen -->

                        <!-- TODO reset screen when GET param is present -->

                    </v-card-text>
                    <v-card-actions>
                        <v-btn :to="{name: 'SignUpPage'}" variant="elevated" :loading="loading" color="info">{{ $t('SignUp') }}</v-btn>
                        <v-btn type="submit" @click="login()" variant="elevated" :loading="loading" color="primary">{{ $t('Login') }}</v-btn>
                    </v-card-actions>
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
const username = ref('')
const password = ref('')

const generalError = ref('')
const passwordError = ref('')
const usernameError = ref('')

const socialProviders = ref<Provider[]>([] as Provider[])

const next = useRouter().currentRoute.value.query.next

onMounted(() => {
    loadProviders()
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

    }).finally(() => {
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

    const nextRoute = router.currentRoute.value.query.next;
    const targetPath = typeof nextRoute === 'string' ? nextRoute : '/';
    const callbackUrl = `${window.location.origin}${targetPath}`;

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/_allauth/browser/v1/auth/provider/redirect';

    const fields: Record<string, string> = {
        provider: provider,
        process: 'login',
        callback_url: callbackUrl, // useDjangoUrls().getDjangoUrl(`/accounts/${provider}/login/callback/`),
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