<template>
    <div id="app" class="search" style="padding-bottom: 60px">
        <RecipeSwitcher ref="ref_recipe_switcher" />
        <div class="row">
            <div class="col-12 col-xl-10 col-lg-10 offset-xl-1 offset-lg-1">
                <div class="row">
                    <div class="col col-md-12">
                        <div class="row justify-content-center">
                            <div class="col-12 col-lg-10 col-xl-10 mt-2">
                                <b-input-group>
                                    <b-input
                                        class="form-control form-control-lg form-control-borderless form-control-search"
                                        v-model="search.search_input"
                                        v-bind:placeholder="$t('Search')"
                                    ></b-input>
                                    <b-input-group-append>
                                        <b-button v-b-tooltip.hover :title="$t('show_sql')" @click="showSQL()" v-if="debug && ui.sql_debug">
                                            <i class="fas fa-bug" style="font-size: 1.5em"></i>
                                        </b-button>
                                        <b-button
                                            v-b-toggle.collapse_advanced_search
                                            v-b-tooltip.hover
                                            :title="$t('advanced_search_settings')"
                                            v-bind:variant="searchFiltered(true) ? 'danger' : 'primary'"
                                        >
                                            <i class="fas fa-sliders-h"></i>
                                        </b-button>
                                    </b-input-group-append>
                                </b-input-group>
                            </div>
                        </div>

                        <b-collapse id="collapse_advanced_search" class="mt-2 shadow-sm" v-model="search.advanced_search_visible">
                            <div class="card">
                                <div class="card-body p-4">
                                    <div class="row">
                                        <div class="col-md-3 col-6 mb-1 mb-md-0">
                                            <a class="btn btn-primary btn-block text-uppercase" :href="resolveDjangoUrl('new_recipe')">{{ $t("New_Recipe") }}</a>
                                        </div>
                                        <div class="col-md-3 col-6 mb-1 mb-md-0">
                                            <a class="btn btn-primary btn-block text-uppercase" :href="resolveDjangoUrl('data_import_url')">{{ $t("Import") }}</a>
                                        </div>
                                        <div class="col-md-3 col-6 mb-1 mb-md-0">
                                            <button
                                                class="btn btn-block text-uppercase"
                                                v-b-tooltip.hover
                                                :title="$t('show_only_internal')"
                                                v-bind:class="{ 'btn-success': search.search_internal, 'btn-primary': !search.search_internal }"
                                                @click="
                                                    search.search_internal = !search.search_internal
                                                    refreshData()
                                                "
                                            >
                                                <!-- TODO is this the right place to refresh data?  or deep watch on this.search?? -->
                                                {{ $t("Internal") }}
                                            </button>
                                        </div>

                                        <div class="col-md-3 col-6 mb-1 mb-md-0">
                                            <button id="id_settings_button" class="btn btn-primary btn-block text-uppercase"><i class="fas fa-cog fa-lg m-1"></i></button>
                                        </div>
                                    </div>

                                    <b-popover target="id_settings_button" triggers="click" placement="bottom">
                                        <b-tabs content-class="mt-1 text-nowrap" small>
                                            <b-tab :title="$t('Settings')" active :title-link-class="['mx-0']">
                                                <b-form-group v-bind:label="$t('Recently_Viewed')" label-for="popover-input-1" label-cols="8" class="mb-1">
                                                    <b-form-input type="number" v-model="ui.recently_viewed" id="popover-input-1" size="sm" class="mt-1"></b-form-input>
                                                </b-form-group>

                                                <b-form-group v-bind:label="$t('Recipes_per_page')" label-for="popover-input-page-count" label-cols="8" class="mb-1">
                                                    <b-form-input type="number" v-model="ui.page_size" id="popover-input-page-count" size="sm" class="mt-1"></b-form-input>
                                                </b-form-group>

                                                <b-form-group v-bind:label="$t('Meal_Plan')" label-for="popover-input-2" label-cols="8" class="mb-1">
                                                    <b-form-checkbox switch v-model="ui.show_meal_plan" id="popover-input-2" size="sm" class="mt-2"></b-form-checkbox>
                                                </b-form-group>

                                                <b-form-group v-if="ui.show_meal_plan" v-bind:label="$t('Meal_Plan_Days')" label-for="popover-input-5" label-cols="8" class="mb-1">
                                                    <b-form-input type="number" v-model.number="ui.meal_plan_days" id="popover-input-5" size="sm" class="mt-1"></b-form-input>
                                                </b-form-group>

                                                <b-form-group v-bind:label="$t('Sort_by_new')" label-for="popover-input-3" label-cols="8" class="mb-1">
                                                    <b-form-checkbox switch v-model="ui.sort_by_new" id="popover-input-3" size="sm" class="mt-2"></b-form-checkbox>
                                                </b-form-group>
                                                <div class="row" style="margin-top: 1vh">
                                                    <div class="col-12">
                                                        <a :href="resolveDjangoUrl('view_settings') + '#search'">{{ $t("Search Settings") }}</a>
                                                    </div>
                                                </div>
                                            </b-tab>
                                            <b-tab :title="$t('fields')" :title-link-class="['mx-0']">
                                                <b-form-group v-bind:label="$t('show_keywords')" label-for="popover-show_keywords" label-cols="8" class="mb-1">
                                                    <b-form-checkbox switch v-model="ui.show_keywords" id="popover-show_keywords" size="sm" class="mt-2"></b-form-checkbox>
                                                </b-form-group>
                                                <b-form-group v-bind:label="$t('show_foods')" label-for="popover-show_foods" label-cols="8" class="mb-1">
                                                    <b-form-checkbox switch v-model="ui.show_foods" id="popover-show_foods" size="sm" class="mt-2"></b-form-checkbox>
                                                </b-form-group>
                                                <b-form-group v-bind:label="$t('show_books')" label-for="popover-input-show_books" label-cols="8" class="mb-1">
                                                    <b-form-checkbox switch v-model="ui.show_books" id="popover-input-show_books" size="sm" class="mt-2"></b-form-checkbox>
                                                </b-form-group>
                                                <b-form-group v-bind:label="$t('show_rating')" label-for="popover-show_rating" label-cols="8" class="mb-1">
                                                    <b-form-checkbox switch v-model="ui.show_rating" id="popover-show_rating" size="sm" class="mt-2"></b-form-checkbox>
                                                </b-form-group>
                                                <b-form-group v-bind:label="$t('show_units')" label-for="popover-show_units" label-cols="8" class="mb-1">
                                                    <b-form-checkbox switch v-model="ui.show_units" id="popover-show_units" size="sm" class="mt-2"></b-form-checkbox>
                                                </b-form-group>
                                                <b-form-group v-bind:label="$t('show_filters')" label-for="popover-show_filters" label-cols="8" class="mb-1">
                                                    <b-form-checkbox switch v-model="ui.show_filters" id="popover-show_filters" size="sm" class="mt-2"></b-form-checkbox>
                                                </b-form-group>
                                                <b-form-group v-bind:label="$t('show_sortby')" label-for="popover-show_sortby" label-cols="8" class="mb-1">
                                                    <b-form-checkbox switch v-model="ui.show_sortby" id="popover-show_sortby" size="sm" class="mt-2"></b-form-checkbox>
                                                </b-form-group>
                                                <b-form-group v-bind:label="$t('times_cooked')" label-for="popover-show_timescooked" label-cols="8" class="mb-1">
                                                    <b-form-checkbox switch v-model="ui.show_timescooked" id="popover-show_cooked" size="sm" class="mt-2"></b-form-checkbox>
                                                </b-form-group>
                                                <b-form-group v-bind:label="$t('make_now')" label-for="popover-show_makenow" label-cols="8" class="mb-1">
                                                    <b-form-checkbox switch v-model="ui.show_makenow" id="popover-show_makenow" size="sm" class="mt-2"></b-form-checkbox>
                                                </b-form-group>
                                                <b-form-group v-bind:label="$t('last_cooked')" label-for="popover-show_cookedon" label-cols="8" class="mb-1">
                                                    <b-form-checkbox switch v-model="ui.show_cookedon" id="popover-show_cookedon" size="sm" class="mt-2"></b-form-checkbox>
                                                </b-form-group>
                                                <b-form-group v-bind:label="$t('last_viewed')" label-for="popover-show_viewedon" label-cols="8" class="mb-1">
                                                    <b-form-checkbox switch v-model="ui.show_viewedon" id="popover-show_viewedon" size="sm" class="mt-2"></b-form-checkbox>
                                                </b-form-group>
                                                <b-form-group v-bind:label="$t('created_on')" label-for="popover-show_createdon" label-cols="8" class="mb-1">
                                                    <b-form-checkbox switch v-model="ui.show_createdon" id="popover-show_createdon" size="sm" class="mt-2"></b-form-checkbox>
                                                </b-form-group>
                                                <b-form-group v-bind:label="$t('updatedon')" label-for="popover-show_updatedon" label-cols="8" class="mb-1">
                                                    <b-form-checkbox switch v-model="ui.show_updatedon" id="popover-show_updatedon" size="sm" class="mt-2"></b-form-checkbox>
                                                </b-form-group>
                                            </b-tab>

                                            <b-tab :title="$t('advanced')" :title-link-class="['mx-0']">
                                                <b-form-group v-bind:label="$t('remember_search')" label-for="popover-rem-search" label-cols="8" class="mb-1">
                                                    <b-form-checkbox switch v-model="ui.remember_search" id="popover-rem-search" size="sm" class="mt-2"></b-form-checkbox>
                                                </b-form-group>
                                                <b-form-group
                                                    v-if="ui.remember_search"
                                                    v-bind:label="$t('remember_hours')"
                                                    label-for="popover-input-rem-hours"
                                                    label-cols="8"
                                                    class="mb-1"
                                                >
                                                    <b-form-input type="number" v-model="ui.remember_hours" id="popover-rem-hours" size="sm" class="mt-1"></b-form-input>
                                                </b-form-group>
                                                <b-form-group v-if="debug" v-bind:label="$t('sql_debug')" label-for="popover-input-sqldebug" label-cols="8" class="mb-1">
                                                    <b-form-checkbox switch v-model="ui.sql_debug" id="popover-input-sqldebug" size="sm" class="mt-2"></b-form-checkbox>
                                                </b-form-group>
                                            </b-tab>
                                        </b-tabs>

                                        <div class="row" style="margin-top: 1vh">
                                            <div class="col-12" style="text-align: right">
                                                <b-button size="sm" variant="secondary" style="margin-right: 8px" @click="$root.$emit('bv::hide::popover')"
                                                    >{{ $t("Close") }}
                                                </b-button>
                                            </div>
                                        </div>
                                    </b-popover>

                                    <!-- custom filters filter -->
                                    <div class="row" v-if="ui.show_filters || ui.show_sortby">
                                        <div class="col-12">
                                            <b-input-group class="mt-2">
                                                <generic-multiselect
                                                    v-if="ui.show_filters"
                                                    @change="genericSelectChanged"
                                                    parent_variable="search_filter"
                                                    :initial_single_selection="search.search_filter"
                                                    :model="Models.CUSTOM_FILTER"
                                                    style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
                                                    :placeholder="$t('Custom Filter')"
                                                    :multiple="false"
                                                    :limit="50"
                                                />
                                                <multiselect
                                                    v-if="ui.show_sortby"
                                                    v-model="search.sort_order"
                                                    :options="sortOptions"
                                                    :multiple="true"
                                                    :hide-selected="true"
                                                    :internal-search="false"
                                                    @input="refreshData(false)"
                                                    label="text"
                                                    track-by="id"
                                                    style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
                                                    :placeholder="$t('sort_by')"
                                                />
                                            </b-input-group>
                                        </div>
                                    </div>
                                    <!-- keywords filter -->
                                    <h6 class="mb-0" v-if="ui.expert_mode && search.keywords_fields > 1">
                                        {{ $t("Keywords") }}
                                    </h6>
                                    <span
                                        class="text-sm-left text-warning"
                                        v-if="ui.expert_mode && search.keywords_fields > 1 && hasDuplicateFilter(search.search_keywords, search.keywords_fields)"
                                        >{{ $t("warning_duplicate_filter") }}</span
                                    >
                                    <div class="row" v-if="ui.show_keywords">
                                        <div class="col-12">
                                            <b-input-group class="mt-2" v-for="(k, a) in keywordFields" :key="a">
                                                <template #prepend v-if="ui.expert_mode">
                                                    <b-input-group-text style="width: 3em" @click="addField('keywords', k)">
                                                        <i class="fas fa-plus-circle text-primary" v-if="k == search.keywords_fields && k < 4" />
                                                    </b-input-group-text>
                                                    <b-input-group-text style="width: 3em" @click="removeField('keywords', k)">
                                                        <i class="fas fa-minus-circle text-primary" v-if="k == search.keywords_fields && k > 1" />
                                                    </b-input-group-text>
                                                </template>
                                                <generic-multiselect
                                                    v-if="!ui.tree_select"
                                                    @change="genericSelectChanged"
                                                    :parent_variable="`search_keywords::${a}`"
                                                    :initial_selection="search.search_keywords[a].items"
                                                    :model="Models.KEYWORD"
                                                    style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
                                                    :placeholder="$t('Keywords')"
                                                    :limit="50"
                                                />
                                                <b-input-group-append>
                                                    <b-input-group-text>
                                                        <b-form-checkbox
                                                            v-model="search.search_keywords[a].operator"
                                                            name="check-button"
                                                            @change="refreshData(false)"
                                                            class="shadow-none"
                                                            switch
                                                            style="width: 5em"
                                                        >
                                                            <span class="text-uppercase" v-if="search.search_keywords[a].operator">{{ $t("or") }}</span>
                                                            <span class="text-uppercase" v-else>{{ $t("and") }}</span>
                                                        </b-form-checkbox>
                                                    </b-input-group-text>
                                                </b-input-group-append>
                                                <b-input-group-append v-if="ui.expert_mode">
                                                    <b-input-group-text>
                                                        <b-form-checkbox
                                                            v-model="search.search_keywords[a].not"
                                                            name="check-button"
                                                            @change="refreshData(false)"
                                                            class="shadow-none"
                                                        >
                                                            <span class="text-uppercase">{{ $t("not") }}</span>
                                                        </b-form-checkbox>
                                                    </b-input-group-text>
                                                </b-input-group-append>
                                            </b-input-group>
                                        </div>
                                    </div>

                                    <!-- foods filter -->
                                    <h6 class="mt-2 mb-0" v-if="ui.expert_mode && search.foods_fields > 1">
                                        {{ $t("Foods") }}
                                    </h6>
                                    <span
                                        class="text-sm-left text-warning"
                                        v-if="ui.expert_mode && search.foods_fields > 1 && hasDuplicateFilter(search.search_foods, search.foods_fields)"
                                        >{{ $t("warning_duplicate_filter") }}</span
                                    >
                                    <div class="row" v-if="ui.show_foods">
                                        <div class="col-12">
                                            <b-input-group class="mt-2" v-for="(f, i) in foodFields" :key="i">
                                                <template #prepend v-if="ui.expert_mode">
                                                    <b-input-group-text style="width: 3em" @click="addField('foods', f)">
                                                        <i class="fas fa-plus-circle text-primary" v-if="f == search.foods_fields && f < 4" />
                                                    </b-input-group-text>
                                                    <b-input-group-text style="width: 3em" @click="removeField('foods', f)">
                                                        <i class="fas fa-minus-circle text-primary" v-if="f == search.foods_fields && f > 1" />
                                                    </b-input-group-text>
                                                </template>
                                                <generic-multiselect
                                                    v-if="!ui.tree_select"
                                                    @change="genericSelectChanged"
                                                    :parent_variable="`search_foods::${i}`"
                                                    :initial_selection="search.search_foods[i].items"
                                                    :model="Models.FOOD"
                                                    style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
                                                    :placeholder="$t('Foods')"
                                                    :limit="50"
                                                />
                                                <b-input-group-append>
                                                    <b-input-group-text>
                                                        <b-form-checkbox
                                                            v-model="search.search_foods[i].operator"
                                                            name="check-button"
                                                            @change="refreshData(false)"
                                                            class="shadow-none"
                                                            switch
                                                            style="width: 5em"
                                                        >
                                                            <span class="text-uppercase" v-if="search.search_foods[i].operator">{{ $t("or") }}</span>
                                                            <span class="text-uppercase" v-else>{{ $t("and") }}</span>
                                                        </b-form-checkbox>
                                                    </b-input-group-text>
                                                </b-input-group-append>
                                                <b-input-group-append v-if="ui.expert_mode">
                                                    <b-input-group-text>
                                                        <b-form-checkbox v-model="search.search_foods[i].not" name="check-button" @change="refreshData(false)" class="shadow-none">
                                                            <span class="text-uppercase">{{ $t("not") }}</span>
                                                        </b-form-checkbox>
                                                    </b-input-group-text>
                                                </b-input-group-append>
                                            </b-input-group>
                                        </div>
                                    </div>

                                    <!-- books filter -->
                                    <h6 class="mt-2 mb-0" v-if="ui.expert_mode && search.books_fields > 1">
                                        {{ $t("Books") }}
                                    </h6>
                                    <span
                                        class="text-sm-left text-warning"
                                        v-if="ui.expert_mode && search.books_fields > 1 && hasDuplicateFilter(search.search_books, search.books_fields)"
                                        >{{ $t("warning_duplicate_filter") }}</span
                                    >
                                    <div class="row" v-if="ui.show_books">
                                        <div class="col-12">
                                            <b-input-group class="mt-2" v-for="(b, i) in bookFields" :key="i">
                                                <template #prepend v-if="ui.expert_mode">
                                                    <b-input-group-text style="width: 3em" @click="addField('books', b)">
                                                        <i class="fas fa-plus-circle text-primary" v-if="b == search.books_fields && b < 4" />
                                                    </b-input-group-text>
                                                    <b-input-group-text style="width: 3em" @click="removeField('books', b)">
                                                        <i class="fas fa-minus-circle text-primary" v-if="b == search.books_fields && b > 1" />
                                                    </b-input-group-text>
                                                </template>
                                                <generic-multiselect
                                                    @change="genericSelectChanged"
                                                    :parent_variable="`search_books::${i}`"
                                                    :initial_selection="search.search_books[i].items"
                                                    :model="Models.RECIPE_BOOK"
                                                    style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
                                                    v-bind:placeholder="$t('Books')"
                                                    :limit="50"
                                                ></generic-multiselect>
                                                <b-input-group-append>
                                                    <b-input-group-text>
                                                        <b-form-checkbox
                                                            v-model="search.search_books[i].operator"
                                                            name="check-button"
                                                            @change="refreshData(false)"
                                                            class="shadow-none"
                                                            style="width: 5em"
                                                            switch
                                                        >
                                                            <span class="text-uppercase" v-if="search.search_books[i].operator">{{ $t("or") }}</span>
                                                            <span class="text-uppercase" v-else>{{ $t("and") }}</span>
                                                        </b-form-checkbox>
                                                    </b-input-group-text>
                                                </b-input-group-append>
                                                <b-input-group-append v-if="ui.expert_mode">
                                                    <b-input-group-text>
                                                        <b-form-checkbox v-model="search.search_books[i].not" name="check-button" @change="refreshData(false)" class="shadow-none">
                                                            <span class="text-uppercase">{{ $t("not") }}</span>
                                                        </b-form-checkbox>
                                                    </b-input-group-text>
                                                </b-input-group-append>
                                            </b-input-group>
                                        </div>
                                    </div>

                                    <!-- ratings filter -->
                                    <div class="row g-0" v-if="ui.show_rating">
                                        <div class="col-12" v-if="ui.show_rating">
                                            <b-input-group class="mt-2">
                                                <multiselect
                                                    label="label"
                                                    track-by="id"
                                                    v-model="search.search_rating"
                                                    :options="ratingOptions"
                                                    :placeholder="$t('Ratings')"
                                                    :internal-search="false"
                                                    :multiple="false"
                                                    :taggable="false"
                                                    @input="refreshData(false)"
                                                    style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
                                                />
                                                <b-input-group-append>
                                                    <b-input-group-text>
                                                        <b-form-checkbox
                                                            v-model="search.search_rating_gte"
                                                            name="check-button"
                                                            @change="refreshData(false)"
                                                            class="shadow-none"
                                                            switch
                                                            style="width: 5em"
                                                        >
                                                            <span class="text-uppercase" v-if="search.search_rating_gte">&gt;=</span>
                                                            <span class="text-uppercase" v-else>&lt;=</span>
                                                        </b-form-checkbox>
                                                    </b-input-group-text>
                                                </b-input-group-append>
                                            </b-input-group>
                                        </div>
                                    </div>
                                    <!-- units filter -->
                                    <div class="row" v-if="ui.show_units">
                                        <div class="col-12">
                                            <b-input-group class="mt-2">
                                                <generic-multiselect
                                                    @change="genericSelectChanged"
                                                    parent_variable="search_units"
                                                    :initial_selection="search.search_units"
                                                    :model="Models.UNIT"
                                                    style="flex-grow: 1; flex-shrink: 1; flex-basis: 0"
                                                    v-bind:placeholder="$t('Units')"
                                                    :limit="50"
                                                ></generic-multiselect>
                                                <b-input-group-append>
                                                    <b-input-group-text>
                                                        <b-form-checkbox
                                                            v-model="search.search_units_or"
                                                            name="check-button"
                                                            @change="refreshData(false)"
                                                            class="shadow-none"
                                                            style="width: 4em"
                                                            switch
                                                        >
                                                            <span class="text-uppercase" v-if="search.search_units_or">{{ $t("or") }}</span>
                                                            <span class="text-uppercase" v-else>{{ $t("and") }}</span>
                                                        </b-form-checkbox>
                                                    </b-input-group-text>
                                                </b-input-group-append>
                                            </b-input-group>
                                        </div>
                                    </div>

                                    <!-- special switches -->
                                    <div class="row g-0" v-if="ui.show_timescooked || ui.show_makenow || ui.show_cookedon">
                                        <div class="col-12">
                                            <b-input-group class="mt-2">
                                                <!-- times cooked -->
                                                <b-input-group-prepend is-text v-if="ui.show_timescooked">
                                                    {{ $t("times_cooked") }}
                                                </b-input-group-prepend>
                                                <b-form-input id="timescooked" type="number" min="0" v-model="search.timescooked" v-if="ui.show_timescooked"></b-form-input>
                                                <b-input-group-append v-if="ui.show_timescooked">
                                                    <b-input-group-text>
                                                        <b-form-checkbox
                                                            v-model="search.timescooked_gte"
                                                            name="check-button"
                                                            @change="refreshData(false)"
                                                            class="shadow-none"
                                                            switch
                                                            style="width: 4em"
                                                        >
                                                            <span class="text-uppercase" v-if="search.timescooked_gte">&gt;=</span>
                                                            <span class="text-uppercase" v-else>&lt;=</span>
                                                        </b-form-checkbox>
                                                    </b-input-group-text>
                                                </b-input-group-append>
                                                <!-- date cooked -->
                                                <b-input-group-append v-if="ui.show_cookedon">
                                                    <b-form-datepicker
                                                        v-model="search.cookedon"
                                                        :max="today"
                                                        no-highlight-today
                                                        reset-button
                                                        :date-format-options="{ year: 'numeric', month: 'numeric', day: 'numeric' }"
                                                        :locale="locale"
                                                        :placeholder="$t('last_cooked')"
                                                        @input="refreshData(false)"
                                                    />
                                                    <b-input-group-text>
                                                        <b-form-checkbox
                                                            v-model="search.cookedon_gte"
                                                            name="check-button"
                                                            @change="refreshData(false)"
                                                            class="shadow-none"
                                                            switch
                                                            style="width: 4em"
                                                        >
                                                            <span class="text-uppercase" v-if="search.cookedon_gte">&gt;=</span>
                                                            <span class="text-uppercase" v-else>&lt;=</span>
                                                        </b-form-checkbox>
                                                    </b-input-group-text>
                                                </b-input-group-append>
                                                <!-- make now -->

                                                <b-input-group-append v-if="ui.show_createdon">
                                                    <b-form-datepicker
                                                        v-model="search.createdon"
                                                        :max="today"
                                                        no-highlight-today
                                                        reset-button
                                                        :date-format-options="{ year: 'numeric', month: 'numeric', day: 'numeric' }"
                                                        :locale="locale"
                                                        :placeholder="$t('date_created')"
                                                        @input="refreshData(false)"
                                                    />
                                                    <b-input-group-text>
                                                        <b-form-checkbox
                                                            v-model="search.createdon_gte"
                                                            name="check-button"
                                                            @change="refreshData(false)"
                                                            class="shadow-none"
                                                            switch
                                                            style="width: 4em"
                                                        >
                                                            <span class="text-uppercase" v-if="search.createdon_gte">&gt;=</span>
                                                            <span class="text-uppercase" v-else>&lt;=</span>
                                                        </b-form-checkbox>
                                                    </b-input-group-text>
                                                </b-input-group-append>
                                                <b-input-group-append v-if="ui.show_viewedon">
                                                    <b-form-datepicker
                                                        v-model="search.viewedon"
                                                        :max="today"
                                                        no-highlight-today
                                                        reset-button
                                                        :date-format-options="{ year: 'numeric', month: 'numeric', day: 'numeric' }"
                                                        :locale="locale"
                                                        :placeholder="$t('last_viewed')"
                                                        @input="refreshData(false)"
                                                    />
                                                    <b-input-group-text>
                                                        <b-form-checkbox
                                                            v-model="search.viewedon_gte"
                                                            name="check-button"
                                                            @change="refreshData(false)"
                                                            class="shadow-none"
                                                            switch
                                                            style="width: 4em"
                                                        >
                                                            <span class="text-uppercase" v-if="search.viewedon_gte">&gt;=</span>
                                                            <span class="text-uppercase" v-else>&lt;=</span>
                                                        </b-form-checkbox>
                                                    </b-input-group-text>
                                                </b-input-group-append>
                                                <b-input-group-append v-if="ui.show_updatedon">
                                                    <b-form-datepicker
                                                        v-model="search.updatedon"
                                                        :max="today"
                                                        no-highlight-today
                                                        reset-button
                                                        :date-format-options="{ year: 'numeric', month: 'numeric', day: 'numeric' }"
                                                        :locale="locale"
                                                        :placeholder="$t('updatedon')"
                                                        @input="refreshData(false)"
                                                    />
                                                    <b-input-group-text>
                                                        <b-form-checkbox
                                                            v-model="search.updatedon_gte"
                                                            name="check-button"
                                                            @change="refreshData(false)"
                                                            class="shadow-none"
                                                            switch
                                                            style="width: 4em"
                                                        >
                                                            <span class="text-uppercase" v-if="search.updatedon_gte">&gt;=</span>
                                                            <span class="text-uppercase" v-else>&lt;=</span>
                                                        </b-form-checkbox>
                                                    </b-input-group-text>
                                                </b-input-group-append>
                                                <b-input-group-append v-if="ui.show_makenow">
                                                    <b-input-group-text>
                                                        {{ $t("make_now") }}
                                                        <b-form-checkbox
                                                            v-model="search.makenow"
                                                            name="check-button"
                                                            @change="refreshData(false)"
                                                            class="shadow-none"
                                                            switch
                                                            style="width: 4em"
                                                        />
                                                    </b-input-group-text>
                                                    <b-input-group-text>
                                                        <span>{{ $t("make_now_count") }}</span>
                                                        <b-form-input
                                                            type="number"
                                                            min="0"
                                                            max="20"
                                                            v-model="search.makenow_count"
                                                            @change="refreshData(false)"
                                                            size="sm"
                                                            class="mt-1"
                                                        ></b-form-input>
                                                    </b-input-group-text>
                                                </b-input-group-append>
                                            </b-input-group>
                                        </div>
                                    </div>

                                    <!-- Buttons -->
                                    <div class="row justify-content-end small">
                                        <div class="col-auto">
                                            <b-button class="my-0" variant="link" size="sm" @click="search.explain_visible = !search.explain_visible">
                                                <div v-if="!search.explain_visible">
                                                    <i class="far fa-eye"></i>
                                                    {{ $t("explain") }}
                                                </div>
                                                <div v-else><i class="far fa-eye-slash"></i> {{ $t("explain") }}</div>
                                            </b-button>
                                            <b-button class="my-0" variant="link" size="sm" @click="ui.expert_mode = !ui.expert_mode">
                                                <div v-if="!ui.expert_mode">
                                                    <i class="fas fa-circle"></i>
                                                    {{ $t("expert_mode") }}
                                                </div>
                                                <div v-if="ui.expert_mode">
                                                    <i class="far fa-circle"></i>
                                                    {{ $t("simple_mode") }}
                                                </div>
                                            </b-button>
                                            <b-button class="my-0" variant="link" size="sm" @click="saveSearch">
                                                <div><i class="far fa-save"></i> {{ $t("save_filter") }}</div>
                                            </b-button>
                                        </div>
                                    </div>

                                    <div class="row" v-if="search.explain_visible">
                                        <div class="col-auto p-3">
                                            <!-- Explain Div -->
                                            <div>
                                                <!-- TODO find a way to localize this that works without explaining localization to each language translator  -->
                                                Show all recipes that are matched
                                                <span v-if="search.search_input">
                                                    by <i>{{ search.search_input }}</i> <br />
                                                </span>
                                                <span v-else> without any search term <br /> </span>

                                                <span v-if="search.search_internal"> and are <span class="text-success">internal</span> <br /></span>

                                                <span v-for="k in search.search_keywords" v-bind:key="k.id">
                                                    <template v-if="k.items.length > 0">
                                                        and
                                                        <b v-if="k.not">don't</b>
                                                        contain
                                                        <b v-if="k.operator">any</b><b v-else>all</b> of the following <span class="text-success">keywords</span>:
                                                        <i>{{ k.items.flatMap((x) => x.name).join(", ") }}</i>
                                                        <br />
                                                    </template>
                                                </span>

                                                <span v-for="k in search.search_foods" v-bind:key="k.id">
                                                    <template v-if="k.items.length > 0">
                                                        and
                                                        <b v-if="k.not">don't</b>
                                                        contain
                                                        <b v-if="k.operator">any</b><b v-else>all</b> of the following <span class="text-success">foods</span>:
                                                        <i>{{ k.items.flatMap((x) => x.name).join(", ") }}</i>
                                                        <br />
                                                    </template>
                                                </span>

                                                <span v-for="k in search.search_books" v-bind:key="k.id">
                                                    <template v-if="k.items.length > 0">
                                                        and
                                                        <b v-if="k.not">don't</b>
                                                        contain
                                                        <b v-if="k.operator">any</b><b v-else>all</b> of the following <span class="text-success">books</span>:
                                                        <i>{{ k.items.flatMap((x) => x.name).join(", ") }}</i>
                                                        <br />
                                                    </template>
                                                </span>

                                                <span v-if="search.makenow"> and you can <span class="text-success">make right now</span> (based on the on hand flag) <br /></span>

                                                <span v-if="search.search_units.length > 0">
                                                    and contain <b v-if="search.search_units_or">any</b><b v-else>all</b> of the following <span class="text-success">units</span>:
                                                    <i>{{ search.search_units.flatMap((x) => x.name).join(", ") }}</i
                                                    ><br />
                                                </span>

                                                <span v-if="search.search_rating !== undefined">
                                                    and have a <span class="text-success">rating</span> <template v-if="search.search_rating_gte">greater than</template
                                                    ><template v-else> less than</template> or equal to {{ search.search_rating }}<br />
                                                </span>

                                                <span v-if="search.lastcooked !== undefined">
                                                    and have been <span class="text-success">last cooked</span> <template v-if="search.lastcooked_gte"> after</template
                                                    ><template v-else> before</template> <i>{{ search.lastcooked }}</i
                                                    ><br />
                                                </span>

                                                <span v-if="search.timescooked !== undefined">
                                                    and have <span class="text-success">been cooked</span> <template v-if="search.timescooked_gte"> at least</template
                                                    ><template v-else> less than</template> or equal to<i>{{ search.timescooked }}</i> times <br />
                                                </span>

                                                <span v-if="search.sort_order.length > 0">
                                                    <span class="text-success">order</span> by
                                                    <i>{{ search.sort_order.flatMap((x) => x.text).join(", ") }}</i>
                                                    <br />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </b-collapse>
                    </div>
                </div>

                <div class="row mt-2">
                    <div class="col-12 col-xl-10 col-lg-10 offset-xl-1 offset-lg-1">
                        <div style="overflow-x: visible; overflow-y: hidden; white-space: nowrap">
                            <b-dropdown
                                id="sortby"
                                :text="sortByLabel"
                                variant="outline-primary"
                                size="sm"
                                style="overflow-y: visible; overflow-x: visible; position: static"
                                class="shadow-none"
                                toggle-class="text-decoration-none"
                            >
                                <div v-for="o in sortOptions" :key="o.id">
                                    <b-dropdown-item
                                        v-on:click="
                                            search.sort_order = [o]
                                            refreshData(false)
                                        "
                                    >
                                        <span>{{ o.text }}</span>
                                    </b-dropdown-item>
                                </div>
                            </b-dropdown>

                            <b-button variant="outline-primary" size="sm" class="shadow-none ml-1" @click="resetSearch()" v-if="searchFiltered()"
                                ><i class="fas fa-file-alt"></i> {{ search.pagination_page }}/{{ Math.ceil(pagination_count / ui.page_size) }} {{ $t("Reset") }}
                                <i class="fas fa-times-circle"></i>
                            </b-button>

                            <b-button variant="outline-primary" size="sm" class="shadow-none ml-1" @click="openRandom()"
                                ><i class="fas fa-dice-five"></i> {{ $t("Random") }}
                            </b-button>
                        </div>
                    </div>
                </div>

                <template v-if="!searchFiltered() && ui.show_meal_plan && meal_plan_grid.length > 0">
                    <hr />
                    <div class="row">
                        <div class="col col-md-12">
                            <div
                                style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); column-gap: 0.5rem; row-gap: 0.5rem; grid-auto-rows: max-content"
                            >
                                <div v-for="day in meal_plan_grid" v-bind:key="day.day" :class="{ 'd-none d-sm-block': day.plan_entries.length === 0 }">
                                    <b-list-group>
                                        <b-list-group-item class="hover-div pb-0">
                                            <div class="d-flex flex-row align-items-center">
                                                <div>
                                                    <h6>{{ day.date_label }}</h6>
                                                </div>
                                                <div class="flex-grow-1 text-right">
                                                    <b-button class="hover-button btn-outline-primary btn-sm" @click="showMealPlanEditModal(null, day.create_default_date)"
                                                        ><i class="fa fa-plus"></i
                                                    ></b-button>
                                                </div>
                                            </div>
                                        </b-list-group-item>
                                        <b-list-group-item v-for="plan in day.plan_entries" v-bind:key="plan.id" class="hover-div p-0 pr-2">
                                            <div class="d-flex flex-row align-items-center">
                                                <div>
                                                    <img style="height: 50px; width: 50px; object-fit: cover" :src="plan.recipe.image" v-if="plan.recipe?.image" />
                                                    <img style="height: 50px; width: 50px; object-fit: cover" :src="image_placeholder" v-else />
                                                </div>
                                                <div class="flex-grow-1 ml-2" style="text-overflow: ellipsis; overflow-wrap: anywhere">
                                                    <span class="two-row-text">
                                                        <a :href="resolveDjangoUrl('view_recipe', plan.recipe.id)" v-if="plan.recipe">{{ plan.recipe.name }}</a>
                                                        <span v-else>{{ plan.title }}</span>
                                                    </span>
                                                </div>
                                                <div class="hover-button">
                                                    <b-button @click="showMealPlanEditModal(plan, null)" class="btn-outline-primary btn-sm"
                                                        ><i class="fas fa-pencil-alt"></i
                                                    ></b-button>
                                                </div>
                                            </div>
                                        </b-list-group-item>
                                    </b-list-group>
                                </div>
                            </div>
                        </div>
                    </div>
                    <hr />
                </template>

                <div v-if="recipes.length > 0" class="mt-4">
                    <div class="row">
                        <div class="col col-md-12">
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); column-gap: 0.5rem; row-gap: 1rem; grid-auto-rows: max-content">
                                <!-- TODO remove once new meal plan view has proven to be good -->
                                <!--                                <template v-if="!searchFiltered()">-->
                                <!--                                    <recipe-card-->
                                <!--                                        v-bind:key="`mp_${m.id}`"-->
                                <!--                                        v-for="m in meal_plans"-->
                                <!--                                        :recipe="m.recipe"-->
                                <!--                                        :meal_plan="m"-->
                                <!--                                        :use_plural="use_plural"-->
                                <!--                                        :footer_text="m.meal_type_name"-->
                                <!--                                        footer_icon="far fa-calendar-alt"-->
                                <!--                                    ></recipe-card>-->
                                <!--                                </template>-->

                                <recipe-card
                                    v-for="r in recipes"
                                    v-bind:key="r.id"
                                    :recipe="r"
                                    :footer_text="isRecentOrNew(r)[0]"
                                    :footer_icon="isRecentOrNew(r)[1]"
                                    :use_plural="use_plural"
                                >
                                </recipe-card>
                            </div>
                        </div>
                    </div>

                    <div class="row" style="margin-top: 2vh" v-if="!random_search">
                        <div class="col col-md-12">
                            <b-pagination
                                v-model="search.pagination_page"
                                :total-rows="pagination_count"
                                first-number
                                last-number
                                size="lg"
                                :per-page="ui.page_size"
                                @change="pageChange"
                                align="center"
                            ></b-pagination>
                        </div>
                    </div>
                    <div class="col-md-2 d-none d-md-block"></div>
                </div>
                <div v-if="recipes.length < 1 && !recipes_loading">
                    <div class="row mt-5">
                        <div class="col col-md-12 text-center">
                            <h4 class="text-muted"><i class="far fa-eye"></i> {{ $t("search_no_recipes") }}</h4>
                        </div>
                    </div>

                    <div class="row mt-2">
                        <div class="col col-md-12 text-center">
                            <b-card-group deck>
                                <b-card v-bind:title="$t('Import')" class="text-center">
                                    <b-card-text>
                                        {{ $t("search_import_help_text") }}
                                    </b-card-text>

                                    <b-button variant="primary" :href="resolveDjangoUrl('data_import_url')"><i class="fas fa-file-import"></i> {{ $t("Import") }}</b-button>
                                </b-card>

                                <b-card v-bind:title="$t('Create')" class="text-center">
                                    <b-card-text>
                                        {{ $t("search_create_help_text") }}
                                    </b-card-text>

                                    <b-button variant="primary" :href="resolveDjangoUrl('new_recipe')"><i class="fas fa-plus"></i> {{ $t("Create") }}</b-button>
                                </b-card>
                            </b-card-group>
                        </div>
                    </div>
                </div>

                <meal-plan-edit-modal :entry="mealplan_entry_edit" :create_date="mealplan_default_date"></meal-plan-edit-modal>

                <bottom-navigation-bar active-view="view_search"></bottom-navigation-bar>
            </div>
        </div>
    </div>
</template>

<script>
import { BootstrapVue } from "bootstrap-vue"
import "bootstrap-vue/dist/bootstrap-vue.css"
import Vue from "vue"
import VueCookies from "vue-cookies"

import _debounce from "lodash/debounce"
import moment from "moment"
import Multiselect from "vue-multiselect"

import BottomNavigationBar from "@/components/BottomNavigationBar.vue"
import RecipeSwitcher from "@/components/Buttons/RecipeSwitcher"
import GenericMultiselect from "@/components/GenericMultiselect"
import MealPlanEditModal from "@/components/MealPlanEditModal.vue"
import RecipeCard from "@/components/RecipeCard"
import { useMealPlanStore } from "@/stores/MealPlanStore"
import { ApiApiFactory } from "@/utils/openapi/api"
import { ApiMixin, ResolveUrlMixin, StandardToasts, ToastMixin } from "@/utils/utils"

Vue.use(VueCookies)
Vue.use(BootstrapVue)

let SEARCH_COOKIE_NAME = "search_settings3"
let UI_COOKIE_NAME = "ui_search_settings"

export default {
    name: "RecipeSearchView",
    mixins: [ResolveUrlMixin, ApiMixin, ToastMixin],
    components: { GenericMultiselect, RecipeCard, RecipeSwitcher, Multiselect, BottomNavigationBar, MealPlanEditModal },
    data() {
        return {
            // this.Models and this.Actions inherited from ApiMixin
            recipes: [],
            recipes_loading: true,
            meal_plans: [],
            meal_plan_store: null,
            last_viewed_recipes: [],
            sortMenu: false,
            use_plural: false,
            search: {
                advanced_search_visible: false,
                explain_visible: false,
                search_input: "",
                search_internal: false,
                search_keywords: [
                    { items: [], operator: true, not: false },
                    { items: [], operator: false, not: false },
                    { items: [], operator: true, not: true },
                    { items: [], operator: false, not: true },
                ],
                search_foods: [
                    { items: [], operator: true, not: false },
                    { items: [], operator: false, not: false },
                    { items: [], operator: true, not: true },
                    { items: [], operator: false, not: true },
                ],
                search_books: [
                    { items: [], operator: true, not: false },
                    { items: [], operator: false, not: false },
                    { items: [], operator: true, not: true },
                    { items: [], operator: false, not: true },
                ],
                search_units: [],
                search_units_or: true,
                search_rating: undefined,
                search_rating_gte: true,
                search_filter: undefined,
                timescooked: undefined,
                timescooked_gte: true,
                makenow: false,
                makenow_count: 0,
                cookedon: undefined,
                cookedon_gte: true,
                createdon: undefined,
                createdon_gte: true,
                updatedon: undefined,
                updatedon_gte: true,
                viewedon: undefined,
                viewedon_gte: true,
                sort_order: [],
                pagination_page: 1,

                keywords_fields: 1,
                foods_fields: 1,
                books_fields: 1,
                rating_fields: 1,
                units_fields: 1,
            },
            ui: {
                show_meal_plan: true,
                meal_plan_days: 0,
                recently_viewed: 5,
                sort_by_new: true,
                page_size: 25,
                expert_mode: false,
                remember_search: true,
                remember_hours: 4,
                sql_debug: false,
                tree_select: false,
                show_keywords: true,
                show_foods: true,
                show_books: true,
                show_rating: true,
                show_units: false,
                show_filters: true,
                show_sortby: false,
                show_timescooked: false,
                show_makenow: false,
                show_cookedon: false,
                show_viewedon: false,
                show_createdon: false,
                show_updatedon: false,
                include_children: true,
            },
            pagination_count: 0,
            random_search: false,
            debug: false,
            mealplan_default_date: null,
            mealplan_entry_edit: null,
            image_placeholder: window.IMAGE_PLACEHOLDER,
        }
    },
    computed: {
        meal_plan_grid: function () {
            let grid = []

            if (this.meal_plan_store !== null && this.meal_plan_store.plan_list.length > 0) {
                for (const x of Array(this.ui.meal_plan_days).keys()) {
                    let moment_date = moment().add(x, "d")
                    grid.push({
                        date: moment_date,
                        create_default_date: moment_date.format("YYYY-MM-DD"), // improve meal plan edit modal to do formatting itself and accept dates
                        date_label: moment_date.format("dd") + " " + moment_date.format("ll"),
                        plan_entries: this.meal_plan_store.plan_list.filter((m) => moment_date.isBetween(moment(m.from_date), moment(m.to_date), "day", "[]")),
                    })
                }
            }
            return grid
        },
        locale: function () {
            return window.CUSTOM_LOCALE
        },
        sortByLabel: function () {
            if (this.search.sort_order.length == 1) {
                return this.search.sort_order[0].text
            } else {
                return this.$t("sort_by")
            }
        },
        yesterday: function () {
            const now = new Date()
            return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
        },
        today: function () {
            const now = new Date()
            return new Date(now.getFullYear(), now.getMonth(), now.getDate())
        },
        ratingOptions: function () {
            let label = undefined

            if (this.search.search_rating_gte) {
                label = (x) => {
                    if (x == 5) {
                        return ""
                    } else {
                        return this.$t("and_up")
                    }
                }
            } else {
                label = (x) => {
                    if (x == 1) {
                        return ""
                    } else {
                        return this.$t("and_down")
                    }
                }
            }

            return [
                { id: 5, label: "⭐⭐⭐⭐⭐ " + label(5) },
                { id: 4, label: "⭐⭐⭐⭐ " + label() },
                { id: 3, label: "⭐⭐⭐ " + label() },
                { id: 2, label: "⭐⭐ " + label() },
                { id: 1, label: "⭐ " + label(1) },
                { id: 0, label: this.$t("Unrated") },
            ]
        },
        keywordFields: function () {
            return !this.ui.expert_mode ? 1 : this.search.keywords_fields
        },
        foodFields: function () {
            return !this.ui.expert_mode ? 1 : this.search.foods_fields
        },
        bookFields: function () {
            return !this.ui.expert_mode ? 1 : this.search.books_fields
        },
        ratingFields: function () {
            return !this.ui.expert_mode ? 1 : this.search.rating_fields
        },
        unitFields: function () {
            return !this.ui.expert_mode ? 1 : this.search.units_fields
        },
        sortOptions: function () {
            let sort_order = []
            let x = 1
            const field = [
                [this.$t("search_rank"), "score", "1-9", "9-1"],
                [this.$t("Name"), "name", "A-z", "Z-a"],
                [this.$t("last_cooked"), "lastcooked", "↑", "↓"],
                [this.$t("Rating"), "rating", "1-5", "5-1"],
                [this.$t("times_cooked"), "favorite", "x-X", "X-x"],
                [this.$t("date_created"), "created_at", "↑", "↓"],
                [this.$t("date_viewed"), "lastviewed", "↑", "↓"],
            ]
            field.forEach((f) => {
                sort_order.push(
                    {
                        id: x,
                        text: `${f[0]} (${f[2]})`,
                        value: f[1],
                    },
                    {
                        id: x + 1,
                        text: `${f[0]} (${f[3]})`,
                        value: `-${f[1]}`,
                    }
                )
                x = x + 2
            })
            return sort_order
        },
        isMobile: function () {
            //TODO move to central helper
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        },
        isTouch: function () {
            return window.matchMedia("(pointer: coarse)").matches
        },
    },
    mounted() {
        this.recipes = Array(this.ui.page_size).fill({ loading: true })

        this.$nextTick(function () {
            if (this.$cookies.isKey(UI_COOKIE_NAME)) {
                this.ui = Object.assign({}, this.ui, this.$cookies.get(UI_COOKIE_NAME))
            }
            if (this.ui.remember_search && this.$cookies.isKey(SEARCH_COOKIE_NAME)) {
                this.search = Object.assign({}, this.search, this.$cookies.get(SEARCH_COOKIE_NAME))
            }
            let urlParams = new URLSearchParams(window.location.search)

            if (urlParams.has("keyword")) {
                this.search.search_keywords[0].items = []
                for (let x of urlParams.getAll("keyword")) {
                    this.search.search_keywords[0].items.push(Number.parseInt(x))
                }
            }

            if (urlParams.has("query")) {
                this.search.search_input = urlParams.get("query")
            }

            this.loadMealPlan()
            this.refreshData(false)
        })
        let apiClient = new ApiApiFactory()
        apiClient.retrieveSpace(window.ACTIVE_SPACE_ID).then((r) => {
            this.use_plural = r.data.use_plural
        })
        this.$i18n.locale = window.CUSTOM_LOCALE
        moment.locale(window.CUSTOM_LOCALE)
        this.debug = localStorage.getItem("DEBUG") == "True" || false
    },
    watch: {
        search: {
            handler() {
                this.$cookies.set(SEARCH_COOKIE_NAME, this.search, `${this.ui.remember_hours}h`)
            },
            deep: true,
        },
        ui: {
            handler() {
                this.$cookies.set(UI_COOKIE_NAME, this.ui, "100y")
            },
            deep: true,
        },
        "search.search_input": _debounce(function () {
            this.search.pagination_page = 1
            this.pagination_count = 0
            this.refreshData(false)
        }, 300),
        "search.timescooked": function () {
            this.refreshData(false)
        },
        "ui.show_meal_plan": function () {
            this.loadMealPlan()
        },
        "ui.meal_plan_days": function () {
            this.loadMealPlan()
        },
        "ui.recently_viewed": function () {
            this.refreshData(false)
        },
        "ui.page_size": _debounce(function () {
            this.refreshData(false)
        }, 300),
        "ui.expert_mode": function (newVal, oldVal) {
            if (!newVal) {
                this.search.search_keywords = this.search.search_keywords.map((x) => {
                    return { ...x, not: false }
                })
                this.search.search_foods = this.search.search_foods.map((x) => {
                    return { ...x, not: false }
                })
                this.search.search_books = this.search.search_books.map((x) => {
                    return { ...x, not: false }
                })
            }
        },
    },
    methods: {
        // this.genericAPI inherited from ApiMixin
        refreshData: _debounce(function (random) {
            this.recipes_loading = true
            this.recipes = Array(this.ui.page_size).fill({ loading: true })
            let params = this.buildParams(random)
            this.genericAPI(this.Models.RECIPE, this.Actions.LIST, params).then((result) => {
                window.scrollTo(0, 0)
                this.pagination_count = result.data.count

                this.recipes = [...this.removeDuplicates(result.data.results, (recipe) => recipe.id)]
                if (!this.searchFiltered()) {
                    // if meal plans are being shown (and only when search is unfiltered) - filter out any meal plan recipes from the recipe list
                    let mealPlans = []
                    this.meal_plans.forEach((x) => mealPlans.push(x.recipe.id))
                    this.recipes = this.recipes.filter((recipe) => !mealPlans.includes(recipe.id))
                }
                this.recipes_loading = false
            })
        }, 300),
        openRandom: function () {
            this.refreshData(true)
        },
        removeDuplicates: function (data, key) {
            return [...new Map(data.map((item) => [key(item), item])).values()]
        },
        loadMealPlan: function () {
            console.log("loadMealpLan")
            this.meal_plan_store = useMealPlanStore()
            this.meal_plan_store.refreshFromAPI(moment().format("YYYY-MM-DD"), moment().add(this.ui.meal_plan_days, "days").format("YYYY-MM-DD"))
        },
        genericSelectChanged: function (obj) {
            if (obj.var.includes("::")) {
                let x = obj.var.split("::")
                this.search[x[0]][x[1]].items = obj.val
            } else {
                this.search[obj.var] = obj.val
            }
            // if selecting a filter, reset all current selections
            if (obj.var === "search_filter") {
                this.resetSearch(true)
            } else {
                this.refreshData(false)
            }
        },
        resetSearch: function (filter = undefined) {
            this.search.search_keywords = this.search.search_keywords.map((x) => {
                return { ...x, items: [] }
            })
            this.search.search_foods = this.search.search_foods.map((x) => {
                return { ...x, items: [] }
            })
            this.search.search_books = this.search.search_books.map((x) => {
                return { ...x, items: [] }
            })
            this.search.search_input = filter?.query ?? ""
            this.search.search_internal = filter?.internal ?? false
            this.search.search_units = filter?.units ?? []
            this.search.search_rating = filter?.rating ?? undefined
            this.search.sort_order = filter?.options?.query?.sort_order ?? []
            this.search.pagination_page = 1
            this.search.timescooked = undefined
            this.search.makenow = false
            this.search.make_now_count = 0
            this.search.cookedon = undefined
            this.search.viewedon = undefined
            this.search.createdon = undefined
            this.search.updatedon = undefined

            this.search.keywords_fields = 1
            this.search.foods_fields = 1
            this.search.books_fields = 1

            if (!filter) {
                this.search.search_filter = undefined
            }

            // this.search.rating_fields = 1
            // this.search.units_fields = 1
            this.refreshData(false)
        },
        pageChange: function (page) {
            this.search.pagination_page = page
            this.refreshData(false)
        },
        normalizer(node) {
            let count = node?.count ? " (" + node.count + ")" : ""
            return {
                id: node.id,
                label: node.name + count,
                children: node.children,
                isDefaultExpanded: node.isDefaultExpanded,
            }
        },
        isRecentOrNew: function (x) {
            let recent_recipe = [this.$t("Recently_Viewed"), "fas fa-eye"]
            let new_recipe = [this.$t("New_Recipe"), "fas fa-splotch"]
            if (x.new) {
                return new_recipe
            } else if (x.recent) {
                return recent_recipe
            } else {
                return [undefined, undefined]
            }
        },
        showSQL: function () {
            let params = this.buildParams()
            params.options.query.debug = true
            this.genericAPI(this.Models.RECIPE, this.Actions.LIST, params).then((result) => {
                console.log(result.data)
            })
        },
        applyFilter() {
            return
        },
        buildParams: function (random) {
            let params = { options: { query: {} }, page: this.search.pagination_page, pageSize: this.ui.page_size }
            if (this.search.search_filter) {
                params.options.query.filter = this.search.search_filter.id
                return params
            }
            this.random_search = random
            let rating = this.search.search_rating
            if (rating !== undefined && !this.search.search_rating_gte) {
                rating = rating * -1
            }
            let cookedon = this.search.cookedon || undefined
            if (cookedon !== undefined && !this.search.cookedon_gte) {
                cookedon = "-" + cookedon
            }
            let createdon = this.search.createdon || undefined
            if (createdon !== undefined && !this.search.createdon_gte) {
                createdon = "-" + createdon
            }
            let viewedon = this.search.viewedon || undefined
            if (viewedon !== undefined && !this.search.viewedon_gte) {
                viewedon = "-" + viewedon
            }
            let updatedon = this.search.updatedon || undefined
            if (updatedon !== undefined && !this.search.updatedon_gte) {
                updatedon = "-" + updatedon
            }
            let timescooked = parseInt(this.search.timescooked)
            if (isNaN(timescooked)) {
                timescooked = undefined
            } else if (!this.search.timescooked_gte) {
                timescooked = timescooked * -1
            }
            let makenow = this.search.makenow || undefined
            if (makenow !== undefined) {
                makenow = parseInt(this.search.makenow_count)
            }
            // when a filter is selected - added search params will be added to the filter
            params = {
                ...params,
                ...this.addFields("keywords"),
                ...this.addFields("foods"),
                ...this.addFields("books"),
                units: this.search.search_units.flatMap((x) => x.id),
                query: this.search.search_input,
                rating: rating?.["id"] ?? undefined,
                internal: this.search.search_internal,
                random: this.random_search,
                timescooked: timescooked,
                makenow: makenow,
                cookedon: cookedon,
                createdon: createdon,
                updatedon: updatedon,
                viewedon: viewedon,
            }

            params.options.query = {
                sort_order: this.search.sort_order.map((x) => x.value),
                include_children: this.ui.include_children,
            }
            if (!this.searchFiltered()) {
                params.options.query.num_recent = this.ui.recently_viewed //TODO refactor as num_recent
                params._new = this.ui.sort_by_new
            }
            return params
        },
        searchFiltered: function (ignore_string = false) {
            let filtered =
                this.search?.search_keywords?.[0]?.items?.length !== 0 ||
                this.search?.search_foods?.[0]?.items?.length !== 0 ||
                this.search?.search_books?.[0]?.items?.length !== 0 ||
                this.search?.search_units?.length !== 0 ||
                this.random_search ||
                this.search?.search_filter ||
                this.search.sort_order.length > 1 ||
                this.search?.search_rating !== undefined ||
                (this.search.timescooked !== undefined && this.search.timescooked !== "") ||
                this.search.makenow !== false ||
                (this.search.cookedon !== undefined && this.search.cookedon !== "") ||
                (this.search.viewedon !== undefined && this.search.viewedon !== "") ||
                (this.search.createdon !== undefined && this.search.createdon !== "") ||
                (this.search.updatedon !== undefined && this.search.updatedon !== "")

            if (ignore_string) {
                return filtered
            } else {
                return filtered || this.search?.search_input != "" || this.search.sort_order.length >= 1
            }
        },
        addFields(field) {
            let fieldlist = this.search[`search_${field}`].slice(0, this.search[`${field}_fields`])
            return {
                [`${field}_or`]: fieldlist
                    .filter((x) => x.operator == true && x.not == false)
                    .map((x) => x.items)
                    .flat()
                    .map((x) => x?.id ?? x),
                [`${field}_and`]: fieldlist
                    .filter((x) => x.operator == false && x.not == false)
                    .map((x) => x.items)
                    .flat()
                    .map((x) => x?.id ?? x),
                [`${field}_or_not`]: fieldlist
                    .filter((x) => x.operator == true && x.not == true)
                    .map((x) => x.items)
                    .flat()
                    .map((x) => x?.id ?? x),
                [`${field}_and_not`]: fieldlist
                    .filter((x) => x.operator == false && x.not == true)
                    .map((x) => x.items)
                    .flat()
                    .map((x) => x?.id ?? x),
            }
        },
        saveSearch: function () {
            let filtername = window.prompt(this.$t("save_filter"), this.$t("filter_name"))

            if (filtername === null || filtername.trim() === "") {
                return
            }

            let search = this.buildParams(false)
            console.log("after build", search)
            ;["page", "pageSize"].forEach((key) => {
                delete search[key]
            })
            search = { ...search, ...search.options.query }
            console.log("after concat", search)
            let params = {
                name: filtername,
                search: JSON.stringify(search),
            }

            this.genericAPI(this.Models.CUSTOM_FILTER, this.Actions.CREATE, params)
                .then((result) => {
                    this.search.search_filter = result.data
                    StandardToasts.makeStandardToast(this, StandardToasts.SUCCESS_CREATE)
                })
                .catch((err) => {
                    StandardToasts.makeStandardToast(this, StandardToasts.FAIL_CREATE, err)
                })
        },
        addField: function (field, count) {
            if (count == this.search[`${field}_fields`] && count < 4) {
                this.search[`${field}_fields`] = this.search[`${field}_fields`] + 1
                this.refreshData(false)
            }
        },
        removeField: function (field, count) {
            if (count == this.search[`${field}_fields`] && count > 1) {
                this.search[`${field}_fields`] = this.search[`${field}_fields`] - 1
                this.search[`search_${field}`][count - 1].items = []
                this.refreshData(false)
            }
        },
        hasDuplicateFilter(type, count) {
            type = JSON.parse(JSON.stringify(type))
            type.splice(count, type.length)
            return (
                type.filter((x) => x.operator === true && x.not === true).length > 1 ||
                type.filter((x) => x.operator === true && x.not === false).length > 1 ||
                type.filter((x) => x.operator === false && x.not === true).length > 1 ||
                type.filter((x) => x.operator === false && x.not === false).length > 1
            )
        },
        showMealPlanEditModal: function (entry, date) {
            this.mealplan_default_date = date
            this.mealplan_entry_edit = entry

            this.$nextTick(function () {
                this.$bvModal.show(`id_meal_plan_edit_modal`)
            })
        },
    },
}
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

<style>
#timescooked,
#makenow {
    border-radius: 0px !important;
    height: 44px;
    line-height: 22px;
}

.multiselect__tags {
    border-radius: 0px !important;
    line-height: 22px;
}

.hover-button {
    display: none;
}

.hover-div:hover .hover-button {
    display: inline-block;
}
</style>
