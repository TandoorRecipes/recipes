<template>
    <div>
        <h3>
            <i class="fas fa-edit"></i> <span v-if="recipe !== undefined">{{ recipe.name }}</span>
        </h3>

        <loading-spinner :size="25" v-if="!recipe"></loading-spinner>

        <div v-if="recipe !== undefined">
            <!-- Title and description -->
            <div class="row">
                <div class="col-md-12">
                    <label for="id_name"> {{ $t("Name") }}</label>
                    <input class="form-control" id="id_name" v-model="recipe.name"/>
                </div>
            </div>
            <div class="row pt-2">
                <div class="col-12">
                    <label for="id_description">
                        {{ $t("Description") }}
                    </label>
                    <textarea id="id_description" class="form-control" v-model="recipe.description"
                              maxlength="512"></textarea>
                </div>
            </div>

            <!-- Image and misc properties -->
            <div class="row pt-2">
                <div class="col-md-6" style="max-height: 50vh; min-height: 30vh">
                    <input id="id_file_upload" ref="file_upload" type="file" hidden
                           @change="uploadImage($event.target.files[0])"/>

                    <div
                        class="h-100 w-100 border border-primary rounded"
                        style="border-width: 2px !important; border-style: dashed !important"
                        @drop.prevent="uploadImage($event.dataTransfer.files[0])"
                        @dragover.prevent
                        @click="$refs.file_upload.click()"
                    >
                        <i class="far fa-image fa-10x text-primary"
                           style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%)"
                           v-if="!recipe.image"></i>

                        <img :src="recipe.image" id="id_image" class="img img-fluid img-responsive"
                             style="object-fit: cover; height: 100%" v-if="recipe.image"/>
                    </div>
                    <button style="bottom: 10px; left: 30px; position: absolute" class="btn btn-danger"
                            @click="deleteImage" v-if="recipe.image">{{ $t("Delete") }}
                    </button>
                </div>

                <div class="col-md-6 mt-1">
                    <label for="id_name"> {{ $t("Preparation") }} {{ $t("Time") }} ({{ $t("min") }})</label>
                    <input class="form-control" id="id_prep_time" v-model="recipe.working_time" type="number"/>
                    <br/>
                    <label for="id_name"> {{ $t("Waiting") }} {{ $t("Time") }} ({{ $t("min") }})</label>
                    <input class="form-control" id="id_wait_time" v-model="recipe.waiting_time" type="number"/>
                    <br/>
                    <label for="id_name"> {{ $t("Servings") }}</label>
                    <input class="form-control" id="id_servings" v-model="recipe.servings" type="number"/>
                    <br/>
                    <label for="id_name"> {{ $t("Servings") }} {{ $t("Text") }}</label>
                    <input class="form-control" id="id_servings_text" v-model="recipe.servings_text" maxlength="32"/>
                    <br/>
                    <label for="id_name"> {{ $t("Keywords") }}</label>
                    <multiselect
                        v-model="recipe.keywords"
                        :options="keywords"
                        :close-on-select="false"
                        :clear-on-select="true"
                        :hide-selected="true"
                        :preserve-search="true"
                        :internal-search="false"
                        :limit="options_limit"
                        :placeholder="$t('select_keyword')"
                        :tag-placeholder="$t('add_keyword')"
                        :select-label="$t('Select')"
                        :selected-label="$t('Selected')"
                        :deselect-label="$t('remove_selection')"
                        :taggable="true"
                        @tag="addKeyword"
                        label="label"
                        track-by="id"
                        id="id_keywords"
                        :multiple="true"
                        :loading="keywords_loading"
                        @search-change="searchKeywords"
                    >
                        <template v-slot:noOptions>{{ $t("empty_list") }}</template>
                    </multiselect>
                </div>
            </div>

            <!-- Nutrition -->
            <div class="row pt-2">
                <div class="col-md-12">
                    <div class="card border-grey">
                        <div class="card-header" style="display: table">
                            <div class="row">
                                <div class="col-md-9 d-table">
                                    <h5 class="d-table-cell align-middle">{{ $t("Nutrition") }}</h5>
                                </div>
                                <div class="col-md-3">
                                    <button
                                        type="button"
                                        @click="addNutrition()"
                                        v-if="recipe.nutrition === null"
                                        v-b-tooltip.hover
                                        v-bind:title="$t('Add_nutrition_recipe')"
                                        class="btn btn-sm btn-success shadow-none float-right"
                                    >
                                        <i class="fas fa-plus-circle"></i>
                                    </button>
                                    <button
                                        type="button"
                                        @click="removeNutrition()"
                                        v-if="recipe.nutrition !== null"
                                        v-b-tooltip.hover
                                        v-bind:title="$t('Remove_nutrition_recipe')"
                                        class="btn btn-sm btn-danger shadow-none float-right"
                                    >
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <b-collapse id="id_nutrition_collapse" class="mt-2" v-model="nutrition_visible">
                            <div class="card-body" v-if="recipe.nutrition !== null">
                                <b-alert show>
                                    There is currently only very basic support for tracking nutritional information. A
                                    <a href="https://github.com/vabene1111/recipes/issues/896" target="_blank"
                                       rel="noreferrer nofollow">big update</a> is planned to improve on this in many
                                    different areas.
                                </b-alert>

                                <label for="id_name"> {{ $t(energy()) }}</label>

                                <input class="form-control" id="id_calories" v-model="recipe.nutrition.calories"/>

                                <label for="id_name"> {{ $t("Carbohydrates") }}</label>
                                <input class="form-control" id="id_carbohydrates"
                                       v-model="recipe.nutrition.carbohydrates"/>

                                <label for="id_name"> {{ $t("Fats") }}</label>
                                <input class="form-control" id="id_fats" v-model="recipe.nutrition.fats"/>

                                <label for="id_name"> {{ $t("Proteins") }}</label>
                                <input class="form-control" id="id_proteins" v-model="recipe.nutrition.proteins"/>
                            </div>
                        </b-collapse>
                    </div>
                    <b-card-header header-tag="header" class="p-1" role="tab">
                        <b-button squared block v-b-toggle.additional_collapse class="text-left"
                                  variant="outline-primary">{{ $t("additional_options") }}
                        </b-button>
                    </b-card-header>
                    <b-collapse id="additional_collapse" class="mt-2" v-model="additional_visible">
                        <b-form-group>
                            <b-input-group-append>
                                <b-input-group-text squared> {{ $t("Create Food") }}</b-input-group-text>
                                <b-input-group-text squared>
                                    <b-form-checkbox v-model="recipe.create_food"></b-form-checkbox>
                                </b-input-group-text>
                                <b-input-group-text squared v-if="recipe.create_food"> {{
                                        $t("Name")
                                    }}
                                </b-input-group-text>
                                <b-form-input squared v-if="recipe.create_food" v-model="recipe.food_name"
                                              id="food_name"></b-form-input>
                            </b-input-group-append>
                            <em class="small text-muted">
                                {{ $t("create_food_desc") }}
                            </em>
                        </b-form-group>
                    </b-collapse>
                </div>
            </div>

            <!-- Steps -->
            <draggable :list="recipe.steps" group="steps" :empty-insert-threshold="10" handle=".handle"
                       @sort="sortSteps()">
                <div v-for="(step, step_index) in recipe.steps" v-bind:key="step_index">
                    <div class="card mt-2 mb-2">
                        <div class="card-body pr-2 pl-2 pr-md-5 pl-md-5" :id="`id_card_step_${step_index}`">
                            <!-- step card header -->
                            <div class="row">
                                <div class="col-11">
                                    <h4 class="handle" :id="'id_step_' + step_index">
                                        <i class="fas fa-paragraph"></i>
                                        <template v-if="step.name !== ''">{{ step.name }}</template>
                                        <template v-else>{{ $t("Step") }} {{ step_index + 1 }}</template>
                                    </h4>
                                </div>
                                <div class="col-1" style="text-align: right">
                                    <a class="btn shadow-none btn-lg" href="#" role="button" id="dropdownMenuLink"
                                       data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                        <i class="fas fa-ellipsis-v text-muted"></i>
                                    </a>

                                    <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuLink">
                                        <button class="dropdown-item" @click="removeStep(step)"><i
                                            class="fa fa-trash fa-fw"></i> {{ $t("Delete") }}
                                        </button>

                                        <button type="button" class="dropdown-item" v-if="!step.show_as_header"
                                                @click="step.show_as_header = true">
                                            <i class="fas fa-eye fa-fw"></i> {{ $t("Show_as_header") }}
                                        </button>

                                        <button type="button" class="dropdown-item" v-if="step.show_as_header"
                                                @click="step.show_as_header = false">
                                            <i class="fas fa-eye-slash fa-fw"></i> {{ $t("Hide_as_header") }}
                                        </button>

                                        <button class="dropdown-item" @click="moveStep(step, step_index - 1)"
                                                v-if="step_index > 0">
                                            <i class="fa fa-arrow-up fa-fw"></i>
                                            {{ $t("Move_Up") }}
                                        </button>
                                        <button class="dropdown-item" @click="moveStep(step, step_index + 1)"
                                                v-if="step_index !== recipe.steps.length - 1">
                                            <i class="fa fa-arrow-down fa-fw"></i> {{ $t("Move_Down") }}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- step name input -->
                            <div class="row">
                                <div class="col-md-12">
                                    <label :for="'id_step_' + step.id + 'name'">{{ $t("Step_Name") }}</label>
                                    <input class="form-control" v-model="step.name"
                                           :id="'id_step_' + step.id + 'name'"/>
                                </div>
                            </div>

                            <!-- step data visibility controller -->
                            <div class="row pt-2">
                                <div class="col col-md-12">
                                    <b-button pill variant="primary" size="sm" class="ml-1"
                                              @click="step.time_visible = true" v-if="!step.time_visible">
                                        <i class="fas fa-plus-circle"></i> {{ $t("Time") }}
                                    </b-button>

                                    <b-button pill variant="primary" size="sm" class="ml-1"
                                              @click="step.ingredients_visible = true" v-if="!step.ingredients_visible">
                                        <i class="fas fa-plus-circle"></i> {{ $t("Ingredients") }}
                                    </b-button>

                                    <b-button pill variant="primary" size="sm" class="ml-1"
                                              @click="step.instruction_visible = true" v-if="!step.instruction_visible">
                                        <i class="fas fa-plus-circle"></i> {{ $t("Instructions") }}
                                    </b-button>

                                    <b-button pill variant="primary" size="sm" class="ml-1"
                                              @click="step.step_recipe_visible = true" v-if="!step.step_recipe_visible">
                                        <i class="fas fa-plus-circle"></i> {{ $t("Recipe") }}
                                    </b-button>

                                    <b-button pill variant="primary" size="sm" class="ml-1"
                                              @click="step.file_visible = true" v-if="!step.file_visible">
                                        <i class="fas fa-plus-circle"></i> {{ $t("File") }}
                                    </b-button>
                                    <b-button
                                        pill
                                        variant="primary"
                                        size="sm"
                                        class="ml-1"
                                        @click="
                                            paste_step = step.id
                                            $bvModal.show('id_modal_paste_ingredients')
                                        "
                                    >
                                        <i class="fas fa-plus-circle"></i> {{ $t("paste_ingredients") }}
                                    </b-button>
                                </div>
                            </div>

                            <div class="row pt-2" v-if="step.time_visible">
                                <div class="col-md-12">
                                    <label :for="'id_step_' + step.id + '_time'">{{ $t("step_time_minutes") }}</label>
                                    <input class="form-control" v-model="step.time"
                                           :id="'id_step_' + step.id + '_time'"/>
                                </div>
                            </div>

                            <div class="row pt-2" v-if="step.file_visible">
                                <div class="col-md-12">
                                    <label :for="'id_step_' + step.id + '_file'">{{ $t("File") }}</label>
                                    <b-input-group>
                                        <multiselect
                                            ref="file"
                                            v-model="step.file"
                                            :options="files"
                                            :close-on-select="true"
                                            :clear-on-select="true"
                                            :allow-empty="true"
                                            :preserve-search="true"
                                            :placeholder="$t('select_file')"
                                            :select-label="$t('Select')"
                                            :selected-label="$t('Selected')"
                                            :deselect-label="$t('remove_selection')"
                                            :id="'id_step_' + step.id + '_file'"
                                            label="name"
                                            track-by="name"
                                            :multiple="false"
                                            :loading="files_loading"
                                            style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
                                            @search-change="searchFiles"
                                        >
                                            <template v-slot:noOptions>{{ $t("empty_list") }}</template>
                                        </multiselect>
                                        <b-input-group-append>
                                            <b-button
                                                variant="primary"
                                                @click="
                                                    step_for_file_create = step
                                                    show_file_create = true
                                                "
                                            >
                                                +
                                            </b-button>
                                        </b-input-group-append>
                                    </b-input-group>
                                </div>
                            </div>

                            <div class="row pt-2" v-if="step.step_recipe_visible">
                                <div class="col-md-12">
                                    <label :for="'id_step_' + step.id + '_recipe'">{{ $t("Recipe") }}</label>
                                    <multiselect
                                        ref="step_recipe"
                                        v-model="step.step_recipe"
                                        :options="recipes.map((recipe) => recipe.id)"
                                        :close-on-select="true"
                                        :clear-on-select="true"
                                        :allow-empty="true"
                                        :preserve-search="true"
                                        :internal-search="false"
                                        :limit="options_limit"
                                        :placeholder="$t('select_recipe')"
                                        :select-label="$t('Select')"
                                        :selected-label="$t('Selected')"
                                        :deselect-label="$t('remove_selection')"
                                        :id="'id_step_' + step.id + '_recipe'"
                                        :custom-label="(opt) => recipes.find((x) => x.id === opt).name"
                                        :multiple="false"
                                        :loading="recipes_loading"
                                        @search-change="searchRecipes"
                                    >
                                        <template v-slot:noOptions>{{ $t("empty_list") }}</template>
                                    </multiselect>
                                </div>
                            </div>

                            <div class="row pt-2" v-if="step.ingredients_visible">
                                <div class="col-md-12">
                                    <div class="jumbotron" style="padding: 16px">
                                        <div class="row">
                                            <div class="col-md-12">
                                                <h4>{{ $t("Ingredients") }}</h4>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col-md-12 pr-0 pl-0 pr-md-2 pl-md-2 mt-2">
                                                <draggable :list="step.ingredients" group="ingredients"
                                                           :empty-insert-threshold="10" handle=".handle"
                                                           @sort="sortIngredients(step)">
                                                    <div v-for="(ingredient, index) in step.ingredients"
                                                         :key="ingredient.id">
                                                        <hr class="d-md-none"/>
                                                        <div class="text-center" v-if="ingredient.original_text !== null">
                                                            <small class="text-muted"><i class="fas fa-globe"></i>
                                                                {{ ingredient.original_text }}</small>
                                                        </div>
                                                        <div class="d-flex">
                                                            <div class="flex-grow-0 handle align-self-start">
                                                                <button type="button"
                                                                        class="btn btn-lg shadow-none pr-0 pl-1 pr-md-2 pl-md-2">
                                                                    <i class="fas fa-arrows-alt-v"></i></button>
                                                            </div>

                                                            <div class="flex-fill row"
                                                                 style="margin-left: 4px; margin-right: 4px">
                                                                <div class="col-lg-2 col-md-6 small-padding"
                                                                     v-if="!ingredient.is_header">
                                                                    <input
                                                                        class="form-control"
                                                                        v-model="ingredient.amount"
                                                                        type="number"
                                                                        step="any"
                                                                        v-if="!ingredient.no_amount"
                                                                        :id="`amount_${step_index}_${index}`"
                                                                    />
                                                                </div>

                                                                <div class="col-lg-2 col-md-6 small-padding"
                                                                     v-if="!ingredient.is_header">
                                                                    <!-- search set to false to allow API to drive results & order -->
                                                                    <multiselect
                                                                        v-if="!ingredient.no_amount"
                                                                        ref="unit"
                                                                        v-model="ingredient.unit"
                                                                        :options="units"
                                                                        :close-on-select="true"
                                                                        :clear-on-select="true"
                                                                        :allow-empty="true"
                                                                        :preserve-search="true"
                                                                        :internal-search="false"
                                                                        :limit="options_limit"
                                                                        :placeholder="$t('select_unit')"
                                                                        :tag-placeholder="$t('Create')"
                                                                        :select-label="$t('Select')"
                                                                        :selected-label="$t('Selected')"
                                                                        :deselect-label="$t('remove_selection')"
                                                                        :taggable="true"
                                                                        @tag="addUnitType"
                                                                        :id="`unit_${step_index}_${index}`"
                                                                        label="name"
                                                                        track-by="name"
                                                                        :multiple="false"
                                                                        :loading="units_loading"
                                                                        @search-change="searchUnits"
                                                                    >
                                                                        <template v-slot:noOptions>{{
                                                                                $t("empty_list")
                                                                            }}
                                                                        </template>
                                                                    </multiselect>
                                                                </div>
                                                                <div class="col-lg-4 col-md-6 small-padding"
                                                                     v-if="!ingredient.is_header">
                                                                    <!-- search set to false to allow API to drive results & order -->

                                                                    <multiselect
                                                                        ref="food"
                                                                        v-model="ingredient.food"
                                                                        :options="foods"
                                                                        :close-on-select="true"
                                                                        :clear-on-select="true"
                                                                        :allow-empty="true"
                                                                        :preserve-search="true"
                                                                        :internal-search="false"
                                                                        :limit="options_limit"
                                                                        :placeholder="$t('select_food')"
                                                                        :tag-placeholder="$t('Create')"
                                                                        :select-label="$t('Select')"
                                                                        :selected-label="$t('Selected')"
                                                                        :deselect-label="$t('remove_selection')"
                                                                        :taggable="true"
                                                                        @tag="addFoodType"
                                                                        :id="`ingredient_${step_index}_${index}`"
                                                                        label="name"
                                                                        track-by="name"
                                                                        :multiple="false"
                                                                        :loading="foods_loading"
                                                                        @search-change="searchFoods"
                                                                    >
                                                                        <template v-slot:noOptions>{{
                                                                                $t("empty_list")
                                                                            }}
                                                                        </template>
                                                                    </multiselect>
                                                                </div>
                                                                <div class="small-padding"
                                                                     v-bind:class="{ 'col-lg-4 col-md-6': !ingredient.is_header, 'col-lg-12 col-md-12': ingredient.is_header }">
                                                                    <input
                                                                        class="form-control"
                                                                        maxlength="256"
                                                                        v-model="ingredient.note"
                                                                        v-bind:placeholder="$t('Note')"
                                                                        v-on:keydown.tab="
                                                                            (event) => {
                                                                                if (step.ingredients.indexOf(ingredient) === step.ingredients.length - 1) {
                                                                                    event.preventDefault()
                                                                                    addIngredient(step)
                                                                                }
                                                                            }
                                                                        "
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div class="flex-grow-0 small-padding">
                                                                <a
                                                                    class="btn shadow-none btn-lg pr-1 pl-0 pr-md-2 pl-md-2"
                                                                    href="#"
                                                                    role="button"
                                                                    id="dropdownMenuLink2"
                                                                    data-toggle="dropdown"
                                                                    aria-haspopup="true"
                                                                    aria-expanded="false"
                                                                >
                                                                    <i class="fas fa-ellipsis-v text-muted"></i>
                                                                </a>

                                                                <div class="dropdown-menu dropdown-menu-right"
                                                                     aria-labelledby="dropdownMenuLink2">
                                                                    <button type="button" class="dropdown-item"
                                                                            @click="removeIngredient(step, ingredient)">
                                                                        <i class="fa fa-trash fa-fw"></i>
                                                                        {{ $t("Delete") }}
                                                                    </button>

                                                                    <button type="button" class="dropdown-item"
                                                                            v-if="!ingredient.is_header"
                                                                            @click="ingredient.is_header = true">
                                                                        <i class="fas fa-heading fa-fw"></i>
                                                                        {{ $t("Make_Header") }}
                                                                    </button>

                                                                    <button type="button" class="dropdown-item"
                                                                            v-if="ingredient.is_header"
                                                                            @click="ingredient.is_header = false">
                                                                        <i class="fas fa-leaf fa-fw"></i>
                                                                        {{ $t("Make_Ingredient") }}
                                                                    </button>

                                                                    <button type="button" class="dropdown-item"
                                                                            v-if="!ingredient.no_amount"
                                                                            @click="ingredient.no_amount = true">
                                                                        <i class="fas fa-balance-scale-right fa-fw"></i>
                                                                        {{ $t("Disable_Amount") }}
                                                                    </button>

                                                                    <button type="button" class="dropdown-item"
                                                                            v-if="ingredient.no_amount"
                                                                            @click="ingredient.no_amount = false">
                                                                        <i class="fas fa-balance-scale-right fa-fw"></i>
                                                                        {{ $t("Enable_Amount") }}
                                                                    </button>
                                                                    <button type="button" class="dropdown-item"
                                                                            @click="copyTemplateReference(index, ingredient)">
                                                                        <i class="fas fa-code"></i>
                                                                        {{ $t("Copy_template_reference") }}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </draggable>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col-md-2 offset-md-5"
                                                 style="text-align: center; margin-top: 8px">
                                                <button class="btn btn-success btn-block" @click="addIngredient(step)">
                                                    <i class="fa fa-plus"></i></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="row pt-2" v-if="step.instruction_visible">
                                <div class="col-md-12">
                                    <label :for="'id_instruction_' + step.id">{{ $t("Instructions") }}</label>
                                    <v-md-editor
                                        v-model="step.instruction"
                                        height="30vh"
                                        left-toolbar="undo redo | h bold italic strikethrough quote | ul ol table hr | link image code"
                                        right-toolbar="preview sync-scroll fullscreen"
                                        :id="'id_instruction_' + step.id"
                                        mode="edit"
                                    ></v-md-editor>

                                    <!-- TODO markdown DOCS link and markdown editor -->
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- step add and sort spacer between steps -->
                    <div class="row">
                        <div class="col col-md-12 text-center">
                            <b-button-group>
                                <button type="button" @click="addStep(step_index)" class="btn btn-success shadow-none">
                                    {{ $t("Add_Step") }}
                                </button>

                                <button type="button" v-b-modal:id_modal_sort class="btn btn-warning shadow-none"><i
                                    class="fas fa-sort-amount-down-alt fa-lg"></i></button>
                            </b-button-group>
                        </div>
                    </div>
                </div>
            </draggable>


            <div class="row" v-if="recipe.steps.length === 0">
                <div class="col col-md-12 text-center">
                    <b-button-group>
                        <button type="button" @click="addStep(0)" class="btn btn-success shadow-none">
                            {{ $t("Add_Step") }}
                        </button>
                    </b-button-group>
                </div>
            </div>


            <br/>
            <br/>
            <br/>
            <br/>
            <br/>
            <br/>

            <!-- bottom buttons save/close/view -->
            <div class="row fixed-bottom p-2 b-2 border-top text-center" style="background: white"
                 v-if="recipe !== undefined">
                <div class="col-md-3 col-6">
                    <a :href="resolveDjangoUrl('delete_recipe', recipe.id)"
                       class="btn btn-block btn-danger shadow-none">{{ $t("Delete") }}</a>
                </div>
                <div class="col-md-3 col-6">
                    <a :href="resolveDjangoUrl('view_recipe', recipe.id)">
                        <button class="btn btn-block btn-primary shadow-none">{{ $t("View") }}</button>
                    </a>
                </div>
                <div class="col-md-3 col-6">
                    <button type="button" @click="updateRecipe(false)" v-b-tooltip.hover
                            :title="`${$t('Key_Ctrl')} + S`" class="btn btn-sm btn-block btn-info shadow-none">
                        {{ $t("Save") }}
                    </button>
                </div>
                <div class="col-md-3 col-6">
                    <button type="button" @click="updateRecipe(true)" v-b-tooltip.hover
                            :title="`${$t('Key_Ctrl')} + ${$t('Key_Shift')} + S`"
                            class="btn btn-sm btn-block btn-success shadow-none">
                        {{ $t("Save_and_View") }}
                    </button>
                </div>
            </div>

            <!-- modal for sorting steps -->
            <b-modal id="id_modal_sort" v-bind:title="$t('Sort')" ok-only>
                <draggable :list="recipe.steps" group="step_sorter" :empty-insert-threshold="10" handle=".handle"
                           @sort="sortSteps()" class="list-group" tag="ul">
                    <li class="list-group-item" v-for="(step, step_index) in recipe.steps" v-bind:key="step_index">
                        <button type="button" class="btn btn-lg shadow-none handle"><i class="fas fa-arrows-alt-v"></i>
                        </button>
                        <template v-if="step.name !== ''">{{ step.name }}</template>
                        <template v-else>{{ $t("Step") }} {{ step_index + 1 }}</template>
                    </li>
                </draggable>
            </b-modal>

            <!-- modal for pasting list of ingredients -->
            <b-modal
                id="id_modal_paste_ingredients"
                v-bind:title="$t('ingredient_list')"
                @ok="appendIngredients"
                @cancel="paste_ingredients = paste_step = undefined"
                @close="paste_ingredients = paste_step = undefined"
            >
                <b-form-textarea id="paste_ingredients" v-model="paste_ingredients"
                                 :placeholder="$t('paste_ingredients_placeholder')" rows="10"></b-form-textarea>
            </b-modal>

            <!-- form to create files on the fly -->
            <generic-modal-form :model="Models.USERFILE" :action="Actions.CREATE" :show="show_file_create"
                                @finish-action="fileCreated"/>
        </div>
    </div>
</template>

<script>
import Vue from "vue"
import {BootstrapVue} from "bootstrap-vue"

import "bootstrap-vue/dist/bootstrap-vue.css"

import draggable from "vuedraggable"
import {
    ApiMixin,
    resolveDjangoUrl,
    ResolveUrlMixin,
    StandardToasts,
    convertEnergyToCalories,
    energyHeading
} from "@/utils/utils"
import Multiselect from "vue-multiselect"
import {ApiApiFactory} from "@/utils/openapi/api"
import LoadingSpinner from "@/components/LoadingSpinner"

import VueMarkdownEditor from "@kangc/v-md-editor"
import "@kangc/v-md-editor/lib/style/base-editor.css"
import vuepressTheme from "@kangc/v-md-editor/lib/theme/vuepress.js"
import "@kangc/v-md-editor/lib/theme/style/vuepress.css"
import Prism from "prismjs"

VueMarkdownEditor.use(vuepressTheme, {
    Prism,
})

import enUS from "@kangc/v-md-editor/lib/lang/en-US"
import GenericModalForm from "@/components/Modals/GenericModalForm"

VueMarkdownEditor.lang.use("en-US", enUS)

Vue.use(VueMarkdownEditor)

Vue.use(BootstrapVue)

export default {
    name: "RecipeEditView",
    mixins: [ResolveUrlMixin, ApiMixin],
    components: {Multiselect, LoadingSpinner, draggable, GenericModalForm},
    data() {
        return {
            recipe_id: window.RECIPE_ID,
            recipe: undefined,
            recipe_changed: undefined,
            keywords: [],
            keywords_loading: false,
            foods: [],
            foods_loading: false,
            units: [],
            units_loading: false,
            files: [],
            files_loading: false,
            recipes: [],
            recipes_loading: false,
            message: "",
            options_limit: 25,
            paste_ingredients: undefined,
            paste_step: undefined,
            show_file_create: false,
            step_for_file_create: undefined,
            additional_visible: false,
            create_food: undefined,
        }
    },
    computed: {
        nutrition_visible: function () {
            return this.recipe.nutrition !== null
        },
    },
    mounted() {
        this.loadRecipe()
        this.searchUnits("")
        this.searchFoods("")
        this.searchKeywords("")
        this.searchFiles("")
        this.searchRecipes("")

        this.$i18n.locale = window.CUSTOM_LOCALE
    },
    created() {
        window.addEventListener("keydown", this.keyboardListener)
        window.addEventListener("beforeunload", this.warnPageLeave)
    },
    beforeUnmount() {
        window.removeEventListener("keydown", this.keyboardListener)
    },
    watch: {
        recipe: {
            deep: true,
            handler() {
                this.recipe_changed = this.recipe_changed !== undefined
            },
        },
        "recipe.name": function () {
            this.recipe.food_name = this.recipe.name.toLowerCase()
        },
        "recipe.create_food": function () {
            this.create_food = this.recipe.create_food
        },
    },
    methods: {
        keyboardListener: function (e) {
            if (e.code === "Space" && e.ctrlKey) {
                e.preventDefault() // present "Save Page" from getting triggered.

                for (let el of e.path) {
                    if (el.id !== undefined && el.id.includes("id_card_step_")) {
                        let step = this.recipe.steps[el.id.replace("id_card_step_", "")]
                        this.addIngredient(step)
                    }
                }
            }
            if (e.code === "KeyS" && e.ctrlKey && !e.shiftKey) {
                e.preventDefault()
                this.updateRecipe(false)
            }
            if (e.code === "KeyS" && e.ctrlKey && e.shiftKey) {
                e.preventDefault()
                this.updateRecipe(true)
            }
        },
        warnPageLeave: function (event) {
            if (this.recipe_changed) {
                event.returnValue = "this_string_cant_be_empty_because_of_firefox"
                return "this_string_cant_be_empty_because_of_firefox"
            }
        },
        loadRecipe: function () {
            let apiFactory = new ApiApiFactory()

            apiFactory
                .retrieveRecipe(this.recipe_id)
                .then((response) => {
                    this.recipe = response.data
                    this.loading = false

                    // set default visibility style for each component of the step
                    this.recipe.steps.forEach((s) => {
                        this.$set(s, "time_visible", s.time !== 0)
                        this.$set(s, "ingredients_visible", s.ingredients.length > 0 || this.recipe.steps.length === 1)
                        this.$set(s, "instruction_visible", s.instruction !== "" || this.recipe.steps.length === 1)
                        this.$set(s, "step_recipe_visible", s.step_recipe !== null)
                        this.$set(s, "file_visible", s.file !== null)
                    })

                    //TODO workaround function until view is properly refactored, loads name of selected sub recipe so the input can find its label
                    this.recipe.steps.forEach((s) => {
                        if (s.step_recipe != null) {
                            this.recipes.push(s.step_recipe_data)
                        }
                    })
                })
                .catch((err) => {
                    this.loading = false
                    StandardToasts.makeStandardToast(this, StandardToasts.FAIL_FETCH, err)
                })
        },
        updateRecipe: function (view_after) {
            let apiFactory = new ApiApiFactory()

            this.normalizeEnergy()

            this.sortSteps()
            for (let s of this.recipe.steps) {
                this.sortIngredients(s)
            }

            if (this.recipe.waiting_time === "" || isNaN(this.recipe.waiting_time)) {
                this.recipe.waiting_time = 0
            }
            if (this.recipe.working_time === "" || isNaN(this.recipe.working_time)) {
                this.recipe.working_time = 0
            }

            this.recipe.servings = Math.floor(this.recipe.servings) // temporary fix until a proper framework for frontend input validation is established
            if (this.recipe.servings === "" || isNaN(this.recipe.servings) || this.recipe.servings === 0) {
                this.recipe.servings = 1
            }

            this.recipe.steps.forEach(x => {
                if (x.time === "") {
                    x.time = 0
                }
            })

            apiFactory
                .updateRecipe(this.recipe_id, this.recipe, {})
                .then((response) => {
                    StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_UPDATE)
                    this.recipe_changed = false
                    if (this.create_food) {
                        apiFactory.createFood({
                            name: this.recipe.food_name,
                            recipe: {id: this.recipe.id, name: this.recipe.name}
                        })
                    }
                    if (view_after) {
                        location.href = resolveDjangoUrl("view_recipe", this.recipe_id)
                    }
                })
                .catch((err) => {
                    StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
                })
        },
        uploadImage: function (file) {
            let apiClient = new ApiApiFactory()
            if (file !== undefined) {
                apiClient
                    .imageRecipe(this.recipe.id, file)
                    .then((request) => {
                        this.recipe.image = request.data.image
                        this.recipe_changed = false
                        StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_UPDATE)
                    })
                    .catch((err) => {
                        StandardToasts.makeStandardToast(this, StandardToasts.FAIL_UPDATE, err)
                    })
            }
        },
        deleteImage: function () {
            if (confirm(this.$t("delete_confirmation", {}))) {
                let apiClient = new ApiApiFactory()
                apiClient
                    .imageRecipe(this.recipe.id, undefined)
                    .then((request) => {
                        this.recipe.image = null
                        this.recipe_changed = false
                        StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_DELETE)
                    })
                    .catch((err) => {
                        StandardToasts.makeStandardToast(this, StandardToasts.FAIL_DELETE, err)
                    })
            }
        },
        addStep: function (step_index) {
            //TODO see if default can be generated from options request
            let empty_step = {
                instruction: "",
                ingredients: [],
                show_as_header: false,
                time_visible: false,
                ingredients_visible: true,
                instruction_visible: true,
                step_recipe_visible: false,
                file_visible: false,
            }
            if (step_index !== undefined) {
                console.log("adding at index", step_index)
                this.recipe.steps.splice(step_index + 1, 0, empty_step)
            } else {
                this.recipe.steps.push(empty_step)
            }
        },
        sortSteps: function () {
            this.recipe.steps.forEach(function (element, index) {
                element.order = index
            })
        },
        sortIngredients: function (step) {
            step.ingredients.forEach(function (element, index) {
                element.order = index
            })
        },
        addIngredient: function (step) {
            //TODO see if default can be generated from options request
            step.ingredients.push({
                food: null,
                unit: {
                    name: window.DEFAULT_UNIT,
                },
                amount: 0,
                note: "",
                order: 0,
                is_header: false,
                no_amount: false,
                original_text: null,
            })
            this.sortIngredients(step)
            this.$nextTick(() => document.getElementById(`amount_${this.recipe.steps.indexOf(step)}_${step.ingredients.length - 1}`).select())
        },
        removeIngredient: function (step, ingredient) {
            if (confirm(this.$t("confirm_delete", {object: this.$t("Ingredient")}))) {
                step.ingredients = step.ingredients.filter((item) => item !== ingredient)
            }
        },
        removeStep: function (step) {
            if (confirm(this.$t("confirm_delete", {object: this.$t("Step")}))) {
                this.recipe.steps = this.recipe.steps.filter((item) => item !== step)
            }
        },
        moveStep: function (step, new_index) {
            this.recipe.steps.splice(this.recipe.steps.indexOf(step), 1)
            this.recipe.steps.splice(new_index < 0 ? 0 : new_index, 0, step)
            this.sortSteps()
        },
        addFoodType: function (tag, index) {
            let [tmp, step, id] = index.split("_")

            let new_food = this.recipe.steps[step].ingredients[id]
            new_food.food = {name: tag}
            this.foods.push(new_food.food)
            this.recipe.steps[step].ingredients[id] = new_food
        },
        addUnitType: function (tag, index) {
            let [tmp, step, id] = index.split("_")

            let new_unit = this.recipe.steps[step].ingredients[id]
            new_unit.unit = {name: tag}
            this.units.push(new_unit.unit)
            this.recipe.steps[step].ingredients[id] = new_unit
        },
        addKeyword: function (tag) {
            let new_keyword = {label: tag, name: tag}
            this.recipe.keywords.push(new_keyword)
        },
        searchKeywords: function (query) {
            let apiFactory = new ApiApiFactory()

            this.keywords_loading = true
            apiFactory
                .listKeywords(query, undefined, undefined, 1, this.options_limit)
                .then((response) => {
                    this.keywords = response.data.results
                    this.keywords_loading = false
                })
                .catch((err) => {
                    StandardToasts.makeStandardToast(this, StandardToasts.FAIL_FETCH, err)
                })
        },
        searchFiles: function (query) {
            let apiFactory = new ApiApiFactory()

            this.files_loading = true
            apiFactory
                .listUserFiles({query: {query: query}})
                .then((response) => {
                    this.files = response.data
                    this.files_loading = false
                })
                .catch((err) => {
                    StandardToasts.makeStandardToast(this, StandardToasts.FAIL_FETCH, err)
                })
        },
        searchRecipes: function (query) {
            this.recipes_loading = true
            this.genericAPI(this.Models.RECIPE, this.Actions.LIST, {query: query})
                .then((result) => {
                    this.recipes = result.data.results
                    this.recipes_loading = false
                })
                .catch((err) => {
                    StandardToasts.makeStandardToast(this, StandardToasts.FAIL_FETCH, err)
                })
        },
        searchUnits: function (query) {
            let apiFactory = new ApiApiFactory()

            this.units_loading = true
            apiFactory
                .listUnits(query, 1, this.options_limit)
                .then((response) => {
                    this.units = response.data.results
                    let unique_units = this.units.map(u => u.name)
                    if (this.recipe !== undefined) {
                        for (let s of this.recipe.steps) {
                            for (let i of s.ingredients) {
                                if (i.unit !== null && i.unit.id === undefined && !unique_units.includes(i.unit.name) ) {
                                    this.units.push(i.unit)
                                }
                            }
                        }
                    }
                    this.units_loading = false
                })
                .catch((err) => {
                    StandardToasts.makeStandardToast(this, StandardToasts.FAIL_FETCH, err)
                })
        },
        searchFoods: function (query) {
            let apiFactory = new ApiApiFactory()

            this.foods_loading = true
            apiFactory
                .listFoods(query, undefined, undefined, 1, this.options_limit)
                .then((response) => {
                    this.foods = response.data.results
                    let unique_foods = this.foods.map(f => f.name)
                    if (this.recipe !== undefined) {
                        for (let s of this.recipe.steps) {
                            for (let i of s.ingredients) {
                                if (i.food !== null && i.food.id === undefined && !unique_foods.includes(i.food.name)) {
                                    this.foods.push(i.food)
                                }
                            }
                        }
                    }

                    this.foods_loading = false
                })
                .catch((err) => {
                    StandardToasts.makeStandardToast(this, StandardToasts.FAIL_FETCH, err)
                })
        },
        fileCreated: function (data) {
            if (data !== "cancel") {
                this.step_for_file_create.file = data.item
            }
            this.show_file_create = false
        },
        scrollToStep: function (step_index) {
            document.getElementById("id_step_" + step_index).scrollIntoView({behavior: "smooth"})
        },
        addNutrition: function () {
            this.recipe.nutrition = {
                carbohydrates: 0,
                fats: 0,
                proteins: 0,
                calories: 0,
            }
        },
        removeNutrition: function () {
            this.recipe.nutrition = null
        },
        copyTemplateReference: function (index, ingredient) {
            const el = document.createElement("textarea")

            let tag = `\u007B\u007B ingredients[${index}] \u007D\u007D`
            if (ingredient.food !== null) {
                tag += `\u007B# ${ingredient.food.name} #\u007D`
            }
            el.value = tag
            document.body.appendChild(el)
            el.select()
            document.execCommand("copy")
            document.body.removeChild(el)
        },
        normalizeEnergy: function () {
            if (this.recipe.nutrition && this.recipe.nutrition.calories) {
                this.recipe.nutrition.calories = convertEnergyToCalories(this.recipe.nutrition.calories)
            }
        },
        energy: function () {
            return energyHeading()
        },
        appendIngredients: function () {
            let ing_list = this.paste_ingredients.split(/\r?\n/)
            let step = this.recipe.steps.findIndex((x) => x.id == this.paste_step)
            let order = Math.max(...this.recipe.steps[step].ingredients.map((x) => x.order), -1) + 1
            this.recipe.steps[step].ingredients_visible = true
            ing_list.forEach((ing) => {
                if (ing.trim() !== "") {
                    this.genericPostAPI("api_ingredient_from_string", {text: ing}).then((result) => {
                        let unit = null
                        if (result.data.unit !== "") {
                            unit = {name: result.data.unit}
                        }
                        this.recipe.steps[step].ingredients.splice(order, 0, {
                            amount: result.data.amount,
                            unit: unit,
                            food: {name: result.data.food},
                            note: result.data.note,
                            original_text: ing,
                        })
                    })
                    order++
                }
            })
        },
    },
}
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

<style>
.small-padding {
    padding-left: 2px;
    padding-right: 2px;
    margin-top: 2px;
}

textarea:not(.form-control) {
    border: 0 !important;
}
</style>
