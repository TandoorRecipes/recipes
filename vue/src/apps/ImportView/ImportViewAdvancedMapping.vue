<template>
    <div>
        <!-- recipe preview before Import -->
        <div class="container-fluid" v-if="recipe_json" id="manage_tree">
            <div class="row">
                <div class="col" style="max-width:50%">
                    <!-- start of preview card -->
                    <div class="card card-border-primary">
                        <div class="card-header">
                            <h3>Preview Recipe Data</h3>
                            <div class='small text-muted'>Drag recipe attributes from the right into the
                                appropriate box below.
                            </div>
                        </div>
                        <div class="card-body p-2">

                            <div class="card mb-2">
                                <div class="card-header" v-b-toggle.collapse-name>
                                    <div class="row px-3" style="justify-content:space-between;">
                                        Name
                                        <i class="fas fa-eraser" style="cursor:pointer;" @click="recipe_json.name=''"
                                           title="Clear Contents"></i>
                                    </div>
                                    <div class="small text-muted">Text dragged here will be appended to the
                                        name.
                                    </div>
                                </div>
                                <b-collapse id="collapse-name" visible class="mt-2">
                                    <div class="card-body drop-zone" @drop="replacePreview('name', $event)"
                                         @dragover.prevent @dragenter.prevent>
                                        <div class="card-text">{{ recipe_json.name }}</div>
                                    </div>
                                </b-collapse>
                            </div>

                            <div class="card mb-2">
                                <div class="card-header" v-b-toggle.collapse-description>
                                    <div class="row px-3" style="justify-content:space-between;">
                                        Description
                                        <i class="fas fa-eraser" style="cursor:pointer;"
                                           @click="recipe_json.description=''" title="Clear Contents"></i>
                                    </div>
                                    <div class="small text-muted">Text dragged here will be appended to the
                                        description.
                                    </div>
                                </div>
                                <b-collapse id="collapse-description" visible class="mt-2">
                                    <div class="card-body drop-zone" @drop="replacePreview('description', $event)"
                                         @dragover.prevent @dragenter.prevent>
                                        <div class="card-text">{{ recipe_json.description }}</div>
                                    </div>
                                </b-collapse>
                            </div>

                            <div class="card mb-2">
                                <div class="card-header" v-b-toggle.collapse-kw>
                                    <div class="row px-3" style="justify-content:space-between;">
                                        Keywords
                                        <i class="fas fa-eraser" style="cursor:pointer;"
                                           @click="recipe_json.keywords=[]" title="Clear Contents"></i>
                                    </div>
                                    <div class="small text-muted">Keywords dragged here will be appended to
                                        current list
                                    </div>
                                </div>
                                <b-collapse id="collapse-kw" visible class="mt-2">
                                    <div class="card-body drop-zone" @drop="replacePreview('keywords', $event)"
                                         @dragover.prevent @dragenter.prevent>
                                        <div v-for="kw in recipe_json.keywords" v-bind:key="kw.name">
                                            <div class="card-text">{{ kw.text }}</div>
                                        </div>
                                    </div>
                                </b-collapse>
                            </div>

                            <div class="card mb-2">
                                <div class="card-header" v-b-toggle.collapse-image
                                     style="display:flex; justify-content:space-between;">
                                    Image
                                    <i class="fas fa-eraser" style="cursor:pointer;" @click="recipe_json.image=''"
                                       title="Clear Contents"></i>
                                </div>
                                <b-collapse id="collapse-image" visible class="mt-2">
                                    <div class="card-body m-0 p-0 drop-zone" @drop="replacePreview('image', $event)"
                                         @dragover.prevent @dragenter.prevent>
                                        <img class="card-img" v-bind:src="recipe_json.image" alt="Recipe Image">
                                    </div>
                                </b-collapse>
                            </div>

                            <div class="row mb-2">
                                <div class="col">
                                    <div class="card">
                                        <div class="card-header p-1"
                                             style="display:flex; justify-content:space-between;">
                                            Servings
                                            <i class="fas fa-eraser" style="cursor:pointer;"
                                               @click="recipe_json.servings=''"
                                               title="Clear Contents"></i>
                                        </div>
                                        <div class="card-body p-2 drop-zone" @drop="replacePreview('servings', $event)"
                                             @dragover.prevent @dragenter.prevent>
                                            <div class="card-text">{{ recipe_json.servings }}</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col">
                                    <div class="card">
                                        <div class="card-header p-1"
                                             style="display:flex; justify-content:space-between;">
                                            Prep Time
                                            <i class="fas fa-eraser" style="cursor:pointer;"
                                               @click="recipe_json.working_time=''"
                                               title="Clear Contents"></i>
                                        </div>
                                        <div class="card-body p-2 drop-zone" @drop="replacePreview('prepTime', $event)"
                                             @dragover.prevent @dragenter.prevent>
                                            <div class="card-text">{{ recipe_json.working_time }}</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col">
                                    <div class="card">
                                        <div class="card-header p-1"
                                             style="display:flex; justify-content:space-between;">
                                            Cook Time
                                            <i class="fas fa-eraser" style="cursor:pointer;"
                                               @click="recipe_json.waiting_time=''"
                                               title="Clear Contents"></i>
                                        </div>
                                        <div class="card-body p-2 drop-zone" @drop="replacePreview('cookTime', $event)"
                                             @dragover.prevent @dragenter.prevent>
                                            <div class="card-text">{{ recipe_json.waiting_time }}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="card mb-2">
                                <div class="card-header" v-b-toggle.collapse-ing>
                                    <div class="row px-3" style="display:flex; justify-content:space-between;">
                                        Ingredients
                                        <i class="fas fa-eraser" style="cursor:pointer;"
                                           @click="recipe_json.recipeIngredient=[]"
                                           title="Clear Contents"></i>
                                    </div>
                                    <div class="small text-muted">Ingredients dragged here will be appended to
                                        current list.
                                    </div>
                                </div>
                                <b-collapse id="collapse-ing" visible class="mt-2">
                                    <div class="card-body drop-zone" @drop="replacePreview('ingredients', $event)"
                                         @dragover.prevent @dragenter.prevent>
                                        <ul class="list-group list-group">
                                            <div v-for="i in recipe_json.recipeIngredient" v-bind:key="i.note">
                                                <li class="row border-light">
                                                    <div class="col-sm-1 border">{{ i.amount }}</div>
                                                    <div class="col-sm border">{{ i.unit.text }}</div>
                                                    <div class="col-sm border">{{ i.ingredient.text }}</div>
                                                    <div class="col-sm border">{{ i.note }}</div>
                                                </li>
                                            </div>
                                        </ul>
                                    </div>
                                </b-collapse>
                            </div>

                            <div class="card mb-2">
                                <div class="card-header" v-b-toggle.collapse-instructions>
                                    <div class="row px-3" style="justify-content:space-between;">
                                        Instructions
                                        <i class="fas fa-eraser" style="cursor:pointer;"
                                           @click="recipe_json.recipeInstructions=''"
                                           title="Clear Contents"></i>
                                    </div>
                                    <div class="small text-muted">Recipe instructions dragged here will be
                                        appended to current instructions.
                                    </div>
                                </div>
                                <b-collapse id="collapse-instructions" visible class="mt-2">
                                    <div class="card-body drop-zone" @drop="replacePreview('instructions', $event)"
                                         @dragover.prevent @dragenter.prevent>
                                        <div class="card-text">{{ recipe_json.recipeInstructions }}</div>
                                    </div>
                                </b-collapse>
                            </div>
                        </div>
                    </div>
                    <br/>
                    <!-- end of preview card -->
                    <button class="btn btn-primary shadow-none" type="button"
                            style="margin-bottom: 2vh"
                            id="id_btn_json"><i class="fas fa-code"></i> Import
                    </button>
                </div>

                <!-- start of source data -->
                <div class="col" style="max-width:50%;">
                    <div class="card card-border-primary sticky-top" style="z-index: 100;">
                        <div class="card-header">
                            <h3>Discovered Attributes</h3>
                            <div class='small text-muted'>
                                Drag recipe attributes from below into the appropriate box on the left. Click
                                any node to display its full properties.
                            </div>
                        </div>
                        <div class="btn-group btn-group-toggle" data-toggle="buttons">
                            <label class="btn btn-outline-info btn-sm active" @click="preview_type='json'">
                                <input type="radio" autocomplete="off" checked> json
                            </label>
                            <label class="btn btn-outline-info btn-sm" @click="preview_type='html'">
                                <input type="radio" autocomplete="off"> html
                            </label>
                        </div>
                        <i :class="[show_blank ? 'fa-chevron-up' : 'fa-chevron-down', 'fas']"
                           style="cursor:pointer;"
                           @click="show_blank=!show_blank"
                           title="Show Blank Field"></i>
                        <div class="card-body p-1">
                            <div class="card card-border-primary" v-if="show_blank">
                                <div class="card-header">
                                    <div class="row px-3" style="justify-content:space-between;">
                                        Blank Field
                                        <i class="fas fa-eraser justify-content-end" style="cursor:pointer;"
                                           @click="blank_field=''" title="Clear Contents"></i>
                                    </div>
                                    <div class="small text-muted">Items dragged to Blank Field will be
                                        appended.
                                    </div>
                                </div>
                                <div class="card-body drop-zone"
                                     @drop="replacePreview('blank', $event)"
                                     @dragover.prevent
                                     @dragenter.prevent
                                     draggable
                                     @dragstart="htmlDragStart($event)">
                                    {{ blank_field }}
                                </div>
                            </div>
                            <!-- start of json data -->

                            <!-- eslint-disable vue/no-deprecated-scope-attribute -->
                            <v-jstree v-if="preview_type=='json'" :data="recipe_tree"
                                      text-field-name="name"
                                      collapse:true
                                      draggable
                                      @item-drag-start="itemDragStart"
                                      @item-click="itemClick">
                                <template scope="_">
                                    <div class="col" @click.ctrl="customItemClickWithCtrl">
                                        <div class="row clearfix" style="width:100%">
                                            <div class="col-es" style="align-right">
                                                <button
                                                    style="border: 0px; background-color: transparent; cursor: pointer;"
                                                    @click="deleteNode(_.vm, _.model, $event)"><i
                                                    class="fas fa-minus-square" style="color:red"></i></button>
                                            </div>
                                            <div class="col overflow-hidden">
                                                <i :class="_.vm.themeIconClasses" role="presentation"
                                                   v-if="!_.model.loading"></i>
                                                {{ _.model.name }}
                                            </div>
                                        </div>
                                    </div>

                                </template>
                            </v-jstree>
                            <!-- eslint-disable vue/no-deprecated-scope-attribute -->

                            <!-- start of html data -->
                            <div v-if="preview_type=='html'">

                                <ul class="list-group list-group-flush" v-for="(txt, key) in recipe_html"
                                    v-bind:key="key">
                                    <div class="list-group-item bg-light m-0 small"
                                         draggable
                                         @dragstart="htmlDragStart($event)"
                                         style="display:flex; justify-content:space-between;">
                                        {{ txt }}
                                        <i class="fas fa-minus-square" style="cursor:pointer; color:red"
                                           @click="$delete(recipe_html, key)" title="Delete Text"></i>
                                    </div>
                                </ul>
                            </div>


                        </div>
                    </div>
                </div>
                <!-- end of json tree -->
            </div>
        </div>
        <!-- end of recipe preview before Import -->
    </div>
</template>

<script>
import {StandardToasts} from "@/utils/utils";
import VJstree from 'vue-jstree'

export default {
    name: "ImportViewAdvancedMapping",
    components: {
        VJstree,
    },
    props: {
        recipe: undefined,
        recipe_html: undefined,
        recipe_tree: undefined,
        recipe_images: undefined,
    },
    data() {
        return {
            recipe_json: undefined,
            preview_type: 'json',
            show_blank: false,
            blank_field: '',
        }
    },
    watch: {
        recipe_json: function () {
            this.$emit('change', this.recipe_json)
        },
    },
    mounted() {
        this.recipe_json = this.recipe //TODO check if changed not only if mounted, same for step editor
    },
    methods: {
        deleteNode: function (node, item, e) {
            e.stopPropagation()
            var index = node.parentItem.indexOf(item)
            node.parentItem.splice(index, 1)
        },
        itemClick: function (node, item, e) {
            this.makeToast('Details', node.model.value, 'info')
        },
        itemDragStart(node, item, e) {
            if (node.model.children.length > 0) {
                e.dataTransfer.setData('hasChildren', true)
            }
            e.dataTransfer.setData('value', node.model.value)

        },
        htmlDragStart: function (e) {
            e.dataTransfer.setData('value', e.target.innerText)
        },
        imageDragStart: function (e) {
            e.dataTransfer.setData('value', e.target.src)
        },
        replacePreview: function (field, e) {
            let v = e.dataTransfer.getData('value')
            if (e.dataTransfer.getData('hasChildren')) {
                this.makeToast('Error', 'Items with children cannot be dropped here!', 'danger')
                return
            }
            switch (field) {
                case 'name':
                    this.recipe_json.name = [this.recipe_json.name, v].filter(Boolean).join(" ");
                    break;
                case 'description':
                    this.recipe_json.description = [this.recipe_json.description, v].filter(Boolean).join(" ");
                    break;
                case 'image':
                    this.recipe_json.image = v
                    break;
                case 'keywords':
                    this.recipe_json.keywords.push({'text': v, 'id': null})
                    break;
                case 'servings':
                    this.recipe_json.servings = parseInt(v.match(/\b\d+\b/)[0])
                    break;
                case 'prepTime':
                    this.recipe_json.prepTime = v
                    break;
                case 'cookTime':
                    this.recipe_json.cookTime = v
                    break;
                case 'ingredients':
                    this.$http.post('string_from_ingredients', {text: v}, {emulateJSON: true}
                    ).then((response) => {
                        let new_ingredient = {
                            unit: {id: Math.random() * 1000, text: response.body.unit},
                            amount: String(response.body.amount),
                            ingredient: {id: Math.random() * 1000, text: response.body.food},
                            note: response.body.note,
                            original_text: v
                        }
                        this.recipe_json.recipeIngredient.push(new_ingredient)
                    }).catch((err) => {
                        console.log(err)
                        StandardToasts.makeStandardToast(StandardToasts.FAIL_CREATE)
                    })
                    break;
                case 'instructions':
                    this.recipe_json.recipeInstructions = [this.recipe_json.recipeInstructions, v].filter(Boolean).join("\n\n");
                    break;
                case 'blank':
                    this.blank_field = [this.blank_field, v].filter(Boolean).join(" ");
                    break;
            }
        },
    }
}
</script>

<style scoped>

</style>