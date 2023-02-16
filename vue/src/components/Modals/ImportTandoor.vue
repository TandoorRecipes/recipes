<template>

    <div>
        <b-button v-b-modal.id_import_tandoor_modal>{{ $t("Import into Tandoor") }}</b-button>

        <b-modal class="modal" id="id_import_tandoor_modal" :title="$t('Import')" hide-footer>
            <p>Tandoor ist eine OpenSource Rezeptverwaltungs Plattform</p>

            <p>Bitte wähle aus ob du deinen eigenen Tandoor Server hast oder tandoor.dev nutzt.
            </p>
            <div class="justify-content-center text-center">
                <b-form-group v-slot="{ ariaDescribedby }">
                    <b-form-radio-group
                        id="btn-radios-1"
                        v-model="import_mode"
                        :options="options"
                        :aria-describedby="ariaDescribedby"
                        name="radios-btn-default"
                        buttons
                    ></b-form-radio-group>
                </b-form-group>
            </div>
            <div v-if="import_mode === 'tandoor'">
                <ol>
                    <li><a href="https://app.tandoor.dev/accounts/signup/" target="_blank" ref="nofollow">Hier</a> einen
                        Account anlegen<br/></li>
                    <li>
                        <b-button @click="importTandoor()">Import</b-button>
                    </li>
                </ol>


            </div>
            <div v-if="import_mode === 'selfhosted'">
                Deine Server URL (z.B. <code>https://tandoor.mydomain.com/</code>)
                <b-input v-model="selfhosted_url"></b-input>
                <b-button class="mt-2" :disabled="selfhosted_url === ''" @click="importSelfHosted()">Import</b-button>
            </div>

            <div class="row mt-3 text-left mb-3">
                <p>Alternativ kannst du den Link zum Rezept in den Importer in deiner Tandoor Instanz kopieren.</p>

                <a href="https://tandoor.dev" target="_blank" rel="nofollow">Jetzt mehr über Tandoor erfahren</a>
            </div>
        </b-modal>
    </div>
</template>

<script>
import Vue from "vue";
import {BootstrapVue} from "bootstrap-vue";
import {ApiApiFactory} from "@/utils/openapi/api";


Vue.use(BootstrapVue)

export default {
    name: 'ImportTandoor',
    components: {},
    props: {
        recipe: Object,
    },
    data() {
        return {
            import_mode: 'tandoor',
            options: [
                {text: 'Tandoor.dev', value: 'tandoor'},
                {text: 'Self-Hosted', value: 'selfhosted'},
            ],
            selfhosted_url: '',
        }
    },
    watch: {
        selfhosted_url: function (newVal) {
            window.localStorage.setItem('MY_TANDOOR_URL', newVal)
        },
    },
    computed: {},
    mounted() {
        this.$i18n.locale = window.CUSTOM_LOCALE
        let selfhosted_url = window.localStorage.getItem('MY_TANDOOR_URL')
        if (selfhosted_url !== undefined) {
            this.selfhosted_url = selfhosted_url
            this.import_mode = 'selfhosted'
        }
    },
    methods: {
        importTandoor: function () {
            location.href = 'https://app.tandoor.dev/data/import/url?url=' + location.href
        },
        importSelfHosted: function () {
            this.selfhosted_url = this.selfhosted_url.replace('/search/', '')
            let import_path = 'data/import/url?url='
            if (!this.selfhosted_url.endsWith('/')) {
                import_path = '/' + import_path
            }
            location.href = this.selfhosted_url + import_path + location.href
        },
    }
}
</script>
