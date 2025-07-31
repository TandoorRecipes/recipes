<template>
    <v-dialog max-width="70vw" min-height="80vh" :activator="activator">
        <template v-slot:default="{ isActive }">
            <v-card>
                <v-card-title>
                    {{ $t('Messages')}}
                </v-card-title>

                <v-card-text>
                    <h4>Filter</h4>

                    <v-text-field
                        class="mt-2"
                        v-model="search"
                        label="Search"
                        prepend-inner-icon="$search"
                        variant="outlined"
                        clearable
                        hide-details
                        single-line
                    ></v-text-field>

                    <v-btn-toggle
                        class="mt-2"
                        v-model="typeFilter"
                        variant="outlined"
                        divided
                        multiple>
                        <v-btn :value="MessageType.SUCCESS">
                            <v-icon icon="fa-regular fa-eye" color="success" class="me-2"></v-icon>
                            {{$t('Success')}}
                        </v-btn>
                        <v-btn :value="MessageType.INFO">
                            <v-icon icon="fa-regular fa-eye" color="info" class="me-2"></v-icon>
                            {{$t('Information')}}
                        </v-btn>
                        <v-btn :value="MessageType.WARNING">
                            <v-icon icon="fa-regular fa-eye" color="warning" class="me-2"></v-icon>
                            {{$t('Warning')}}
                        </v-btn>
                        <v-btn :value="MessageType.ERROR">
                            <v-icon icon="fa-regular fa-eye" color="error" class="me-2"></v-icon>
                            {{$t('Error')}}
                        </v-btn>
                    </v-btn-toggle>

                    <v-data-table
                        :headers="tableHeaders"
                        :items="displayItems"
                        :sort-by="sortBy"
                        :search="search"
                    >

                        <template v-slot:item.createdAt="{ value }">
                            {{ DateTime.fromSeconds(value).toLocaleString(DateTime.DATETIME_MED) }}
                        </template>

                        <template v-slot:item.type="{ value }">
                            <v-chip :color="value">
                                {{ value }}
                            </v-chip>
                        </template>

                        <template v-slot:item.msg="{ value }">
                            <b v-if="value.title">{{ value.title }}<br/></b>
                            {{ value.text }}
                        </template>

                        <template v-slot:item.actions="{ item }">
                            <v-icon icon="$search" @click="showDetailDialog = true; detailItem = item"></v-icon>
                            <v-icon class="ms-1" icon="$copy"
                                    @click="copy(JSON.stringify({'type': item.type, 'createdAt': item.createdAt, 'msg': item.msg, 'data': item.data}));"></v-icon>
                        </template>
                    </v-data-table>


                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click="useMessageStore().deleteAllMessages()" color="error">{{$t('Delete_All')}}</v-btn>
                    <v-btn @click="addTestMessage()" color="warning">{{$t('Add')}}</v-btn>
                    <v-btn @click="isActive.value = false">{{ $t('Close')}}</v-btn>
                </v-card-actions>
            </v-card>
        </template>

    </v-dialog>

    <v-dialog v-model="showDetailDialog" max-width="50vw">
        <v-card>
            <v-card-title>
                {{$t('Created')}} <small>{{ DateTime.fromSeconds(detailItem.createdAt).toLocaleString(DateTime.DATETIME_MED) }}</small>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
                <v-label>{{ $t('Type')}}</v-label>
                <br/>
                <v-chip :color="detailItem.type">{{ detailItem.type }}</v-chip>
                <br/>

                <v-label class="mt-2">{{$t('Messages')}}</v-label>
                <br/>
                <b v-if="detailItem.msg.title">{{ detailItem.msg.title }}<br/></b>
                <span class="text-pre">{{ detailItem.msg.text }}</span>

                <v-label class="mt-2">{{ $t('Information')}}</v-label>
                <pre style="white-space: pre-wrap;" v-if="detailItem.data != null">{{ detailItem.data }}</pre>
            </v-card-text>

            <v-card-actions>
                <v-spacer></v-spacer>

                <v-btn
                    text="Close Dialog"
                    @click="showDetailDialog = false"
                ></v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

</template>

<script setup lang="ts">
import {computed, ref} from 'vue'
import {Message, MessageType, useMessageStore} from "@/stores/MessageStore";
import {DateTime} from "luxon";
import {useClipboard} from "@vueuse/core";
import {useI18n} from "vue-i18n";

const {copy} = useClipboard()
const {t} = useI18n()

const props = defineProps({
    activator: {default: 'parent'}
})

/**
 * loads messages from store and filters them according to selected message types
 */
const displayItems = computed(() => {
    let items = [] as Message[]
    useMessageStore().messages.forEach(m => {
        if (typeFilter.value.includes(m.type)) {
            items.push(m)
        }
    })
    return items
})

const sortBy = ref([{key: 'createdAt', order: 'desc'}])
const search = ref('')
const tableHeaders = ref([
    {title: t('Type'), key: 'type'},
    {title: t('Created'), key: 'createdAt'},
    {title: t('Message'), key: 'msg'},
    {title: t('Actions'), key: 'actions', align: 'end'},
])
const typeFilter = ref([MessageType.SUCCESS, MessageType.INFO, MessageType.WARNING, MessageType.ERROR])
const detailItem = ref({} as Message)
const showDetailDialog = ref(false)

/**
 * create test message (for testing message framework)
 */
function addTestMessage() {
    let types = [MessageType.SUCCESS, MessageType.ERROR, MessageType.INFO, MessageType.WARNING]
    useMessageStore().addMessage(types[Math.floor(Math.random() * types.length)], {title: 'Test', text: `Lorem Ipsum Lorem Ipsum Lorem Ipsum LINEBREAK \n Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum ${Math.random() * 1000}`}, 5000, {json: "data", 'msg': 'whatever', data: 1})
}

</script>


<style scoped>

</style>