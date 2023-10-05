<template>
    <b-card no-body v-hover>
        <b-card-header class="p-4">
            <h5>
                {{ book_copy.name }}
                <span class="float-right text-primary" @click="editOrSave"><i class="fa" v-bind:class="{ 'fa-pen': !editing, 'fa-save': editing }" aria-hidden="true"></i></span>
            </h5>
            <b-badge class="font-weight-normal mr-1" v-for="u in book_copy.shared" v-bind:key="u.id" variant="primary" pill>{{ u.display_name }}</b-badge>
        </b-card-header>
        <b-card-body class="p-4">
            <div class="form-group" v-if="editing">
                <label for="inputName1">{{ $t("Name") }}</label>
                <input class="form-control" id="inputName1" placeholder="Name" v-model="book_copy.name" />
            </div>
            <div class="form-group" v-if="editing">
                <label for="inputDesc1">{{ $t("Description") }}</label>
                <textarea class="form-control" id="inputDesc1" rows="3" v-model="book_copy.description"> </textarea>
            </div>
            <div class="form-group" v-if="editing">
                <label for="inputDesc1">{{ $t("Share") }}</label>
                <generic-multiselect
                    @change="book_copy.shared = $event.val"
                    parent_variable="book.shared"
                    :initial_selection="book.shared"
                    :label="'display_name'"
                    :model="Models.USER_NAME"
                    style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
                    v-bind:placeholder="$t('Share')"
                    :limit="50"
                ></generic-multiselect>
            </div>
            <div class="form-group" v-if="editing">
                <label for="inputDesc1">{{ $t("recipe_filter") }}</label>
                <generic-multiselect
                    @change="book_copy.filter = $event.val"
                    parent_variable="book.filter"
                    :initial_single_selection="book.filter"
                    :model="Models.CUSTOM_FILTER"
                    :multiple="false"
                    style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
                    v-bind:placeholder="$t('Custom Filter')"
                    :limit="50"
                ></generic-multiselect>
                <small class="text-muted">{{ $t("book_filter_help") }}</small>
            </div>
            <button v-if="editing" class="btn btn-danger" @click="deleteBook">{{ $t("Delete") }}</button>
            <button v-if="editing" class="btn btn-primary float-right" @click="editOrSave">{{ $t("Save") }}</button>
            <b-card-text style="text-overflow: ellipsis" v-if="!editing">
                {{ book_copy.description }}
            </b-card-text>
        </b-card-body>
    </b-card>
</template>

<script>
import { ApiApiFactory } from "@/utils/openapi/api"
import { ApiMixin, StandardToasts } from "@/utils/utils"
import GenericMultiselect from "@/components/GenericMultiselect"

export default {
    name: "CookbookEditCard",
    components: { GenericMultiselect },
    mixins: [ApiMixin],
    props: {
        book: Object,
    },
    data() {
        return {
            editing: false,
            book_copy: {},
            users: [],
        }
    },
    mounted() {
        this.book_copy = this.book
    },
    directives: {
        hover: {
            inserted: function (el) {
                el.addEventListener("mouseenter", () => {
                    el.classList.add("shadow")
                })
                el.addEventListener("mouseleave", () => {
                    el.classList.remove("shadow")
                })
            },
        },
    },
    methods: {
        editOrSave: function () {
            if (!this.editing) {
                this.editing = true
                this.$emit("editing", true)
            } else {
                this.editing = false
                this.saveData()
                this.$emit("editing", false)
                this.$emit("reload")
            }
        },
        saveData: function () {
            let apiClient = new ApiApiFactory()

            apiClient
                .updateRecipeBook(this.book_copy.id, this.book_copy)
                .then((result) => {
                    StandardToasts.makeStandardToast(this,StandardToasts.SUCCESS_UPDATE)
                })
                .catch((err) => {
                    StandardToasts.makeStandardToast(this,StandardToasts.FAIL_UPDATE, err)
                })
        },
        refreshData: function () {
            let apiClient = new ApiApiFactory()

            apiClient.listUsers().then((result) => {
                this.users = result.data
            })
        },
        deleteBook: function () {
            if (confirm(this.$t("delete_confirmation", { source: this.book.name }))) {
                let apiClient = new ApiApiFactory()

                apiClient
                    .destroyRecipeBook(this.book.id)
                    .then((result) => {
                        this.$emit("refresh")
                        StandardToasts.makeStandardToast(this,StandardToasts.SUCCESS_DELETE)
                    })
                    .catch((err) => {
                        StandardToasts.makeStandardToast(this,StandardToasts.FAIL_DELETE, err)
                    })
            }
        },
    },
}
</script>

<style scoped></style>
