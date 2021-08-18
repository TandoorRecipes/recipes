/******/ (function(modules) { // webpackBootstrap
/******/ 	// install a JSONP callback for chunk loading
/******/ 	function webpackJsonpCallback(data) {
/******/ 		var chunkIds = data[0];
/******/ 		var moreModules = data[1];
/******/ 		var executeModules = data[2];
/******/
/******/ 		// add "moreModules" to the modules object,
/******/ 		// then flag all "chunkIds" as loaded and fire callback
/******/ 		var moduleId, chunkId, i = 0, resolves = [];
/******/ 		for(;i < chunkIds.length; i++) {
/******/ 			chunkId = chunkIds[i];
/******/ 			if(Object.prototype.hasOwnProperty.call(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 				resolves.push(installedChunks[chunkId][0]);
/******/ 			}
/******/ 			installedChunks[chunkId] = 0;
/******/ 		}
/******/ 		for(moduleId in moreModules) {
/******/ 			if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
/******/ 				modules[moduleId] = moreModules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if(parentJsonpFunction) parentJsonpFunction(data);
/******/
/******/ 		while(resolves.length) {
/******/ 			resolves.shift()();
/******/ 		}
/******/
/******/ 		// add entry modules from loaded chunk to deferred list
/******/ 		deferredModules.push.apply(deferredModules, executeModules || []);
/******/
/******/ 		// run deferred modules when all chunks ready
/******/ 		return checkDeferredModules();
/******/ 	};
/******/ 	function checkDeferredModules() {
/******/ 		var result;
/******/ 		for(var i = 0; i < deferredModules.length; i++) {
/******/ 			var deferredModule = deferredModules[i];
/******/ 			var fulfilled = true;
/******/ 			for(var j = 1; j < deferredModule.length; j++) {
/******/ 				var depId = deferredModule[j];
/******/ 				if(installedChunks[depId] !== 0) fulfilled = false;
/******/ 			}
/******/ 			if(fulfilled) {
/******/ 				deferredModules.splice(i--, 1);
/******/ 				result = __webpack_require__(__webpack_require__.s = deferredModule[0]);
/******/ 			}
/******/ 		}
/******/
/******/ 		return result;
/******/ 	}
/******/
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// object to store loaded and loading chunks
/******/ 	// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 	// Promise = chunk loading, 0 = chunk loaded
/******/ 	var installedChunks = {
/******/ 		"recipe_view": 0
/******/ 	};
/******/
/******/ 	var deferredModules = [];
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	var jsonpArray = window["webpackJsonp"] = window["webpackJsonp"] || [];
/******/ 	var oldJsonpFunction = jsonpArray.push.bind(jsonpArray);
/******/ 	jsonpArray.push = webpackJsonpCallback;
/******/ 	jsonpArray = jsonpArray.slice();
/******/ 	for(var i = 0; i < jsonpArray.length; i++) webpackJsonpCallback(jsonpArray[i]);
/******/ 	var parentJsonpFunction = oldJsonpFunction;
/******/
/******/
/******/ 	// add entry module to deferred list
/******/ 	deferredModules.push([1,"chunk-vendors"]);
/******/ 	// run deferred modules when ready
/******/ 	return checkDeferredModules();
/******/ })
/************************************************************************/
/******/ ({

/***/ "0671":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.array.iterator.js
var es_array_iterator = __webpack_require__("e260");

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.promise.js
var es_promise = __webpack_require__("e6cf");

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.object.assign.js
var es_object_assign = __webpack_require__("cca6");

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.promise.finally.js
var es_promise_finally = __webpack_require__("a79d");

// EXTERNAL MODULE: ./node_modules/vue/dist/vue.esm.js
var vue_esm = __webpack_require__("a026");

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"3096e903-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/apps/RecipeView/RecipeView.vue?vue&type=template&id=f457ce80&
var RecipeViewvue_type_template_id_f457ce80_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{attrs:{"id":"app"}},[(_vm.loading)?[_c('loading-spinner')]:_vm._e(),(!_vm.loading)?_c('div',[_c('div',{staticClass:"row"},[_c('div',{staticClass:"col-12",staticStyle:{"text-align":"center"}},[_c('h3',[_vm._v(_vm._s(_vm.recipe.name))])])]),_c('div',{staticClass:"row text-center"},[_c('div',{staticClass:"col col-md-12"},[_c('recipe-rating',{attrs:{"recipe":_vm.recipe}}),_vm._v(" "),_c('br'),_c('last-cooked',{attrs:{"recipe":_vm.recipe}})],1)]),_c('div',{staticClass:"my-auto"},[_c('div',{staticClass:"col-12",staticStyle:{"text-align":"center"}},[_c('i',[_vm._v(_vm._s(_vm.recipe.description))])])]),_c('div',{staticStyle:{"text-align":"center"}},[_c('keywords',{attrs:{"recipe":_vm.recipe}})],1),_c('hr'),_c('div',{staticClass:"row"},[_c('div',{staticClass:"col col-md-3"},[_c('div',{staticClass:"row d-flex",staticStyle:{"padding-left":"16px"}},[_vm._m(0),_c('div',{staticClass:"my-auto",staticStyle:{"padding-right":"4px"}},[_c('span',{staticClass:"text-primary"},[_c('b',[_vm._v(_vm._s(_vm.$t('Preparation')))])]),_c('br'),_vm._v(" "+_vm._s(_vm.recipe.working_time)+" "+_vm._s(_vm.$t('min'))+" ")])])]),_c('div',{staticClass:"col col-md-3"},[_c('div',{staticClass:"row d-flex"},[_vm._m(1),_c('div',{staticClass:"my-auto",staticStyle:{"padding-right":"4px"}},[_c('span',{staticClass:"text-primary"},[_c('b',[_vm._v(_vm._s(_vm.$t('Waiting')))])]),_c('br'),_vm._v(" "+_vm._s(_vm.recipe.waiting_time)+" "+_vm._s(_vm.$t('min'))+" ")])])]),_c('div',{staticClass:"col col-md-4 col-10 mt-2 mt-md-0 mt-lg-0 mt-xl-0"},[_c('div',{staticClass:"row d-flex",staticStyle:{"padding-left":"16px"}},[_vm._m(2),_c('div',{staticClass:"my-auto",staticStyle:{"padding-right":"4px"}},[_c('input',{directives:[{name:"model",rawName:"v-model.number",value:(_vm.servings),expression:"servings",modifiers:{"number":true}}],staticClass:"form-control form-control-lg",staticStyle:{"text-align":"right","border-width":"0px","border":"none","padding":"0px","padding-left":"0.5vw","padding-right":"8px","max-width":"80px"},attrs:{"value":"1","maxlength":"3","min":"0","type":"number"},domProps:{"value":(_vm.servings)},on:{"input":function($event){if($event.target.composing){ return; }_vm.servings=_vm._n($event.target.value)},"blur":function($event){return _vm.$forceUpdate()}}})]),_c('div',{staticClass:"my-auto "},[_c('span',{staticClass:"text-primary"},[_c('b',[(_vm.recipe.servings_text === '')?[_vm._v(_vm._s(_vm.$t('Servings')))]:[_vm._v(_vm._s(_vm.recipe.servings_text))]],2)])])])]),_c('div',{staticClass:"col col-md-2 col-2 my-auto",staticStyle:{"text-align":"right","padding-right":"1vw"}},[_c('recipe-context-menu',{attrs:{"recipe":_vm.recipe,"servings":_vm.servings}})],1)]),_c('hr'),_c('div',{staticClass:"row"},[(_vm.recipe && _vm.ingredient_count > 0)?_c('div',{staticClass:"col-md-6 order-md-1 col-sm-12 order-sm-2 col-12 order-2"},[_c('div',{staticClass:"card border-primary"},[_c('div',{staticClass:"card-body"},[_c('div',{staticClass:"row"},[_c('div',{staticClass:"col col-md-8"},[_c('h4',{staticClass:"card-title"},[_c('i',{staticClass:"fas fa-pepper-hot"}),_vm._v(" "+_vm._s(_vm.$t('Ingredients')))])])]),_c('br'),_c('div',{staticClass:"row"},[_c('div',{staticClass:"col-md-12"},[_c('table',{staticClass:"table table-sm"},[_vm._l((_vm.recipe.steps),function(s){return [_vm._l((s.ingredients),function(i){return [_c('Ingredient',{key:i.id,attrs:{"ingredient":i,"ingredient_factor":_vm.ingredient_factor},on:{"checked-state-changed":_vm.updateIngredientCheckedState}})]})]})],2)])])])])]):_vm._e(),_c('div',{staticClass:"col-12 order-1 col-sm-12 order-sm-1 col-md-6 order-md-2"},[_c('div',{staticClass:"row"},[_c('div',{staticClass:"col-12"},[(_vm.recipe.image !== null)?_c('img',{staticClass:"img img-fluid rounded",staticStyle:{"max-height":"30vh"},attrs:{"src":_vm.recipe.image,"alt":_vm.$t( 'Recipe_Image')}}):_vm._e()])]),_c('div',{staticClass:"row",staticStyle:{"margin-top":"2vh","margin-bottom":"2vh"}},[_c('div',{staticClass:"col-12"},[_c('Nutrition',{attrs:{"recipe":_vm.recipe,"ingredient_factor":_vm.ingredient_factor}})],1)])])]),(!_vm.recipe.internal)?[(_vm.recipe.file_path.includes('.pdf'))?_c('div',[_c('PdfViewer',{attrs:{"recipe":_vm.recipe}})],1):_vm._e(),(_vm.recipe.file_path.includes('.png') || _vm.recipe.file_path.includes('.jpg') || _vm.recipe.file_path.includes('.jpeg') || _vm.recipe.file_path.includes('.gif'))?_c('div',[_c('ImageViewer',{attrs:{"recipe":_vm.recipe}})],1):_vm._e()]:_vm._e(),_vm._l((_vm.recipe.steps),function(s,index){return _c('div',{key:s.id,staticStyle:{"margin-top":"1vh"}},[_c('Step',{attrs:{"recipe":_vm.recipe,"step":s,"ingredient_factor":_vm.ingredient_factor,"index":index,"start_time":_vm.start_time},on:{"update-start-time":_vm.updateStartTime,"checked-state-changed":_vm.updateIngredientCheckedState}})],1)})],2):_vm._e(),_c('add-recipe-to-book',{attrs:{"recipe":_vm.recipe}}),(_vm.share_uid !== 'None')?_c('div',{staticClass:"row text-center d-print-none",staticStyle:{"margin-top":"3vh","margin-bottom":"3vh"}},[_c('div',{staticClass:"col col-md-12"},[_c('a',{attrs:{"href":_vm.resolveDjangoUrl('view_report_share_abuse', _vm.share_uid)}},[_vm._v(_vm._s(_vm.$t('Report Abuse')))])])]):_vm._e()],2)}
var staticRenderFns = [function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"my-auto",staticStyle:{"padding-right":"4px"}},[_c('i',{staticClass:"fas fa-user-clock fa-2x text-primary"})])},function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"my-auto",staticStyle:{"padding-right":"4px"}},[_c('i',{staticClass:"far fa-clock fa-2x text-primary"})])},function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"my-auto",staticStyle:{"padding-right":"4px"}},[_c('i',{staticClass:"fas fa-pizza-slice fa-2x text-primary"})])}]


// CONCATENATED MODULE: ./src/apps/RecipeView/RecipeView.vue?vue&type=template&id=f457ce80&

// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/esm/createForOfIteratorHelper.js + 2 modules
var createForOfIteratorHelper = __webpack_require__("b85c");

// EXTERNAL MODULE: ./node_modules/bootstrap-vue/esm/index.js + 253 modules
var esm = __webpack_require__("5f5b");

// EXTERNAL MODULE: ./node_modules/bootstrap-vue/dist/bootstrap-vue.css
var bootstrap_vue = __webpack_require__("2dd8");

// EXTERNAL MODULE: ./src/utils/api.js
var api = __webpack_require__("7c15");

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"3096e903-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/Step.vue?vue&type=template&id=11c82342&
var Stepvue_type_template_id_11c82342_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[_c('hr'),(_vm.step.type === 'TEXT' || _vm.step.type === 'RECIPE')?[(_vm.recipe.steps.length > 1)?_c('div',{staticClass:"row"},[_c('div',{staticClass:"col col-md-8"},[_c('h5',{staticClass:"text-primary"},[(_vm.step.name)?[_vm._v(_vm._s(_vm.step.name))]:[_vm._v(_vm._s(_vm.$t('Step'))+" "+_vm._s(_vm.index + 1))],(_vm.step.time !== 0)?_c('small',{staticClass:"text-muted",staticStyle:{"margin-left":"4px"}},[_c('i',{staticClass:"fas fa-user-clock"}),_vm._v(" "+_vm._s(_vm.step.time)+" "+_vm._s(_vm.$t('min'))+" ")]):_vm._e(),(_vm.start_time !== '')?_c('small',{staticClass:"d-print-none"},[_c('b-link',{attrs:{"id":("id_reactive_popover_" + (_vm.step.id)),"href":"#"},on:{"click":_vm.openPopover}},[_vm._v(" "+_vm._s(_vm.moment(_vm.start_time).add(_vm.step.time_offset, 'minutes').format('HH:mm'))+" ")])],1):_vm._e()],2)]),_c('div',{staticClass:"col col-md-4",staticStyle:{"text-align":"right"}},[_c('b-button',{staticClass:"shadow-none d-print-none",class:{ 'text-primary': _vm.details_visible, 'text-success': !_vm.details_visible},staticStyle:{"border":"none","background":"none"},on:{"click":function($event){_vm.details_visible = !_vm.details_visible}}},[_c('i',{staticClass:"far fa-check-circle"})])],1)]):_vm._e()]:_vm._e(),(_vm.step.type === 'TEXT')?[_c('b-collapse',{attrs:{"id":"collapse-1"},model:{value:(_vm.details_visible),callback:function ($$v) {_vm.details_visible=$$v},expression:"details_visible"}},[_c('div',{staticClass:"row"},[(_vm.step.ingredients.length > 0 && (_vm.recipe.steps.length > 1 || _vm.force_ingredients))?_c('div',{staticClass:"col col-md-4"},[_c('table',{staticClass:"table table-sm"},[_vm._l((_vm.step.ingredients),function(i){return [_c('Ingredient',{key:i.id,attrs:{"ingredient":i,"ingredient_factor":_vm.ingredient_factor},on:{"checked-state-changed":function($event){return _vm.$emit('checked-state-changed', i)}}})]})],2)]):_vm._e(),_c('div',{staticClass:"col",class:{ 'col-md-8':  _vm.recipe.steps.length > 1, 'col-md-12':  _vm.recipe.steps.length <= 1,}},[_c('compile-component',{attrs:{"code":_vm.step.ingredients_markdown,"ingredient_factor":_vm.ingredient_factor}})],1)])])]:_vm._e(),(_vm.step.type === 'TIME' || _vm.step.type === 'FILE')?[_c('div',{staticClass:"row"},[_c('div',{staticClass:"col-md-8 offset-md-2",staticStyle:{"text-align":"center"}},[_c('h4',{staticClass:"text-primary"},[(_vm.step.name)?[_vm._v(_vm._s(_vm.step.name))]:[_vm._v(_vm._s(_vm.$t('Step'))+" "+_vm._s(_vm.index + 1))]],2),(_vm.step.time !== 0)?_c('span',{staticClass:"text-muted",staticStyle:{"margin-left":"4px"}},[_c('i',{staticClass:"fa fa-stopwatch"}),_vm._v(" "+_vm._s(_vm.step.time)+" "+_vm._s(_vm.$t('min')))]):_vm._e(),(_vm.start_time !== '')?_c('b-link',{staticClass:"d-print-none",attrs:{"id":("id_reactive_popover_" + (_vm.step.id)),"href":"#"},on:{"click":_vm.openPopover}},[_vm._v(" "+_vm._s(_vm.moment(_vm.start_time).add(_vm.step.time_offset, 'minutes').format('HH:mm'))+" ")]):_vm._e()],1),_c('div',{staticClass:"col-md-2",staticStyle:{"text-align":"right"}},[_c('b-button',{staticClass:"shadow-none d-print-none",class:{ 'text-primary': _vm.details_visible, 'text-success': !_vm.details_visible},staticStyle:{"border":"none","background":"none"},on:{"click":function($event){_vm.details_visible = !_vm.details_visible}}},[_c('i',{staticClass:"far fa-check-circle"})])],1)]),_c('b-collapse',{attrs:{"id":"collapse-1"},model:{value:(_vm.details_visible),callback:function ($$v) {_vm.details_visible=$$v},expression:"details_visible"}},[(_vm.step.instruction !== '')?_c('div',{staticClass:"row"},[_c('div',{staticClass:"col col-md-12",staticStyle:{"text-align":"center"}},[_c('compile-component',{attrs:{"code":_vm.step.ingredients_markdown,"ingredient_factor":_vm.ingredient_factor}})],1)]):_vm._e()])]:_vm._e(),_c('div',{staticClass:"row",staticStyle:{"text-align":"center"}},[_c('div',{staticClass:"col col-md-12"},[(_vm.step.file !== null)?[(_vm.step.file.file.includes('.png') || _vm.recipe.file_path.includes('.jpg') || _vm.recipe.file_path.includes('.jpeg') || _vm.recipe.file_path.includes('.gif'))?_c('div',[_c('img',{staticStyle:{"max-width":"50vw","max-height":"50vh"},attrs:{"src":_vm.step.file.file}})]):_c('div',[_c('a',{attrs:{"href":_vm.step.file.file,"target":"_blank","rel":"noreferrer nofollow"}},[_vm._v(_vm._s(_vm.$t('Download'))+" "+_vm._s(_vm.$t('File')))])])]:_vm._e()],2)]),(_vm.step.type === 'RECIPE' && _vm.step.step_recipe_data !== null)?_c('div',{staticClass:"card"},[_c('b-collapse',{attrs:{"id":"collapse-1"},model:{value:(_vm.details_visible),callback:function ($$v) {_vm.details_visible=$$v},expression:"details_visible"}},[_c('div',{staticClass:"card-body"},[_c('h2',{staticClass:"card-title"},[_c('a',{attrs:{"href":_vm.resolveDjangoUrl('view_recipe',_vm.step.step_recipe_data.id)}},[_vm._v(_vm._s(_vm.step.step_recipe_data.name))])]),_vm._l((_vm.step.step_recipe_data.steps),function(sub_step,index){return _c('div',{key:("substep_" + (sub_step.id))},[_c('Step',{attrs:{"recipe":_vm.step.step_recipe_data,"step":sub_step,"ingredient_factor":_vm.ingredient_factor,"index":index,"start_time":_vm.start_time,"force_ingredients":true}})],1)})],2)])],1):_vm._e(),(_vm.start_time !== '')?_c('div',[_c('b-popover',{ref:("id_reactive_popover_" + (_vm.step.id)),attrs:{"target":("id_reactive_popover_" + (_vm.step.id)),"triggers":"click","placement":"bottom","title":_vm.$t('Step start time')}},[_c('div',[_c('b-form-group',{staticClass:"mb-1",attrs:{"label":"Time","label-for":"popover-input-1","label-cols":"3"}},[_c('b-form-input',{attrs:{"type":"datetime-local","id":"popover-input-1","size":"sm"},model:{value:(_vm.set_time_input),callback:function ($$v) {_vm.set_time_input=$$v},expression:"set_time_input"}})],1)],1),_c('div',{staticClass:"row",staticStyle:{"margin-top":"1vh"}},[_c('div',{staticClass:"col-12",staticStyle:{"text-align":"right"}},[_c('b-button',{staticStyle:{"margin-right":"8px"},attrs:{"size":"sm","variant":"secondary"},on:{"click":_vm.closePopover}},[_vm._v("Cancel")]),_c('b-button',{attrs:{"size":"sm","variant":"primary"},on:{"click":_vm.updateTime}},[_vm._v("Ok")])],1)])])],1):_vm._e()],2)}
var Stepvue_type_template_id_11c82342_staticRenderFns = []


// CONCATENATED MODULE: ./src/components/Step.vue?vue&type=template&id=11c82342&

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.number.constructor.js
var es_number_constructor = __webpack_require__("a9e3");

// EXTERNAL MODULE: ./src/utils/utils.js + 1 modules
var utils = __webpack_require__("fa7d");

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"3096e903-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/Ingredient.vue?vue&type=template&id=05c2159d&
var Ingredientvue_type_template_id_05c2159d_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('tr',{on:{"click":function($event){return _vm.$emit('checked-state-changed', _vm.ingredient)}}},[(_vm.ingredient.is_header)?[_c('td',{attrs:{"colspan":"5"}},[_c('b',[_vm._v(_vm._s(_vm.ingredient.note))])])]:[_c('td',{staticClass:"d-print-none"},[(_vm.ingredient.checked)?_c('i',{staticClass:"far fa-check-circle text-success"}):_vm._e(),(!_vm.ingredient.checked)?_c('i',{staticClass:"far fa-check-circle text-primary"}):_vm._e()]),_c('td',[(_vm.ingredient.amount !== 0)?_c('span',{domProps:{"innerHTML":_vm._s(_vm.calculateAmount(_vm.ingredient.amount))}}):_vm._e()]),_c('td',[(_vm.ingredient.unit !== null && !_vm.ingredient.no_amount)?_c('span',[_vm._v(_vm._s(_vm.ingredient.unit.name))]):_vm._e()]),_c('td',[(_vm.ingredient.food !== null)?[(_vm.ingredient.food.recipe !== null)?_c('a',{attrs:{"href":_vm.resolveDjangoUrl('view_recipe', _vm.ingredient.food.recipe),"target":"_blank","rel":"noopener noreferrer"}},[_vm._v(_vm._s(_vm.ingredient.food.name))]):_vm._e(),(_vm.ingredient.food.recipe === null)?_c('span',[_vm._v(_vm._s(_vm.ingredient.food.name))]):_vm._e()]:_vm._e()],2),_c('td',[(_vm.ingredient.note)?_c('div',[_c('span',{directives:[{name:"b-popover",rawName:"v-b-popover.hover",value:(_vm.ingredient.note),expression:"ingredient.note",modifiers:{"hover":true}}],staticClass:"d-print-none"},[_c('i',{staticClass:"far fa-comment"})]),_c('div',{staticClass:"d-none d-print-block"},[_c('i',{staticClass:"far fa-comment-alt d-print-none"}),_vm._v(" "+_vm._s(_vm.ingredient.note)+" ")])]):_vm._e()])]],2)}
var Ingredientvue_type_template_id_05c2159d_staticRenderFns = []


// CONCATENATED MODULE: ./src/components/Ingredient.vue?vue&type=template&id=05c2159d&

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/Ingredient.vue?vue&type=script&lang=js&

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ var Ingredientvue_type_script_lang_js_ = ({
  name: 'Ingredient',
  props: {
    ingredient: Object,
    ingredient_factor: {
      type: Number,
      default: 1
    }
  },
  mixins: [utils["b" /* ResolveUrlMixin */]],
  data: function data() {
    return {
      checked: false
    };
  },
  methods: {
    calculateAmount: function calculateAmount(x) {
      return Object(utils["d" /* calculateAmount */])(x, this.ingredient_factor);
    }
  }
});
// CONCATENATED MODULE: ./src/components/Ingredient.vue?vue&type=script&lang=js&
 /* harmony default export */ var components_Ingredientvue_type_script_lang_js_ = (Ingredientvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-loader/lib/runtime/componentNormalizer.js
var componentNormalizer = __webpack_require__("2877");

// CONCATENATED MODULE: ./src/components/Ingredient.vue





/* normalize component */

var component = Object(componentNormalizer["a" /* default */])(
  components_Ingredientvue_type_script_lang_js_,
  Ingredientvue_type_template_id_05c2159d_render,
  Ingredientvue_type_template_id_05c2159d_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ var Ingredient = (component.exports);
// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"3096e903-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/CompileComponent.vue?vue&type=template&id=87ff3146&
var CompileComponentvue_type_template_id_87ff3146_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[_c(_vm.compiled,{tag:"component",attrs:{"ingredient_factor":_vm.ingredient_factor,"code":_vm.code}})],1)}
var CompileComponentvue_type_template_id_87ff3146_staticRenderFns = []


// CONCATENATED MODULE: ./src/components/CompileComponent.vue?vue&type=template&id=87ff3146&

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"3096e903-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/ScalableNumber.vue?vue&type=template&id=f9c83b04&
var ScalableNumbervue_type_template_id_f9c83b04_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('span',{domProps:{"innerHTML":_vm._s(_vm.calculateAmount(_vm.number))}})}
var ScalableNumbervue_type_template_id_f9c83b04_staticRenderFns = []


// CONCATENATED MODULE: ./src/components/ScalableNumber.vue?vue&type=template&id=f9c83b04&

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/ScalableNumber.vue?vue&type=script&lang=js&

//
//
//
//
//

/* harmony default export */ var ScalableNumbervue_type_script_lang_js_ = ({
  name: 'ScalableNumber',
  props: {
    number: Number,
    factor: {
      type: Number,
      default: 4
    }
  },
  methods: {
    calculateAmount: function calculateAmount(x) {
      return Object(utils["d" /* calculateAmount */])(x, this.factor);
    }
  }
});
// CONCATENATED MODULE: ./src/components/ScalableNumber.vue?vue&type=script&lang=js&
 /* harmony default export */ var components_ScalableNumbervue_type_script_lang_js_ = (ScalableNumbervue_type_script_lang_js_); 
// CONCATENATED MODULE: ./src/components/ScalableNumber.vue





/* normalize component */

var ScalableNumber_component = Object(componentNormalizer["a" /* default */])(
  components_ScalableNumbervue_type_script_lang_js_,
  ScalableNumbervue_type_template_id_f9c83b04_render,
  ScalableNumbervue_type_template_id_f9c83b04_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ var ScalableNumber = (ScalableNumber_component.exports);
// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/CompileComponent.vue?vue&type=script&lang=js&
//
//
//
//
//
//


/*
i dont 100% understand this kind of dirty workaround but it works ...
If you read this and know a better way of running arbitrary vue code that comes from an API endpoint let me know

obviously only run trusted code this way ...
*/

/* harmony default export */ var CompileComponentvue_type_script_lang_js_ = ({
  name: 'CompileComponent',
  props: ['code', 'ingredient_factor'],
  data: function data() {
    return {
      compiled: null
    };
  },
  mounted: function mounted() {
    this.compiled = vue_esm["default"].component('compiled-component', {
      props: ['ingredient_factor', 'code'],
      components: {
        ScalableNumber: ScalableNumber // eslint-disable-line

      },
      template: "<div>".concat(this.code, "</div>")
    });
  }
});
// CONCATENATED MODULE: ./src/components/CompileComponent.vue?vue&type=script&lang=js&
 /* harmony default export */ var components_CompileComponentvue_type_script_lang_js_ = (CompileComponentvue_type_script_lang_js_); 
// CONCATENATED MODULE: ./src/components/CompileComponent.vue





/* normalize component */

var CompileComponent_component = Object(componentNormalizer["a" /* default */])(
  components_CompileComponentvue_type_script_lang_js_,
  CompileComponentvue_type_template_id_87ff3146_render,
  CompileComponentvue_type_template_id_87ff3146_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ var CompileComponent = (CompileComponent_component.exports);
// EXTERNAL MODULE: ./node_modules/moment/moment.js
var moment = __webpack_require__("c1df");
var moment_default = /*#__PURE__*/__webpack_require__.n(moment);

// EXTERNAL MODULE: ./src/components/Keywords.vue + 4 modules
var Keywords = __webpack_require__("81d5");

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/Step.vue?vue&type=script&lang=js&

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//








vue_esm["default"].prototype.moment = moment_default.a;
/* harmony default export */ var Stepvue_type_script_lang_js_ = ({
  name: 'Step',
  mixins: [utils["a" /* GettextMixin */], utils["b" /* ResolveUrlMixin */]],
  components: {
    Ingredient: Ingredient,
    CompileComponent: CompileComponent
  },
  props: {
    step: Object,
    ingredient_factor: Number,
    index: Number,
    recipe: Object,
    start_time: String,
    force_ingredients: {
      type: Boolean,
      default: false
    }
  },
  data: function data() {
    return {
      details_visible: true,
      set_time_input: ''
    };
  },
  mounted: function mounted() {
    this.set_time_input = moment_default()(this.start_time).add(this.step.time_offset, 'minutes').format('yyyy-MM-DDTHH:mm');
  },
  methods: {
    calculateAmount: function calculateAmount(x) {
      // used by the jinja2 template
      return Object(utils["d" /* calculateAmount */])(x, this.ingredient_factor);
    },
    updateTime: function updateTime() {
      var new_start_time = moment_default()(this.set_time_input).add(this.step.time_offset * -1, 'minutes').format('yyyy-MM-DDTHH:mm');
      this.$emit('update-start-time', new_start_time);
      this.closePopover();
    },
    closePopover: function closePopover() {
      this.$refs["id_reactive_popover_".concat(this.step.id)].$emit('close');
    },
    openPopover: function openPopover() {
      this.$refs["id_reactive_popover_".concat(this.step.id)].$emit('open');
    }
  }
});
// CONCATENATED MODULE: ./src/components/Step.vue?vue&type=script&lang=js&
 /* harmony default export */ var components_Stepvue_type_script_lang_js_ = (Stepvue_type_script_lang_js_); 
// CONCATENATED MODULE: ./src/components/Step.vue





/* normalize component */

var Step_component = Object(componentNormalizer["a" /* default */])(
  components_Stepvue_type_script_lang_js_,
  Stepvue_type_template_id_11c82342_render,
  Stepvue_type_template_id_11c82342_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ var Step = (Step_component.exports);
// EXTERNAL MODULE: ./src/components/RecipeContextMenu.vue + 9 modules
var RecipeContextMenu = __webpack_require__("fc0d");

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"3096e903-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/PdfViewer.vue?vue&type=template&id=43b4c8ef&
var PdfViewervue_type_template_id_43b4c8ef_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[_c('iframe',{staticStyle:{"border":"none"},attrs:{"src":_vm.pdfUrl,"width":"100%","height":"700px"}})])}
var PdfViewervue_type_template_id_43b4c8ef_staticRenderFns = []


// CONCATENATED MODULE: ./src/components/PdfViewer.vue?vue&type=template&id=43b4c8ef&

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/PdfViewer.vue?vue&type=script&lang=js&
//
//
//
//
//
//
//
//

/* harmony default export */ var PdfViewervue_type_script_lang_js_ = ({
  name: 'PdfViewer',
  mixins: [utils["b" /* ResolveUrlMixin */]],
  props: {
    recipe: Object
  },
  computed: {
    pdfUrl: function pdfUrl() {
      return '/static/pdfjs/viewer.html?file=' + Object(utils["g" /* resolveDjangoUrl */])('api_get_recipe_file', this.recipe.id);
    }
  }
});
// CONCATENATED MODULE: ./src/components/PdfViewer.vue?vue&type=script&lang=js&
 /* harmony default export */ var components_PdfViewervue_type_script_lang_js_ = (PdfViewervue_type_script_lang_js_); 
// CONCATENATED MODULE: ./src/components/PdfViewer.vue





/* normalize component */

var PdfViewer_component = Object(componentNormalizer["a" /* default */])(
  components_PdfViewervue_type_script_lang_js_,
  PdfViewervue_type_template_id_43b4c8ef_render,
  PdfViewervue_type_template_id_43b4c8ef_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ var PdfViewer = (PdfViewer_component.exports);
// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"3096e903-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/ImageViewer.vue?vue&type=template&id=4e5b8c8f&
var ImageViewervue_type_template_id_4e5b8c8f_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticStyle:{"text-align":"center"}},[_c('b-img',{attrs:{"src":_vm.pdfUrl,"alt":_vm.$t('External_Recipe_Image')}})],1)}
var ImageViewervue_type_template_id_4e5b8c8f_staticRenderFns = []


// CONCATENATED MODULE: ./src/components/ImageViewer.vue?vue&type=template&id=4e5b8c8f&

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/ImageViewer.vue?vue&type=script&lang=js&
//
//
//
//
//
//
//
//

/* harmony default export */ var ImageViewervue_type_script_lang_js_ = ({
  name: 'ImageViewer',
  props: {
    recipe: Object
  },
  computed: {
    pdfUrl: function pdfUrl() {
      return Object(utils["g" /* resolveDjangoUrl */])('api_get_recipe_file', this.recipe.id);
    }
  }
});
// CONCATENATED MODULE: ./src/components/ImageViewer.vue?vue&type=script&lang=js&
 /* harmony default export */ var components_ImageViewervue_type_script_lang_js_ = (ImageViewervue_type_script_lang_js_); 
// CONCATENATED MODULE: ./src/components/ImageViewer.vue





/* normalize component */

var ImageViewer_component = Object(componentNormalizer["a" /* default */])(
  components_ImageViewervue_type_script_lang_js_,
  ImageViewervue_type_template_id_4e5b8c8f_render,
  ImageViewervue_type_template_id_4e5b8c8f_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ var ImageViewer = (ImageViewer_component.exports);
// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"3096e903-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/Nutrition.vue?vue&type=template&id=4bf1a14f&
var Nutritionvue_type_template_id_4bf1a14f_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return (_vm.recipe.nutrition !== null)?_c('div',[_c('div',{staticClass:"card border-success"},[_c('div',{staticClass:"card-body"},[_c('div',{staticClass:"row"},[_c('div',{staticClass:"col-12"},[_c('h4',{staticClass:"card-title"},[_c('i',{staticClass:"fas fa-carrot"}),_vm._v(" "+_vm._s(_vm.$t('Nutrition')))])])]),_c('div',{staticClass:"row"},[_c('div',{staticClass:"col-6"},[_c('i',{staticClass:"fas fa-fire fa-fw text-primary"}),_vm._v(" "+_vm._s(_vm.$t('Calories'))+" ")]),_c('div',{staticClass:"col-6"},[_c('span',{domProps:{"innerHTML":_vm._s(_vm.calculateAmount(_vm.recipe.nutrition.calories))}}),_vm._v(" kcal ")])]),_c('div',{staticClass:"row"},[_c('div',{staticClass:"col-6"},[_c('i',{staticClass:"fas fa-bread-slice fa-fw text-primary"}),_vm._v(" "+_vm._s(_vm.$t('Carbohydrates'))+" ")]),_c('div',{staticClass:"col-6"},[_c('span',{domProps:{"innerHTML":_vm._s(_vm.calculateAmount(_vm.recipe.nutrition.carbohydrates))}}),_vm._v(" g ")])]),_c('div',{staticClass:"row"},[_c('div',{staticClass:"col-6"},[_c('i',{staticClass:"fas fa-cheese fa-fw text-primary"}),_vm._v(" "+_vm._s(_vm.$t('Fats'))+" ")]),_c('div',{staticClass:"col-6"},[_c('span',{domProps:{"innerHTML":_vm._s(_vm.calculateAmount(_vm.recipe.nutrition.fats))}}),_vm._v(" g ")])]),_c('div',{staticClass:"row"},[_c('div',{staticClass:"col-6"},[_c('i',{staticClass:"fas fa-drumstick-bite fa-fw text-primary"}),_vm._v(" "+_vm._s(_vm.$t('Proteins'))+" ")]),_c('div',{staticClass:"col-6"},[_c('span',{domProps:{"innerHTML":_vm._s(_vm.calculateAmount(_vm.recipe.nutrition.proteins))}}),_vm._v(" g ")])])])])]):_vm._e()}
var Nutritionvue_type_template_id_4bf1a14f_staticRenderFns = []


// CONCATENATED MODULE: ./src/components/Nutrition.vue?vue&type=template&id=4bf1a14f&

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/Nutrition.vue?vue&type=script&lang=js&

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ var Nutritionvue_type_script_lang_js_ = ({
  name: 'Nutrition',
  props: {
    recipe: Object,
    ingredient_factor: Number
  },
  methods: {
    calculateAmount: function calculateAmount(x) {
      return Object(utils["d" /* calculateAmount */])(x, this.ingredient_factor);
    }
  }
});
// CONCATENATED MODULE: ./src/components/Nutrition.vue?vue&type=script&lang=js&
 /* harmony default export */ var components_Nutritionvue_type_script_lang_js_ = (Nutritionvue_type_script_lang_js_); 
// CONCATENATED MODULE: ./src/components/Nutrition.vue





/* normalize component */

var Nutrition_component = Object(componentNormalizer["a" /* default */])(
  components_Nutritionvue_type_script_lang_js_,
  Nutritionvue_type_template_id_4bf1a14f_render,
  Nutritionvue_type_template_id_4bf1a14f_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ var Nutrition = (Nutrition_component.exports);
// EXTERNAL MODULE: ./src/components/LoadingSpinner.vue + 4 modules
var LoadingSpinner = __webpack_require__("d76c");

// EXTERNAL MODULE: ./src/components/AddRecipeToBook.vue + 4 modules
var AddRecipeToBook = __webpack_require__("d46a");

// EXTERNAL MODULE: ./src/components/RecipeRating.vue + 4 modules
var RecipeRating = __webpack_require__("ca5b");

// EXTERNAL MODULE: ./src/components/LastCooked.vue + 4 modules
var LastCooked = __webpack_require__("830a");

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/apps/RecipeView/RecipeView.vue?vue&type=script&lang=js&

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

















vue_esm["default"].prototype.moment = moment_default.a;
vue_esm["default"].use(esm["a" /* BootstrapVue */]);
/* harmony default export */ var RecipeViewvue_type_script_lang_js_ = ({
  name: 'RecipeView',
  mixins: [utils["b" /* ResolveUrlMixin */], utils["c" /* ToastMixin */]],
  components: {
    LastCooked: LastCooked["a" /* default */],
    RecipeRating: RecipeRating["a" /* default */],
    PdfViewer: PdfViewer,
    ImageViewer: ImageViewer,
    Ingredient: Ingredient,
    Step: Step,
    RecipeContextMenu: RecipeContextMenu["a" /* default */],
    Nutrition: Nutrition,
    Keywords: Keywords["a" /* default */],
    LoadingSpinner: LoadingSpinner["a" /* default */],
    AddRecipeToBook: AddRecipeToBook["a" /* default */]
  },
  computed: {
    ingredient_factor: function ingredient_factor() {
      return this.servings / this.recipe.servings;
    }
  },
  data: function data() {
    return {
      loading: true,
      recipe: undefined,
      ingredient_count: 0,
      servings: 1,
      start_time: "",
      share_uid: window.SHARE_UID
    };
  },
  mounted: function mounted() {
    this.loadRecipe(window.RECIPE_ID);
    this.$i18n.locale = window.CUSTOM_LOCALE;
  },
  methods: {
    loadRecipe: function loadRecipe(recipe_id) {
      var _this = this;

      Object(api["c" /* apiLoadRecipe */])(recipe_id).then(function (recipe) {
        if (window.USER_SERVINGS !== 0) {
          recipe.servings = window.USER_SERVINGS;
        }

        _this.servings = recipe.servings;
        var total_time = 0;

        var _iterator = Object(createForOfIteratorHelper["a" /* default */])(recipe.steps),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var step = _step.value;
            _this.ingredient_count += step.ingredients.length;

            var _iterator2 = Object(createForOfIteratorHelper["a" /* default */])(step.ingredients),
                _step2;

            try {
              for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                var ingredient = _step2.value;

                _this.$set(ingredient, 'checked', false);
              }
            } catch (err) {
              _iterator2.e(err);
            } finally {
              _iterator2.f();
            }

            step.time_offset = total_time;
            total_time += step.time;
          } // set start time only if there are any steps with timers (otherwise no timers are rendered)

        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }

        if (total_time > 0) {
          _this.start_time = moment_default()().format('yyyy-MM-DDTHH:mm');
        }

        _this.recipe = recipe;
        _this.loading = false;
      });
    },
    updateStartTime: function updateStartTime(e) {
      this.start_time = e;
    },
    updateIngredientCheckedState: function updateIngredientCheckedState(e) {
      var _iterator3 = Object(createForOfIteratorHelper["a" /* default */])(this.recipe.steps),
          _step3;

      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var step = _step3.value;

          var _iterator4 = Object(createForOfIteratorHelper["a" /* default */])(step.ingredients),
              _step4;

          try {
            for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
              var ingredient = _step4.value;

              if (ingredient.id === e.id) {
                this.$set(ingredient, 'checked', !ingredient.checked);
              }
            }
          } catch (err) {
            _iterator4.e(err);
          } finally {
            _iterator4.f();
          }
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
    }
  }
});
// CONCATENATED MODULE: ./src/apps/RecipeView/RecipeView.vue?vue&type=script&lang=js&
 /* harmony default export */ var RecipeView_RecipeViewvue_type_script_lang_js_ = (RecipeViewvue_type_script_lang_js_); 
// CONCATENATED MODULE: ./src/apps/RecipeView/RecipeView.vue





/* normalize component */

var RecipeView_component = Object(componentNormalizer["a" /* default */])(
  RecipeView_RecipeViewvue_type_script_lang_js_,
  RecipeViewvue_type_template_id_f457ce80_render,
  staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ var RecipeView = (RecipeView_component.exports);
// EXTERNAL MODULE: ./src/i18n.js
var i18n = __webpack_require__("9225");

// CONCATENATED MODULE: ./src/apps/RecipeView/main.js







vue_esm["default"].config.productionTip = false;
new vue_esm["default"]({
  i18n: i18n["a" /* default */],
  render: function render(h) {
    return h(RecipeView);
  }
}).$mount('#app');

/***/ }),

/***/ 1:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__("0671");


/***/ }),

/***/ "4678":
/***/ (function(module, exports, __webpack_require__) {

var map = {
	"./af": "2bfb",
	"./af.js": "2bfb",
	"./ar": "8e73",
	"./ar-dz": "a356",
	"./ar-dz.js": "a356",
	"./ar-kw": "423e",
	"./ar-kw.js": "423e",
	"./ar-ly": "1cfd",
	"./ar-ly.js": "1cfd",
	"./ar-ma": "0a84",
	"./ar-ma.js": "0a84",
	"./ar-sa": "8230",
	"./ar-sa.js": "8230",
	"./ar-tn": "6d83",
	"./ar-tn.js": "6d83",
	"./ar.js": "8e73",
	"./az": "485c",
	"./az.js": "485c",
	"./be": "1fc1",
	"./be.js": "1fc1",
	"./bg": "84aa",
	"./bg.js": "84aa",
	"./bm": "a7fa",
	"./bm.js": "a7fa",
	"./bn": "9043",
	"./bn-bd": "9686",
	"./bn-bd.js": "9686",
	"./bn.js": "9043",
	"./bo": "d26a",
	"./bo.js": "d26a",
	"./br": "6887",
	"./br.js": "6887",
	"./bs": "2554",
	"./bs.js": "2554",
	"./ca": "d716",
	"./ca.js": "d716",
	"./cs": "3c0d",
	"./cs.js": "3c0d",
	"./cv": "03ec",
	"./cv.js": "03ec",
	"./cy": "9797",
	"./cy.js": "9797",
	"./da": "0f14",
	"./da.js": "0f14",
	"./de": "b469",
	"./de-at": "b3eb",
	"./de-at.js": "b3eb",
	"./de-ch": "bb71",
	"./de-ch.js": "bb71",
	"./de.js": "b469",
	"./dv": "598a",
	"./dv.js": "598a",
	"./el": "8d47",
	"./el.js": "8d47",
	"./en-au": "0e6b",
	"./en-au.js": "0e6b",
	"./en-ca": "3886",
	"./en-ca.js": "3886",
	"./en-gb": "39a6",
	"./en-gb.js": "39a6",
	"./en-ie": "e1d3",
	"./en-ie.js": "e1d3",
	"./en-il": "7333",
	"./en-il.js": "7333",
	"./en-in": "ec2e",
	"./en-in.js": "ec2e",
	"./en-nz": "6f50",
	"./en-nz.js": "6f50",
	"./en-sg": "b7e9",
	"./en-sg.js": "b7e9",
	"./eo": "65db",
	"./eo.js": "65db",
	"./es": "898b",
	"./es-do": "0a3c",
	"./es-do.js": "0a3c",
	"./es-mx": "b5b7",
	"./es-mx.js": "b5b7",
	"./es-us": "55c9",
	"./es-us.js": "55c9",
	"./es.js": "898b",
	"./et": "ec18",
	"./et.js": "ec18",
	"./eu": "0ff2",
	"./eu.js": "0ff2",
	"./fa": "8df4",
	"./fa.js": "8df4",
	"./fi": "81e9",
	"./fi.js": "81e9",
	"./fil": "d69a",
	"./fil.js": "d69a",
	"./fo": "0721",
	"./fo.js": "0721",
	"./fr": "9f26",
	"./fr-ca": "d9f8",
	"./fr-ca.js": "d9f8",
	"./fr-ch": "0e49",
	"./fr-ch.js": "0e49",
	"./fr.js": "9f26",
	"./fy": "7118",
	"./fy.js": "7118",
	"./ga": "5120",
	"./ga.js": "5120",
	"./gd": "f6b4",
	"./gd.js": "f6b4",
	"./gl": "8840",
	"./gl.js": "8840",
	"./gom-deva": "aaf2",
	"./gom-deva.js": "aaf2",
	"./gom-latn": "0caa",
	"./gom-latn.js": "0caa",
	"./gu": "e0c5",
	"./gu.js": "e0c5",
	"./he": "c7aa",
	"./he.js": "c7aa",
	"./hi": "dc4d",
	"./hi.js": "dc4d",
	"./hr": "4ba9",
	"./hr.js": "4ba9",
	"./hu": "5b14",
	"./hu.js": "5b14",
	"./hy-am": "d6b6",
	"./hy-am.js": "d6b6",
	"./id": "5038",
	"./id.js": "5038",
	"./is": "0558",
	"./is.js": "0558",
	"./it": "6e98",
	"./it-ch": "6f12",
	"./it-ch.js": "6f12",
	"./it.js": "6e98",
	"./ja": "079e",
	"./ja.js": "079e",
	"./jv": "b540",
	"./jv.js": "b540",
	"./ka": "201b",
	"./ka.js": "201b",
	"./kk": "6d79",
	"./kk.js": "6d79",
	"./km": "e81d",
	"./km.js": "e81d",
	"./kn": "3e92",
	"./kn.js": "3e92",
	"./ko": "22f8",
	"./ko.js": "22f8",
	"./ku": "2421",
	"./ku.js": "2421",
	"./ky": "9609",
	"./ky.js": "9609",
	"./lb": "440c",
	"./lb.js": "440c",
	"./lo": "b29d",
	"./lo.js": "b29d",
	"./lt": "26f9",
	"./lt.js": "26f9",
	"./lv": "b97c",
	"./lv.js": "b97c",
	"./me": "293c",
	"./me.js": "293c",
	"./mi": "688b",
	"./mi.js": "688b",
	"./mk": "6909",
	"./mk.js": "6909",
	"./ml": "02fb",
	"./ml.js": "02fb",
	"./mn": "958b",
	"./mn.js": "958b",
	"./mr": "39bd",
	"./mr.js": "39bd",
	"./ms": "ebe4",
	"./ms-my": "6403",
	"./ms-my.js": "6403",
	"./ms.js": "ebe4",
	"./mt": "1b45",
	"./mt.js": "1b45",
	"./my": "8689",
	"./my.js": "8689",
	"./nb": "6ce3",
	"./nb.js": "6ce3",
	"./ne": "3a39",
	"./ne.js": "3a39",
	"./nl": "facd",
	"./nl-be": "db29",
	"./nl-be.js": "db29",
	"./nl.js": "facd",
	"./nn": "b84c",
	"./nn.js": "b84c",
	"./oc-lnc": "167b",
	"./oc-lnc.js": "167b",
	"./pa-in": "f3ff",
	"./pa-in.js": "f3ff",
	"./pl": "8d57",
	"./pl.js": "8d57",
	"./pt": "f260",
	"./pt-br": "d2d4",
	"./pt-br.js": "d2d4",
	"./pt.js": "f260",
	"./ro": "972c",
	"./ro.js": "972c",
	"./ru": "957c",
	"./ru.js": "957c",
	"./sd": "6784",
	"./sd.js": "6784",
	"./se": "ffff",
	"./se.js": "ffff",
	"./si": "eda5",
	"./si.js": "eda5",
	"./sk": "7be6",
	"./sk.js": "7be6",
	"./sl": "8155",
	"./sl.js": "8155",
	"./sq": "c8f3",
	"./sq.js": "c8f3",
	"./sr": "cf1e",
	"./sr-cyrl": "13e9",
	"./sr-cyrl.js": "13e9",
	"./sr.js": "cf1e",
	"./ss": "52bd",
	"./ss.js": "52bd",
	"./sv": "5fbd",
	"./sv.js": "5fbd",
	"./sw": "74dc",
	"./sw.js": "74dc",
	"./ta": "3de5",
	"./ta.js": "3de5",
	"./te": "5cbb",
	"./te.js": "5cbb",
	"./tet": "576c",
	"./tet.js": "576c",
	"./tg": "3b1b",
	"./tg.js": "3b1b",
	"./th": "10e8",
	"./th.js": "10e8",
	"./tk": "5aff",
	"./tk.js": "5aff",
	"./tl-ph": "0f38",
	"./tl-ph.js": "0f38",
	"./tlh": "cf755",
	"./tlh.js": "cf755",
	"./tr": "0e81",
	"./tr.js": "0e81",
	"./tzl": "cf51",
	"./tzl.js": "cf51",
	"./tzm": "c109",
	"./tzm-latn": "b53d",
	"./tzm-latn.js": "b53d",
	"./tzm.js": "c109",
	"./ug-cn": "6117",
	"./ug-cn.js": "6117",
	"./uk": "ada2",
	"./uk.js": "ada2",
	"./ur": "5294",
	"./ur.js": "5294",
	"./uz": "2e8c",
	"./uz-latn": "010e",
	"./uz-latn.js": "010e",
	"./uz.js": "2e8c",
	"./vi": "2921",
	"./vi.js": "2921",
	"./x-pseudo": "fd7e",
	"./x-pseudo.js": "fd7e",
	"./yo": "7f33",
	"./yo.js": "7f33",
	"./zh-cn": "5c3a",
	"./zh-cn.js": "5c3a",
	"./zh-hk": "49ab",
	"./zh-hk.js": "49ab",
	"./zh-mo": "3a6c",
	"./zh-mo.js": "3a6c",
	"./zh-tw": "90ea",
	"./zh-tw.js": "90ea"
};


function webpackContext(req) {
	var id = webpackContextResolve(req);
	return __webpack_require__(id);
}
function webpackContextResolve(req) {
	if(!__webpack_require__.o(map, req)) {
		var e = new Error("Cannot find module '" + req + "'");
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	}
	return map[req];
}
webpackContext.keys = function webpackContextKeys() {
	return Object.keys(map);
};
webpackContext.resolve = webpackContextResolve;
module.exports = webpackContext;
webpackContext.id = "4678";

/***/ }),

/***/ "49f8":
/***/ (function(module, exports, __webpack_require__) {

var map = {
	"./de.json": "6ce2",
	"./en.json": "edd4",
	"./hy.json": "dfc6",
	"./nl.json": "a625",
	"./sv.json": "4c5b"
};


function webpackContext(req) {
	var id = webpackContextResolve(req);
	return __webpack_require__(id);
}
function webpackContextResolve(req) {
	if(!__webpack_require__.o(map, req)) {
		var e = new Error("Cannot find module '" + req + "'");
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	}
	return map[req];
}
webpackContext.keys = function webpackContextKeys() {
	return Object.keys(map);
};
webpackContext.resolve = webpackContextResolve;
module.exports = webpackContext;
webpackContext.id = "49f8";

/***/ }),

/***/ "4c5b":
/***/ (function(module) {

module.exports = JSON.parse("{\"import_running\":\"Import pågår, var god vänta!\",\"all_fields_optional\":\"Alla rutor är valfria och kan lämnas tomma.\",\"convert_internal\":\"Konvertera till internt recept\",\"Log_Recipe_Cooking\":\"Logga tillagningen av receptet\",\"External_Recipe_Image\":\"Externt receptbild\",\"Add_to_Book\":\"Lägg till i kokbok\",\"Add_to_Shopping\":\"Lägg till i handelslista\",\"Add_to_Plan\":\"Lägg till i matsedel\",\"Step_start_time\":\"Steg starttid\",\"Select_Book\":\"Välj kokbok\",\"Recipe_Image\":\"Receptbild\",\"Import_finished\":\"Importering klar\",\"View_Recipes\":\"Visa recept\",\"Log_Cooking\":\"Logga tillagning\",\"Proteins\":\"Protein\",\"Fats\":\"Fett\",\"Carbohydrates\":\"Kolhydrater\",\"Calories\":\"Kalorier\",\"Nutrition\":\"Näringsinnehåll\",\"Date\":\"Datum\",\"Share\":\"Dela\",\"Export\":\"Exportera\",\"Rating\":\"Betyg\",\"Close\":\"Stäng\",\"Add\":\"Lägg till\",\"Ingredients\":\"Ingredienser\",\"min\":\"min\",\"Servings\":\"Portioner\",\"Waiting\":\"Väntan\",\"Preparation\":\"Förberedelse\",\"Edit\":\"Redigera\",\"Open\":\"Öppna\",\"Save\":\"Spara\",\"Step\":\"Steg\",\"Search\":\"Sök\",\"Import\":\"Importera\",\"Print\":\"Skriv ut\",\"Information\":\"Information\"}");

/***/ }),

/***/ "6ce2":
/***/ (function(module) {

module.exports = JSON.parse("{\"Import\":\"Importieren\",\"import_running\":\"Import läuft, bitte warten!\",\"Import_finished\":\"Import fertig\",\"View_Recipes\":\"Rezepte Ansehen\",\"Information\":\"Information\",\"all_fields_optional\":\"Alle Felder sind optional und können leer gelassen werden.\",\"convert_internal\":\"Zu internem Rezept wandeln\",\"Log_Recipe_Cooking\":\"Kochen protokollieren\",\"External_Recipe_Image\":\"Externes Rezept Bild\",\"Add_to_Book\":\"Zu Buch hinzufügen\",\"Add_to_Shopping\":\"Zu Einkaufsliste hinzufügen\",\"Add_to_Plan\":\"Zu Plan hinzufügen\",\"Step_start_time\":\"Schritt Startzeit\",\"Select_Book\":\"Buch wählen\",\"Recipe_Image\":\"Rezept Bild\",\"Log_Cooking\":\"Kochen protokollieren\",\"Proteins\":\"Proteine\",\"Fats\":\"Fette\",\"Carbohydrates\":\"Kohlenhydrate\",\"Calories\":\"Kalorien\",\"Nutrition\":\"Nährwerte\",\"Keywords\":\"Stichwörter\",\"Books\":\"Bücher\",\"show_only_internal\":\"Nur interne Rezepte anzeigen\",\"Ingredients\":\"Zutaten\",\"min\":\"Min\",\"Servings\":\"Portionen\",\"Waiting\":\"Wartezeit\",\"Preparation\":\"Vorbereitung\",\"Edit\":\"Bearbeiten\",\"Open\":\"Öffnen\",\"Save\":\"Speichern\",\"Step\":\"Schritt\",\"Search\":\"Suchen\",\"Print\":\"Drucken\",\"New_Recipe\":\"Neues Rezept\",\"Url_Import\":\"URL Import\",\"Reset_Search\":\"Suche zurücksetzen\",\"or\":\"oder\",\"and\":\"und\",\"Recently_Viewed\":\"Kürzlich angesehen\",\"External\":\"Extern\",\"Settings\":\"Einstellungen\",\"Meal_Plan\":\"Speiseplan\",\"Date\":\"Datum\",\"Share\":\"Teilen\",\"Export\":\"Exportieren\",\"Rating\":\"Bewertung\",\"Close\":\"Schließen\",\"Add\":\"Hinzufügen\",\"Copy\":\"Kopieren\",\"New\":\"Neu\",\"Categories\":\"Kategorien\",\"Category\":\"Kategorie\",\"Selected\":\"Ausgewählt\",\"Supermarket\":\"Supermarkt\",\"Files\":\"Dateien\",\"Size\":\"Größe\",\"success_fetching_resource\":\"Ressource erfolgreich abgerufen!\",\"Download\":\"Herunterladen\",\"Success\":\"Erfolgreich\",\"err_fetching_resource\":\"Ein Fehler trat während dem Abrufen einer Ressource auf!\",\"err_creating_resource\":\"Ein Fehler trat während dem Erstellen einer Ressource auf!\",\"err_updating_resource\":\"Ein Fehler trat während dem Aktualisieren einer Ressource auf!\",\"success_creating_resource\":\"Ressource erfolgreich erstellt!\",\"success_updating_resource\":\"Ressource erfolgreich aktualisiert!\",\"File\":\"Datei\",\"Delete\":\"Löschen\",\"err_deleting_resource\":\"Ein Fehler trat während dem Löschen einer Ressource auf!\",\"Cancel\":\"Abbrechen\",\"success_deleting_resource\":\"Ressource erfolgreich gelöscht!\",\"Load_More\":\"Mehr laden\",\"Ok\":\"Öffnen\"}");

/***/ }),

/***/ "7c15":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return apiLoadRecipe; });
/* unused harmony export apiLoadImportLog */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return apiLogCooking; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return apiLoadCookBooks; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return apiAddRecipeBookEntry; });
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("bc3a");
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(axios__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _utils_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("fa7d");



axios__WEBPACK_IMPORTED_MODULE_0___default.a.defaults.xsrfCookieName = 'csrftoken';
axios__WEBPACK_IMPORTED_MODULE_0___default.a.defaults.xsrfHeaderName = "X-CSRFTOKEN";
function apiLoadRecipe(recipe_id) {
  var url = Object(_utils_utils__WEBPACK_IMPORTED_MODULE_1__[/* resolveDjangoUrl */ "g"])('api:recipe-detail', recipe_id);

  if (window.SHARE_UID !== undefined) {
    url += '?share=' + window.SHARE_UID;
  }

  return axios__WEBPACK_IMPORTED_MODULE_0___default.a.get(url).then(function (response) {
    return response.data;
  }).catch(function (err) {
    handleError(err, 'There was an error loading a resource!', 'danger');
  });
}
function apiLoadImportLog(id) {
  var url = Object(_utils_utils__WEBPACK_IMPORTED_MODULE_1__[/* resolveDjangoUrl */ "g"])('api:importlog-detail', id);
  return axios__WEBPACK_IMPORTED_MODULE_0___default.a.get(url).then(function (response) {
    return response.data;
  }).catch(function (err) {
    handleError(err, 'There was an error loading a resource!', 'danger');
  });
}
function apiLogCooking(cook_log) {
  return axios__WEBPACK_IMPORTED_MODULE_0___default.a.post(Object(_utils_utils__WEBPACK_IMPORTED_MODULE_1__[/* resolveDjangoUrl */ "g"])('api:cooklog-list'), cook_log).then(function (response) {
    Object(_utils_utils__WEBPACK_IMPORTED_MODULE_1__[/* makeToast */ "f"])('Saved', 'Cook Log entry saved!', 'success');
  }).catch(function (err) {
    handleError(err, 'There was an error creating a resource!', 'danger');
  });
}
function apiLoadCookBooks(query) {
  return axios__WEBPACK_IMPORTED_MODULE_0___default.a.get(Object(_utils_utils__WEBPACK_IMPORTED_MODULE_1__[/* resolveDjangoUrl */ "g"])('api:recipebook-list') + '?query=' + query).then(function (response) {
    return response.data;
  }).catch(function (err) {//handleError(err, 'There was an error loading a resource!', 'danger')
  });
}
function apiAddRecipeBookEntry(entry) {
  return axios__WEBPACK_IMPORTED_MODULE_0___default.a.post(Object(_utils_utils__WEBPACK_IMPORTED_MODULE_1__[/* resolveDjangoUrl */ "g"])('api:recipebookentry-list'), entry).then(function (response) {
    Object(_utils_utils__WEBPACK_IMPORTED_MODULE_1__[/* makeToast */ "f"])('Saved', 'Recipe Book entry saved!', 'success');
  }).catch(function (err) {
    handleError(err, 'There was an error creating a resource!', 'danger');
  });
}

function handleError(error, message) {
  if ('response' in error) {
    console.log(error.response);
    var title = 'statusText' in error.response ? error.response.statusText : Object(_utils_utils__WEBPACK_IMPORTED_MODULE_1__[/* djangoGettext */ "e"])('Error');
    message += '\n\n' + JSON.stringify(error.response.data);
    Object(_utils_utils__WEBPACK_IMPORTED_MODULE_1__[/* makeToast */ "f"])(title, message, 'danger');
  } else {
    Object(_utils_utils__WEBPACK_IMPORTED_MODULE_1__[/* makeToast */ "f"])('Error', message, 'danger');
    console.log(error);
  }
}

/***/ }),

/***/ "81d5":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"3096e903-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/Keywords.vue?vue&type=template&id=23099e42&
var render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return (_vm.recipe.keywords.length > 0)?_c('div',_vm._l((_vm.recipe.keywords),function(k){return _c('span',{key:k.id,staticStyle:{"padding":"2px"}},[_c('b-badge',{attrs:{"pill":"","variant":"light"}},[_vm._v(_vm._s(k.label))])],1)}),0):_vm._e()}
var staticRenderFns = []


// CONCATENATED MODULE: ./src/components/Keywords.vue?vue&type=template&id=23099e42&

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/Keywords.vue?vue&type=script&lang=js&
//
//
//
//
//
//
//
//
/* harmony default export */ var Keywordsvue_type_script_lang_js_ = ({
  name: 'Keywords',
  props: {
    recipe: Object
  }
});
// CONCATENATED MODULE: ./src/components/Keywords.vue?vue&type=script&lang=js&
 /* harmony default export */ var components_Keywordsvue_type_script_lang_js_ = (Keywordsvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-loader/lib/runtime/componentNormalizer.js
var componentNormalizer = __webpack_require__("2877");

// CONCATENATED MODULE: ./src/components/Keywords.vue





/* normalize component */

var component = Object(componentNormalizer["a" /* default */])(
  components_Keywordsvue_type_script_lang_js_,
  render,
  staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ var Keywords = __webpack_exports__["a"] = (component.exports);

/***/ }),

/***/ "830a":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"3096e903-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/LastCooked.vue?vue&type=template&id=720408c0&scoped=true&
var render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('span',[(_vm.recipe.last_cooked !== null)?_c('b-badge',{attrs:{"pill":"","variant":"primary"}},[_c('i',{staticClass:"fas fa-utensils"}),_vm._v(" "+_vm._s(_vm.formatDate(_vm.recipe.last_cooked)))]):_vm._e()],1)}
var staticRenderFns = []


// CONCATENATED MODULE: ./src/components/LastCooked.vue?vue&type=template&id=720408c0&scoped=true&

// EXTERNAL MODULE: ./node_modules/moment/moment.js
var moment = __webpack_require__("c1df");
var moment_default = /*#__PURE__*/__webpack_require__.n(moment);

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/LastCooked.vue?vue&type=script&lang=js&
//
//
//
//
//
//
//
//

/* harmony default export */ var LastCookedvue_type_script_lang_js_ = ({
  name: "LastCooked",
  props: {
    recipe: Object
  },
  methods: {
    formatDate: function formatDate(datetime) {
      moment_default.a.locale(window.navigator.language);
      return moment_default()(datetime).format('L');
    }
  }
});
// CONCATENATED MODULE: ./src/components/LastCooked.vue?vue&type=script&lang=js&
 /* harmony default export */ var components_LastCookedvue_type_script_lang_js_ = (LastCookedvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-loader/lib/runtime/componentNormalizer.js
var componentNormalizer = __webpack_require__("2877");

// CONCATENATED MODULE: ./src/components/LastCooked.vue





/* normalize component */

var component = Object(componentNormalizer["a" /* default */])(
  components_LastCookedvue_type_script_lang_js_,
  render,
  staticRenderFns,
  false,
  null,
  "720408c0",
  null
  
)

/* harmony default export */ var LastCooked = __webpack_exports__["a"] = (component.exports);

/***/ }),

/***/ "9225":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("159b");
/* harmony import */ var core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_collections_for_each_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("d3b7");
/* harmony import */ var core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_object_to_string_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("ddb0");
/* harmony import */ var core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("ac1f");
/* harmony import */ var core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_regexp_exec_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var core_js_modules_es_string_match_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__("466d");
/* harmony import */ var core_js_modules_es_string_match_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_string_match_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__("a026");
/* harmony import */ var vue_i18n__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__("a925");







vue__WEBPACK_IMPORTED_MODULE_5__["default"].use(vue_i18n__WEBPACK_IMPORTED_MODULE_6__[/* default */ "a"]);

function loadLocaleMessages() {
  var locales = __webpack_require__("49f8");

  var messages = {};
  locales.keys().forEach(function (key) {
    var matched = key.match(/([A-Za-z0-9-_]+)\./i);

    if (matched && matched.length > 1) {
      var locale = matched[1];
      messages[locale] = locales(key);
    }
  });
  return messages;
}

/* harmony default export */ __webpack_exports__["a"] = (new vue_i18n__WEBPACK_IMPORTED_MODULE_6__[/* default */ "a"]({
  locale: Object({"NODE_ENV":"production","BASE_URL":""}).VUE_APP_I18N_LOCALE || 'en',
  fallbackLocale: Object({"NODE_ENV":"production","BASE_URL":""}).VUE_APP_I18N_FALLBACK_LOCALE || 'en',
  messages: loadLocaleMessages()
}));

/***/ }),

/***/ "a625":
/***/ (function(module) {

module.exports = JSON.parse("{\"import_running\":\"Er wordt geïmporteerd, even geduld!\",\"all_fields_optional\":\"Alle velden zijn optioneel en kunnen leeg gelaten worden.\",\"convert_internal\":\"Zet om naar intern recept\",\"Log_Recipe_Cooking\":\"Log Bereiding\",\"External_Recipe_Image\":\"Externe Afbeelding Recept\",\"Add_to_Book\":\"Voeg toe aan Boek\",\"Add_to_Shopping\":\"Voeg toe aan Boodschappenlijst\",\"Add_to_Plan\":\"Voeg toe aan Plan\",\"Step_start_time\":\"Starttijd stap\",\"Select_Book\":\"Selecteer Boek\",\"Recipe_Image\":\"Afbeelding Recept\",\"Import_finished\":\"Importeren gereed\",\"View_Recipes\":\"Bekijk Recepten\",\"Log_Cooking\":\"Log Bereiding\",\"Proteins\":\"Eiwitten\",\"Fats\":\"Vetten\",\"Carbohydrates\":\"Koolhydraten\",\"Calories\":\"Calorieën\",\"Nutrition\":\"Voedingswaarde\",\"Date\":\"Datum\",\"Share\":\"Deel\",\"Export\":\"Exporteren\",\"Rating\":\"Beoordeling\",\"Close\":\"Sluiten\",\"Add\":\"Voeg toe\",\"Ingredients\":\"Ingrediënten\",\"min\":\"min\",\"Servings\":\"Porties\",\"Waiting\":\"Wachten\",\"Preparation\":\"Bereiding\",\"Edit\":\"Bewerken\",\"Open\":\"Open\",\"Save\":\"Opslaan\",\"Step\":\"Stap\",\"Search\":\"Zoeken\",\"Import\":\"Importeer\",\"Print\":\"Afdrukken\",\"Information\":\"Informatie\",\"Keywords\":\"Etiketten\",\"Books\":\"Boeken\",\"show_only_internal\":\"Toon alleen interne recepten\",\"New_Recipe\":\"Nieuw Recept\",\"Url_Import\":\"Importeer URL\",\"Reset_Search\":\"Zoeken resetten\",\"or\":\"of\",\"and\":\"en\",\"Recently_Viewed\":\"Recent bekeken\",\"External\":\"Externe\",\"Settings\":\"Instellingen\",\"Meal_Plan\":\"Maaltijdplan\",\"New\":\"Nieuw\",\"Supermarket\":\"Supermarkt\",\"Categories\":\"Categorieën\",\"Category\":\"Categorie\",\"Selected\":\"Geselecteerd\",\"Copy\":\"Kopie\",\"Link\":\"Link\",\"Sort_by_new\":\"Sorteer op nieuw\",\"Recipes_per_page\":\"Recepten per pagina\",\"Files\":\"Bestanden\",\"Size\":\"Grootte\",\"File\":\"Bestand\",\"err_fetching_resource\":\"Bij het ophalen van een hulpbron is een foutmelding opgetreden!\",\"err_creating_resource\":\"Bij het maken van een hulpbron is een foutmelding opgetreden!\",\"err_updating_resource\":\"Bij het updaten van een hulpbron is een foutmelding opgetreden!\",\"success_fetching_resource\":\"Hulpbron is succesvol opgehaald!\",\"success_creating_resource\":\"Hulpbron succesvol aangemaakt!\",\"success_updating_resource\":\"Hulpbron succesvol geüpdatet!\",\"Success\":\"Succes\",\"Download\":\"Download\",\"err_deleting_resource\":\"Bij het verwijderen van een hulpbron is een foutmelding opgetreden!\",\"success_deleting_resource\":\"Hulpbron succesvol verwijderd!\",\"Cancel\":\"Annuleer\",\"Delete\":\"Verwijder\",\"Ok\":\"Open\",\"Load_More\":\"Laad meer\"}");

/***/ }),

/***/ "ca5b":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"3096e903-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/RecipeRating.vue?vue&type=template&id=7151a4e2&scoped=true&
var render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[(_vm.recipe.rating > 0)?_c('span',{staticClass:"d-inline"},[_vm._l((Math.floor(_vm.recipe.rating)),function(i){return _c('i',{key:i,staticClass:"fas fa-star fa-xs text-primary"})}),(_vm.recipe.rating % 1 > 0)?_c('i',{staticClass:"fas fa-star-half-alt fa-xs text-primary"}):_vm._e(),_vm._l(((5 - Math.ceil(_vm.recipe.rating))),function(i){return _c('i',{key:i + 10,staticClass:"far fa-star fa-xs text-secondary"})})],2):_vm._e()])}
var staticRenderFns = []


// CONCATENATED MODULE: ./src/components/RecipeRating.vue?vue&type=template&id=7151a4e2&scoped=true&

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/RecipeRating.vue?vue&type=script&lang=js&
//
//
//
//
//
//
//
//
//
//
//
//
//
/* harmony default export */ var RecipeRatingvue_type_script_lang_js_ = ({
  name: "RecipeRating",
  props: {
    recipe: Object
  }
});
// CONCATENATED MODULE: ./src/components/RecipeRating.vue?vue&type=script&lang=js&
 /* harmony default export */ var components_RecipeRatingvue_type_script_lang_js_ = (RecipeRatingvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-loader/lib/runtime/componentNormalizer.js
var componentNormalizer = __webpack_require__("2877");

// CONCATENATED MODULE: ./src/components/RecipeRating.vue





/* normalize component */

var component = Object(componentNormalizer["a" /* default */])(
  components_RecipeRatingvue_type_script_lang_js_,
  render,
  staticRenderFns,
  false,
  null,
  "7151a4e2",
  null
  
)

/* harmony default export */ var RecipeRating = __webpack_exports__["a"] = (component.exports);

/***/ }),

/***/ "d46a":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"3096e903-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/AddRecipeToBook.vue?vue&type=template&id=38f6fe5e&
var render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[_c('b-modal',{staticClass:"modal",attrs:{"id":("id_modal_add_book_" + _vm.modal_id),"title":_vm.$t('Add_to_Book'),"ok-title":_vm.$t('Add'),"cancel-title":_vm.$t('Close')},on:{"ok":function($event){return _vm.addToBook()}}},[_c('multiselect',{attrs:{"options":_vm.books,"preserve-search":true,"placeholder":_vm.$t('Select_Book'),"label":"name","track-by":"id","id":"id_books","multiple":false},on:{"search-change":_vm.loadBook},model:{value:(_vm.selected_book),callback:function ($$v) {_vm.selected_book=$$v},expression:"selected_book"}})],1)],1)}
var staticRenderFns = []


// CONCATENATED MODULE: ./src/components/AddRecipeToBook.vue?vue&type=template&id=38f6fe5e&

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.number.constructor.js
var es_number_constructor = __webpack_require__("a9e3");

// EXTERNAL MODULE: ./node_modules/vue-multiselect/dist/vue-multiselect.min.js
var vue_multiselect_min = __webpack_require__("8e5f");
var vue_multiselect_min_default = /*#__PURE__*/__webpack_require__.n(vue_multiselect_min);

// EXTERNAL MODULE: ./node_modules/moment/moment.js
var moment = __webpack_require__("c1df");
var moment_default = /*#__PURE__*/__webpack_require__.n(moment);

// EXTERNAL MODULE: ./node_modules/vue/dist/vue.esm.js
var vue_esm = __webpack_require__("a026");

// EXTERNAL MODULE: ./node_modules/bootstrap-vue/esm/index.js + 253 modules
var esm = __webpack_require__("5f5b");

// EXTERNAL MODULE: ./src/utils/api.js
var api = __webpack_require__("7c15");

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/AddRecipeToBook.vue?vue&type=script&lang=js&

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


vue_esm["default"].prototype.moment = moment_default.a;



vue_esm["default"].use(esm["a" /* BootstrapVue */]);
/* harmony default export */ var AddRecipeToBookvue_type_script_lang_js_ = ({
  name: 'AddRecipeToBook',
  components: {
    Multiselect: vue_multiselect_min_default.a
  },
  props: {
    recipe: Object,
    modal_id: Number
  },
  data: function data() {
    return {
      books: [],
      selected_book: null
    };
  },
  mounted: function mounted() {
    this.loadBook('');
  },
  methods: {
    loadBook: function loadBook(query) {
      var _this = this;

      Object(api["b" /* apiLoadCookBooks */])(query).then(function (results) {
        _this.books = results;
      });
    },
    addToBook: function addToBook() {
      Object(api["a" /* apiAddRecipeBookEntry */])({
        'recipe': this.recipe.id,
        'book': this.selected_book.id
      });
    }
  }
});
// CONCATENATED MODULE: ./src/components/AddRecipeToBook.vue?vue&type=script&lang=js&
 /* harmony default export */ var components_AddRecipeToBookvue_type_script_lang_js_ = (AddRecipeToBookvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-multiselect/dist/vue-multiselect.min.css?vue&type=style&index=0&lang=css&
var vue_multiselect_minvue_type_style_index_0_lang_css_ = __webpack_require__("60bc");

// EXTERNAL MODULE: ./node_modules/vue-loader/lib/runtime/componentNormalizer.js
var componentNormalizer = __webpack_require__("2877");

// CONCATENATED MODULE: ./src/components/AddRecipeToBook.vue






/* normalize component */

var component = Object(componentNormalizer["a" /* default */])(
  components_AddRecipeToBookvue_type_script_lang_js_,
  render,
  staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ var AddRecipeToBook = __webpack_exports__["a"] = (component.exports);

/***/ }),

/***/ "d76c":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"3096e903-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/LoadingSpinner.vue?vue&type=template&id=40f263dc&
var render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"row"},[_c('div',{staticClass:"col",staticStyle:{"text-align":"center"}},[_c('img',{staticClass:"spinner-tandoor",style:({ height: _vm.size + 'vh' }),attrs:{"alt":"loading spinner","src":""}})])])}
var staticRenderFns = []


// CONCATENATED MODULE: ./src/components/LoadingSpinner.vue?vue&type=template&id=40f263dc&

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.number.constructor.js
var es_number_constructor = __webpack_require__("a9e3");

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/LoadingSpinner.vue?vue&type=script&lang=js&

//
//
//
//
//
//
//
//
/* harmony default export */ var LoadingSpinnervue_type_script_lang_js_ = ({
  name: 'LoadingSpinner',
  props: {
    recipe: Object,
    size: {
      type: Number,
      default: 30
    }
  }
});
// CONCATENATED MODULE: ./src/components/LoadingSpinner.vue?vue&type=script&lang=js&
 /* harmony default export */ var components_LoadingSpinnervue_type_script_lang_js_ = (LoadingSpinnervue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-loader/lib/runtime/componentNormalizer.js
var componentNormalizer = __webpack_require__("2877");

// CONCATENATED MODULE: ./src/components/LoadingSpinner.vue





/* normalize component */

var component = Object(componentNormalizer["a" /* default */])(
  components_LoadingSpinnervue_type_script_lang_js_,
  render,
  staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ var LoadingSpinner = __webpack_exports__["a"] = (component.exports);

/***/ }),

/***/ "dfc6":
/***/ (function(module) {

module.exports = JSON.parse("{\"err_fetching_resource\":\"\",\"err_creating_resource\":\"\",\"err_updating_resource\":\"\",\"err_deleting_resource\":\"\",\"success_fetching_resource\":\"\",\"success_creating_resource\":\"\",\"success_updating_resource\":\"\",\"success_deleting_resource\":\"\",\"import_running\":\"\",\"all_fields_optional\":\"\",\"convert_internal\":\"\",\"show_only_internal\":\"\",\"Log_Recipe_Cooking\":\"\",\"External_Recipe_Image\":\"\",\"Add_to_Book\":\"\",\"Add_to_Shopping\":\"\",\"Add_to_Plan\":\"\",\"Step_start_time\":\"\",\"Meal_Plan\":\"\",\"Select_Book\":\"\",\"Recipe_Image\":\"\",\"Import_finished\":\"\",\"View_Recipes\":\"\",\"Log_Cooking\":\"\",\"New_Recipe\":\"\",\"Url_Import\":\"\",\"Reset_Search\":\"\",\"Recently_Viewed\":\"\",\"Load_More\":\"\",\"Keywords\":\"\",\"Books\":\"\",\"Proteins\":\"\",\"Fats\":\"\",\"Carbohydrates\":\"\",\"Calories\":\"\",\"Nutrition\":\"\",\"Date\":\"\",\"Share\":\"\",\"Export\":\"\",\"Copy\":\"\",\"Rating\":\"\",\"Close\":\"\",\"Link\":\"\",\"Add\":\"\",\"New\":\"\",\"Success\":\"\",\"Ingredients\":\"\",\"Supermarket\":\"\",\"Categories\":\"\",\"Category\":\"\",\"Selected\":\"\",\"min\":\"\",\"Servings\":\"\",\"Waiting\":\"\",\"Preparation\":\"\",\"External\":\"\",\"Size\":\"\",\"Files\":\"\",\"File\":\"\",\"Edit\":\"\",\"Cancel\":\"\",\"Delete\":\"\",\"Open\":\"\",\"Ok\":\"\",\"Save\":\"\",\"Step\":\"\",\"Search\":\"\",\"Import\":\"\",\"Print\":\"\",\"Settings\":\"\",\"or\":\"\",\"and\":\"\",\"Information\":\"\",\"Download\":\"\"}");

/***/ }),

/***/ "edd4":
/***/ (function(module) {

module.exports = JSON.parse("{\"err_fetching_resource\":\"There was an error fetching a resource!\",\"err_creating_resource\":\"There was an error creating a resource!\",\"err_updating_resource\":\"There was an error updating a resource!\",\"err_deleting_resource\":\"There was an error deleting a resource!\",\"success_fetching_resource\":\"Successfully fetched a resource!\",\"success_creating_resource\":\"Successfully created a resource!\",\"success_updating_resource\":\"Successfully updated a resource!\",\"success_deleting_resource\":\"Successfully deleted a resource!\",\"import_running\":\"Import running, please wait!\",\"all_fields_optional\":\"All fields are optional and can be left empty.\",\"convert_internal\":\"Convert to internal recipe\",\"show_only_internal\":\"Show only internal recipes\",\"show_split_screen\":\"Show split view\",\"Log_Recipe_Cooking\":\"Log Recipe Cooking\",\"External_Recipe_Image\":\"External Recipe Image\",\"Add_to_Book\":\"Add to Book\",\"Add_to_Shopping\":\"Add to Shopping\",\"Add_to_Plan\":\"Add to Plan\",\"Step_start_time\":\"Step start time\",\"Sort_by_new\":\"Sort by new\",\"Recipes_per_page\":\"Recipes per Page\",\"Meal_Plan\":\"Meal Plan\",\"Select_Book\":\"Select Book\",\"Recipe_Image\":\"Recipe Image\",\"Import_finished\":\"Import finished\",\"View_Recipes\":\"View Recipes\",\"Log_Cooking\":\"Log Cooking\",\"New_Recipe\":\"New Recipe\",\"Url_Import\":\"Url Import\",\"Reset_Search\":\"Reset Search\",\"Recently_Viewed\":\"Recently Viewed\",\"Load_More\":\"Load More\",\"New_Keyword\":\"New Keyword\",\"Delete_Keyword\":\"Delete Keyword\",\"Edit_Keyword\":\"Edit Keyword\",\"Move_Keyword\":\"Move Keyword\",\"Merge_Keyword\":\"Merge Keyword\",\"Hide_Keywords\":\"Hide Keywords\",\"Hide_Recipes\":\"Hide Recipes\",\"Keywords\":\"Keywords\",\"Books\":\"Books\",\"Proteins\":\"Proteins\",\"Fats\":\"Fats\",\"Carbohydrates\":\"Carbohydrates\",\"Calories\":\"Calories\",\"Nutrition\":\"Nutrition\",\"Date\":\"Date\",\"Share\":\"Share\",\"Export\":\"Export\",\"Copy\":\"Copy\",\"Rating\":\"Rating\",\"Close\":\"Close\",\"Cancel\":\"Cancel\",\"Link\":\"Link\",\"Add\":\"Add\",\"New\":\"New\",\"Success\":\"Success\",\"Ingredients\":\"Ingredients\",\"Supermarket\":\"Supermarket\",\"Categories\":\"Categories\",\"Category\":\"Category\",\"Selected\":\"Selected\",\"min\":\"min\",\"Servings\":\"Servings\",\"Waiting\":\"Waiting\",\"Preparation\":\"Preparation\",\"External\":\"External\",\"Size\":\"Size\",\"Files\":\"Files\",\"File\":\"File\",\"Edit\":\"Edit\",\"Delete\":\"Delete\",\"Open\":\"Open\",\"Ok\":\"Open\",\"Save\":\"Save\",\"Step\":\"Step\",\"Search\":\"Search\",\"Import\":\"Import\",\"Print\":\"Print\",\"Settings\":\"Settings\",\"or\":\"or\",\"and\":\"and\",\"Information\":\"Information\",\"Advanced Search Settings\":\"Advanced Search Settings\",\"View\":\"View\",\"Recipes\":\"Recipes\",\"Move\":\"Move\",\"Merge\":\"Merge\",\"Parent\":\"Parent\",\"delete_confimation\":\"Are you sure that you want to delete {kw} and all of it's children?\",\"move_confirmation\":\"Move {child} to parent {parent}\",\"merge_confirmation\":\"Replace {source} with {target}\",\"move_selection\":\"Select a parent to move {child} to.\",\"merge_selection\":\"Replace all occurences of {source} with the selected {type}.\",\"Download\":\"Download\",\"Root\":\"Root\",\"Ignore_Shopping\":\"Ignore Shopping\",\"Shopping_Category\":\"Shopping Category\",\"Edit_Food\":\"Edit Food\",\"Move_Food\":\"Move Food\",\"New_Food\":\"New Food\"}");

/***/ }),

/***/ "fa7d":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

// EXPORTS
__webpack_require__.d(__webpack_exports__, "c", function() { return /* binding */ ToastMixin; });
__webpack_require__.d(__webpack_exports__, "f", function() { return /* binding */ _makeToast; });
__webpack_require__.d(__webpack_exports__, "a", function() { return /* binding */ GettextMixin; });
__webpack_require__.d(__webpack_exports__, "e", function() { return /* binding */ djangoGettext; });
__webpack_require__.d(__webpack_exports__, "b", function() { return /* binding */ ResolveUrlMixin; });
__webpack_require__.d(__webpack_exports__, "g", function() { return /* binding */ _resolveDjangoUrl; });
__webpack_require__.d(__webpack_exports__, "d", function() { return /* binding */ calculateAmount; });

// UNUSED EXPORTS: getUserPreference, roundDecimals

// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/esm/typeof.js
var esm_typeof = __webpack_require__("53ca");

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.array.concat.js
var es_array_concat = __webpack_require__("99af");

// EXTERNAL MODULE: ./node_modules/bootstrap-vue/esm/components/toast/toast.js
var toast = __webpack_require__("59e4");

// CONCATENATED MODULE: ./src/utils/fractions.js
/* frac.js (C) 2012-present SheetJS -- http://sheetjs.com */

/*https://developer.aliyun.com/mirror/npm/package/frac/v/0.3.0 Apache license*/
function frac(x, D, mixed) {
  var n1 = Math.floor(x),
      d1 = 1;
  var n2 = n1 + 1,
      d2 = 1;
  if (x !== n1) while (d1 <= D && d2 <= D) {
    var m = (n1 + n2) / (d1 + d2);

    if (x === m) {
      if (d1 + d2 <= D) {
        d1 += d2;
        n1 += n2;
        d2 = D + 1;
      } else if (d1 > d2) d2 = D + 1;else d1 = D + 1;

      break;
    } else if (x < m) {
      n2 = n1 + n2;
      d2 = d1 + d2;
    } else {
      n1 = n1 + n2;
      d1 = d1 + d2;
    }
  }

  if (d1 > D) {
    d1 = d2;
    n1 = n2;
  }

  if (!mixed) return [0, n1, d1];
  var q = Math.floor(n1 / d1);
  return [q, n1 - q * d1, d1];
}
function cont(x, D, mixed) {
  var sgn = x < 0 ? -1 : 1;
  var B = x * sgn;
  var P_2 = 0,
      P_1 = 1,
      P = 0;
  var Q_2 = 1,
      Q_1 = 0,
      Q = 0;
  var A = Math.floor(B);

  while (Q_1 < D) {
    A = Math.floor(B);
    P = A * P_1 + P_2;
    Q = A * Q_1 + Q_2;
    if (B - A < 0.00000005) break;
    B = 1 / (B - A);
    P_2 = P_1;
    P_1 = P;
    Q_2 = Q_1;
    Q_1 = Q;
  }

  if (Q > D) {
    if (Q_1 > D) {
      Q = Q_2;
      P = P_2;
    } else {
      Q = Q_1;
      P = P_1;
    }
  }

  if (!mixed) return [0, sgn * P, Q];
  var q = Math.floor(sgn * P / Q);
  return [q, sgn * P - q * Q, Q];
}
// CONCATENATED MODULE: ./src/utils/utils.js



/*
* Utility functions to call bootstrap toasts
* */

var ToastMixin = {
  methods: {
    makeToast: function makeToast(title, message) {
      var variant = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      return _makeToast(title, message, variant);
    }
  }
};

function _makeToast(title, message) {
  var variant = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var toaster = new toast["a" /* BToast */]();
  toaster.$bvToast.toast(message, {
    title: title,
    variant: variant,
    toaster: 'b-toaster-top-center',
    solid: true
  });
}
/*
* Utility functions to use djangos gettext
* */



var GettextMixin = {
  methods: {
    /**
     * uses djangos javascript gettext implementation to localize text
     * @param {string} param string to translate
     */
    _: function _(param) {
      return djangoGettext(param);
    }
  }
};
function djangoGettext(param) {
  return window.gettext(param);
}
/*
* Utility function to use djangos named urls
* */
// uses https://github.com/ierror/django-js-reverse#use-the-urls-in-javascript

var ResolveUrlMixin = {
  methods: {
    /**
     * Returns path of a django named URL
     * @param {string} url name of url
     * @param {*} params tuple of params to pass to django named url
     */
    resolveDjangoUrl: function resolveDjangoUrl(url) {
      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      return _resolveDjangoUrl(url, params);
    }
  }
};

function _resolveDjangoUrl(url) {
  var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

  if (params == null) {
    return window.Urls[url]();
  } else if (Object(esm_typeof["a" /* default */])(params) != "object") {
    return window.Urls[url](params);
  } else if (Object(esm_typeof["a" /* default */])(params) == "object") {
    if (params.length === 1) {
      return window.Urls[url](params);
    } else if (params.length === 2) {
      return window.Urls[url](params[0], params[1]);
    } else if (params.length === 3) {
      return window.Urls[url](params[0], params[1], params[2]);
    }
  }
}
/*
* other utilities
* */



function getUserPreference(pref) {
  return window.USER_PREF[pref];
}

function calculateAmount(amount, factor) {
  if (getUserPreference('use_fractions')) {
    var return_string = '';
    var fraction = frac(amount * factor, 9, true);

    if (fraction[0] > 0) {
      return_string += fraction[0];
    }

    if (fraction[1] > 0) {
      return_string += " <sup>".concat(fraction[1], "</sup>&frasl;<sub>").concat(fraction[2], "</sub>");
    }

    return return_string;
  } else {
    return roundDecimals(amount * factor);
  }
}
function roundDecimals(num) {
  var decimals = getUserPreference('user_fractions') ? getUserPreference('user_fractions') : 2;
  return +(Math.round(num + "e+".concat(decimals)) + "e-".concat(decimals));
}

/***/ }),

/***/ "fc0d":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"3096e903-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/RecipeContextMenu.vue?vue&type=template&id=47e79185&
var render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[_c('div',{staticClass:"dropdown d-print-none"},[_vm._m(0),_c('div',{staticClass:"dropdown-menu dropdown-menu-right",attrs:{"aria-labelledby":"dropdownMenuLink"}},[_c('a',{staticClass:"dropdown-item",attrs:{"href":_vm.resolveDjangoUrl('edit_recipe', _vm.recipe.id)}},[_c('i',{staticClass:"fas fa-pencil-alt fa-fw"}),_vm._v(" "+_vm._s(_vm.$t('Edit')))]),(!_vm.recipe.internal)?_c('a',{staticClass:"dropdown-item",attrs:{"href":_vm.resolveDjangoUrl('edit_convert_recipe', _vm.recipe.id)}},[_c('i',{staticClass:"fas fa-exchange-alt fa-fw"}),_vm._v(" "+_vm._s(_vm.$t('convert_internal')))]):_vm._e(),_c('a',{attrs:{"href":"#"}},[_c('button',{staticClass:"dropdown-item",on:{"click":function($event){return _vm.$bvModal.show(("id_modal_add_book_" + _vm.modal_id))}}},[_c('i',{staticClass:"fas fa-bookmark fa-fw"}),_vm._v(" "+_vm._s(_vm.$t('Add_to_Book'))+" ")])]),(_vm.recipe.internal)?_c('a',{staticClass:"dropdown-item",attrs:{"href":((_vm.resolveDjangoUrl('view_shopping')) + "?r=[" + (_vm.recipe.id) + "," + _vm.servings_value + "]"),"target":"_blank","rel":"noopener noreferrer"}},[_c('i',{staticClass:"fas fa-shopping-cart fa-fw"}),_vm._v(" "+_vm._s(_vm.$t('Add_to_Shopping'))+" ")]):_vm._e(),_c('a',{staticClass:"dropdown-item",attrs:{"href":((_vm.resolveDjangoUrl('new_meal_plan')) + "?recipe=" + (_vm.recipe.id)),"target":"_blank","rel":"noopener noreferrer"}},[_c('i',{staticClass:"fas fa-calendar fa-fw"}),_vm._v(" "+_vm._s(_vm.$t('Add_to_Plan'))+" ")]),_c('a',{attrs:{"href":"#"}},[_c('button',{staticClass:"dropdown-item",on:{"click":function($event){return _vm.$bvModal.show(("id_modal_cook_log_" + _vm.modal_id))}}},[_c('i',{staticClass:"fas fa-clipboard-list fa-fw"}),_vm._v(" "+_vm._s(_vm.$t('Log_Cooking'))+" ")])]),_c('a',{attrs:{"href":"#"}},[_c('button',{staticClass:"dropdown-item",attrs:{"onclick":"window.print()"}},[_c('i',{staticClass:"fas fa-print fa-fw"}),_vm._v(" "+_vm._s(_vm.$t('Print'))+" ")])]),_c('a',{staticClass:"dropdown-item",attrs:{"href":_vm.resolveDjangoUrl('view_export') + '?r=' + _vm.recipe.id,"target":"_blank","rel":"noopener noreferrer"}},[_c('i',{staticClass:"fas fa-file-export fa-fw"}),_vm._v(" "+_vm._s(_vm.$t('Export')))]),_c('a',{attrs:{"href":"#"}},[(_vm.recipe.internal)?_c('button',{staticClass:"dropdown-item",on:{"click":function($event){return _vm.createShareLink()}}},[_c('i',{staticClass:"fas fa-share-alt fa-fw"}),_vm._v(" "+_vm._s(_vm.$t('Share'))+" ")]):_vm._e()])])]),_c('cook-log',{attrs:{"recipe":_vm.recipe,"modal_id":_vm.modal_id}}),_c('add-recipe-to-book',{attrs:{"recipe":_vm.recipe,"modal_id":_vm.modal_id}}),_c('b-modal',{attrs:{"id":("modal-share-link_" + _vm.modal_id),"title":_vm.$t('Share'),"hide-footer":""}},[_c('div',{staticClass:"row"},[_c('div',{staticClass:"col col-md-12"},[(_vm.recipe_share_link !== undefined)?_c('label',[_vm._v(_vm._s(_vm.$t('Public share link')))]):_vm._e(),_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.recipe_share_link),expression:"recipe_share_link"}],ref:"share_link_ref",staticClass:"form-control",domProps:{"value":(_vm.recipe_share_link)},on:{"input":function($event){if($event.target.composing){ return; }_vm.recipe_share_link=$event.target.value}}}),_c('b-button',{staticClass:"mt-2 mb-3 d-none d-md-inline",attrs:{"variant":"secondary"},on:{"click":function($event){return _vm.$bvModal.hide(("modal-share-link_" + _vm.modal_id))}}},[_vm._v(_vm._s(_vm.$t('Close'))+" ")]),_c('b-button',{staticClass:"mt-2 mb-3 ml-md-2",attrs:{"variant":"primary"},on:{"click":function($event){return _vm.copyShareLink()}}},[_vm._v(_vm._s(_vm.$t('Copy')))]),_c('b-button',{staticClass:"mt-2 mb-3 ml-2 float-right",attrs:{"variant":"success"},on:{"click":function($event){return _vm.shareIntend()}}},[_vm._v(_vm._s(_vm.$t('Share'))+" "),_c('i',{staticClass:"fa fa-share-alt"})])],1)])])],1)}
var staticRenderFns = [function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('a',{staticClass:"btn shadow-none",attrs:{"href":"#","role":"button","id":"dropdownMenuLink","data-toggle":"dropdown","aria-haspopup":"true","aria-expanded":"false"}},[_c('i',{staticClass:"fas fa-ellipsis-v fa-lg"})])}]


// CONCATENATED MODULE: ./src/components/RecipeContextMenu.vue?vue&type=template&id=47e79185&

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.number.constructor.js
var es_number_constructor = __webpack_require__("a9e3");

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.string.link.js
var es_string_link = __webpack_require__("9911");

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.function.name.js
var es_function_name = __webpack_require__("b0c0");

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.array.concat.js
var es_array_concat = __webpack_require__("99af");

// EXTERNAL MODULE: ./src/utils/utils.js + 1 modules
var utils = __webpack_require__("fa7d");

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"3096e903-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/CookLog.vue?vue&type=template&id=dc0abf2e&
var CookLogvue_type_template_id_dc0abf2e_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[_c('b-modal',{staticClass:"modal",attrs:{"id":("id_modal_cook_log_" + _vm.modal_id),"title":_vm.$t('Log_Recipe_Cooking'),"ok-title":_vm.$t('Save'),"cancel-title":_vm.$t('Close')},on:{"ok":function($event){return _vm.logCook()}}},[_c('p',[_vm._v(_vm._s(_vm.$t('all_fields_optional')))]),_c('form',[_c('label',{attrs:{"for":"id_log_servings"}},[_vm._v(_vm._s(_vm.$t('Servings')))]),_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.logObject.servings),expression:"logObject.servings"}],staticClass:"form-control",attrs:{"type":"number","id":"id_log_servings"},domProps:{"value":(_vm.logObject.servings)},on:{"input":function($event){if($event.target.composing){ return; }_vm.$set(_vm.logObject, "servings", $event.target.value)}}}),_c('label',{staticStyle:{"margin-top":"2vh"}},[_vm._v(_vm._s(_vm.$t('Rating'))+" - "),_c('span',{attrs:{"id":"id_rating_show"}},[_vm._v(_vm._s(_vm.logObject.rating)+"/5")])]),_c('b-form-rating',{model:{value:(_vm.logObject.rating),callback:function ($$v) {_vm.$set(_vm.logObject, "rating", $$v)},expression:"logObject.rating"}}),_c('label',{staticStyle:{"margin-top":"2vh"},attrs:{"for":"id_date"}},[_vm._v(_vm._s(_vm.$t('Date')))]),_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.logObject.created_at),expression:"logObject.created_at"}],staticClass:"form-control",attrs:{"type":"datetime-local","id":"id_date"},domProps:{"value":(_vm.logObject.created_at)},on:{"input":function($event){if($event.target.composing){ return; }_vm.$set(_vm.logObject, "created_at", $event.target.value)}}})],1)])],1)}
var CookLogvue_type_template_id_dc0abf2e_staticRenderFns = []


// CONCATENATED MODULE: ./src/components/CookLog.vue?vue&type=template&id=dc0abf2e&

// EXTERNAL MODULE: ./node_modules/moment/moment.js
var moment = __webpack_require__("c1df");
var moment_default = /*#__PURE__*/__webpack_require__.n(moment);

// EXTERNAL MODULE: ./node_modules/vue/dist/vue.esm.js
var vue_esm = __webpack_require__("a026");

// EXTERNAL MODULE: ./node_modules/bootstrap-vue/esm/index.js + 253 modules
var esm = __webpack_require__("5f5b");

// EXTERNAL MODULE: ./src/utils/api.js
var api = __webpack_require__("7c15");

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/CookLog.vue?vue&type=script&lang=js&

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

vue_esm["default"].prototype.moment = moment_default.a;



vue_esm["default"].use(esm["a" /* BootstrapVue */]);
/* harmony default export */ var CookLogvue_type_script_lang_js_ = ({
  name: 'CookLog',
  props: {
    recipe: Object,
    modal_id: Number
  },
  data: function data() {
    return {
      logObject: {
        recipe: this.recipe.id,
        servings: 0,
        rating: 0,
        created_at: moment_default()().format('yyyy-MM-DDTHH:mm')
      }
    };
  },
  methods: {
    logCook: function logCook() {
      Object(api["d" /* apiLogCooking */])(this.logObject);
    }
  }
});
// CONCATENATED MODULE: ./src/components/CookLog.vue?vue&type=script&lang=js&
 /* harmony default export */ var components_CookLogvue_type_script_lang_js_ = (CookLogvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-loader/lib/runtime/componentNormalizer.js
var componentNormalizer = __webpack_require__("2877");

// CONCATENATED MODULE: ./src/components/CookLog.vue





/* normalize component */

var component = Object(componentNormalizer["a" /* default */])(
  components_CookLogvue_type_script_lang_js_,
  CookLogvue_type_template_id_dc0abf2e_render,
  CookLogvue_type_template_id_dc0abf2e_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ var CookLog = (component.exports);
// EXTERNAL MODULE: ./node_modules/axios/index.js
var axios = __webpack_require__("bc3a");
var axios_default = /*#__PURE__*/__webpack_require__.n(axios);

// EXTERNAL MODULE: ./src/components/AddRecipeToBook.vue + 4 modules
var AddRecipeToBook = __webpack_require__("d46a");

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/RecipeContextMenu.vue?vue&type=script&lang=js&




//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//




/* harmony default export */ var RecipeContextMenuvue_type_script_lang_js_ = ({
  name: 'RecipeContextMenu',
  mixins: [utils["b" /* ResolveUrlMixin */]],
  components: {
    AddRecipeToBook: AddRecipeToBook["a" /* default */],
    CookLog: CookLog
  },
  data: function data() {
    return {
      servings_value: 0,
      recipe_share_link: undefined,
      modal_id: this.recipe.id + Math.round(Math.random() * 100000)
    };
  },
  props: {
    recipe: Object,
    servings: {
      type: Number,
      default: -1
    }
  },
  mounted: function mounted() {
    this.servings_value = this.servings === -1 ? this.recipe.servings : this.servings;
  },
  methods: {
    createShareLink: function createShareLink() {
      var _this = this;

      axios_default.a.get(Object(utils["g" /* resolveDjangoUrl */])('api_share_link', this.recipe.id)).then(function (result) {
        _this.$bvModal.show("modal-share-link_".concat(_this.modal_id));

        _this.recipe_share_link = result.data.link;
      }).catch(function (err) {
        if (err.response.status === 403) {
          Object(utils["f" /* makeToast */])(_this.$t('Share'), _this.$t('Sharing is not enabled for this space.'), 'danger');
        }
      });
    },
    copyShareLink: function copyShareLink() {
      var share_input = this.$refs.share_link_ref;
      share_input.select();
      document.execCommand("copy");
    },
    shareIntend: function shareIntend() {
      var shareData = {
        title: this.recipe.name,
        text: "".concat(this.$t('Check out this recipe: '), " ").concat(this.recipe.name),
        url: this.recipe_share_link
      };
      navigator.share(shareData);
    }
  }
});
// CONCATENATED MODULE: ./src/components/RecipeContextMenu.vue?vue&type=script&lang=js&
 /* harmony default export */ var components_RecipeContextMenuvue_type_script_lang_js_ = (RecipeContextMenuvue_type_script_lang_js_); 
// CONCATENATED MODULE: ./src/components/RecipeContextMenu.vue





/* normalize component */

var RecipeContextMenu_component = Object(componentNormalizer["a" /* default */])(
  components_RecipeContextMenuvue_type_script_lang_js_,
  render,
  staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ var RecipeContextMenu = __webpack_exports__["a"] = (RecipeContextMenu_component.exports);

/***/ })

/******/ });