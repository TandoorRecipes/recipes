<template>
    <v-dialog max-width="70vw" min-height="80vh" activator="parent">
        <template v-slot:default="{ isActive }">
            <v-card>
                <v-card-title>
                    Nachrichten <v-btn icon="fas fa-times" variant="flat" size="x-small" class="mt-2 float-right " @click="isActive.value = false"></v-btn>
                </v-card-title>

                <v-card-text>
                    <h4>Filter</h4>

                    <v-text-field
                        class="mt-2"
                        v-model="search"
                        label="Search"
                        prepend-inner-icon="mdi-magnify"
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
                            <v-icon icon="fas fa-eye" class="me-2" color="success"></v-icon>
                            Success
                        </v-btn>
                        <v-btn :value="MessageType.INFO">
                            <v-icon icon="fas fa-eye" class="me-2" color="info"></v-icon>
                            Info
                        </v-btn>
                        <v-btn :value="MessageType.WARNING">
                            <v-icon icon="fas fa-eye" class="me-2" color="warning"></v-icon>
                            Warning
                        </v-btn>
                        <v-btn :value="MessageType.ERROR">
                            <v-icon icon="fas fa-eye" class="me-2" color="error"></v-icon>
                            Error
                        </v-btn>
                    </v-btn-toggle>

                    <v-data-table
                        :headers="tableHeaders"
                        :items="displayItems"
                        :sort-by="sortBy"
                        :search="search"
                    >

                        <template v-slot:item.type="{ value }">
                            <v-chip :color="value">
                                {{ value }}
                            </v-chip>
                        </template>

                        <template v-slot:item.actions="{ item }">
                            <v-icon icon="fas fa-search" @click="showDetailDialog = true; detailItem = item"></v-icon>
                            <v-icon class="ms-1" icon="fas fa-copy" @click="copy(JSON.stringify({'type': item.type, 'createdAt': item.createdAt, 'msg': item.msg, 'data': item.data}));"></v-icon>
                        </template>
                    </v-data-table>


                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click="useMessageStore().deleteAllMessages()" color="error">Alle Löschen</v-btn>
                    <v-btn @click="addTestMessage()" color="warning">Test Nachricht</v-btn>
                    <v-btn @click="isActive.value = false">Close</v-btn>
                </v-card-actions>
            </v-card>
        </template>

    </v-dialog>

    <v-dialog v-model="showDetailDialog" max-width="50vw">
        <v-card>
            <v-card-title>
                Nachricht Details <small>{{ DateTime.fromSeconds(detailItem.createdAt).toLocaleString(DateTime.DATETIME_MED) }}</small>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
                <v-label>Typ</v-label>
                <br/>
                <v-chip :color="detailItem.type">{{ detailItem.type }}</v-chip>
                <br/>

                <v-label class="mt-2">Nachricht</v-label>
                <p>{{ detailItem.msg }}</p>

                <v-label class="mt-2">Data</v-label>
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

const {copy} = useClipboard()

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
    {title: 'Type', key: 'type'},
    {
        title: 'Created',
        key: 'createdAt',
        value: (item: Message) => `${DateTime.fromSeconds(item.createdAt).toLocaleString(DateTime.DATETIME_MED)}`,
    },
    {title: 'Message', key: 'msg'},
    {title: 'Actions', key: 'actions', align: 'end'},
])
const typeFilter = ref([MessageType.SUCCESS, MessageType.INFO, MessageType.WARNING, MessageType.ERROR])
const detailItem = ref({} as Message)
const showDetailDialog = ref(false)

function addTestMessage() {
    let types = [MessageType.SUCCESS, MessageType.ERROR, MessageType.INFO, MessageType.WARNING]
    useMessageStore().addMessage(types[Math.floor(Math.random() * types.length)], `Lorem Ipsum ${Math.random() * 1000}`, 5000, {json: "data", 'msg': 'whatever', data: 1})
}

</script>


<style scoped>

</style>