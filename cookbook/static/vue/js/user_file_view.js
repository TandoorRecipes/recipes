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
/******/ 		"user_file_view": 0
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
/******/ 	deferredModules.push([5,"chunk-vendors"]);
/******/ 	// run deferred modules when ready
/******/ 	return checkDeferredModules();
/******/ })
/************************************************************************/
/******/ ({

/***/ "2b2d":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

// EXPORTS
__webpack_require__.d(__webpack_exports__, "a", function() { return /* binding */ ApiApiFactory; });

// UNUSED EXPORTS: RecipeStepsTypeEnum, StepTypeEnum, StorageMethodEnum, UserPreferenceThemeEnum, UserPreferenceNavColorEnum, UserPreferenceDefaultPageEnum, UserPreferenceSearchStyleEnum, ApiApiAxiosParamCreator, ApiApiFp, ApiApi

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.object.to-string.js
var es_object_to_string = __webpack_require__("d3b7");

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.string.iterator.js
var es_string_iterator = __webpack_require__("3ca3");

// EXTERNAL MODULE: ./node_modules/core-js/modules/web.dom-collections.iterator.js
var web_dom_collections_iterator = __webpack_require__("ddb0");

// EXTERNAL MODULE: ./node_modules/core-js/modules/web.url.js
var web_url = __webpack_require__("2b3d");

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.regexp.exec.js
var es_regexp_exec = __webpack_require__("ac1f");

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.string.replace.js
var es_string_replace = __webpack_require__("5319");

// EXTERNAL MODULE: ./node_modules/tslib/tslib.es6.js
var tslib_es6 = __webpack_require__("9ab4");

// EXTERNAL MODULE: ./node_modules/axios/index.js
var node_modules_axios = __webpack_require__("bc3a");
var axios_default = /*#__PURE__*/__webpack_require__.n(node_modules_axios);

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.string.search.js
var es_string_search = __webpack_require__("841c");

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.regexp.to-string.js
var es_regexp_to_string = __webpack_require__("25f0");

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.function.name.js
var es_function_name = __webpack_require__("b0c0");

// CONCATENATED MODULE: ./src/utils/openapi/base.ts


/* tslint:disable */

/* eslint-disable */

/**
 * Django Recipes
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 0.0.0
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
 // Some imports not used depending on template conditions 
// @ts-ignore

 //export const BASE_PATH = location.protocol + '//' + location.host; //TODO manually edited. Find good solution to automate later, remove from openapi-generator-ignore afterwards

var base_BASE_PATH = typeof window !== 'undefined' ? localStorage.getItem('BASE_PATH') || '' : location.protocol + '//' + location.host;
/**
 *
 * @export
 */

var COLLECTION_FORMATS = {
  csv: ",",
  ssv: " ",
  tsv: "\t",
  pipes: "|"
};
/**
 *
 * @export
 * @class BaseAPI
 */

var base_BaseAPI =
/** @class */
function () {
  function BaseAPI(configuration, basePath, axios) {
    if (basePath === void 0) {
      basePath = base_BASE_PATH;
    }

    if (axios === void 0) {
      axios = axios_default.a;
    }

    this.basePath = basePath;
    this.axios = axios;

    if (configuration) {
      this.configuration = configuration;
      this.basePath = configuration.basePath || this.basePath;
    }
  }

  return BaseAPI;
}();


;
/**
 *
 * @export
 * @class RequiredError
 * @extends {Error}
 */

var base_RequiredError =
/** @class */
function (_super) {
  Object(tslib_es6["c" /* __extends */])(RequiredError, _super);

  function RequiredError(field, msg) {
    var _this = _super.call(this, msg) || this;

    _this.field = field;
    _this.name = "RequiredError";
    return _this;
  }

  return RequiredError;
}(Error);


// CONCATENATED MODULE: ./src/utils/openapi/common.ts








/* tslint:disable */

/* eslint-disable */

/**
 * Django Recipes
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 0.0.0
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


/**
 *
 * @export
 */

var DUMMY_BASE_URL = 'https://example.com';
/**
 *
 * @throws {RequiredError}
 * @export
 */

var common_assertParamExists = function assertParamExists(functionName, paramName, paramValue) {
  if (paramValue === null || paramValue === undefined) {
    throw new base_RequiredError(paramName, "Required parameter " + paramName + " was null or undefined when calling " + functionName + ".");
  }
};
/**
 *
 * @export
 */

var common_setApiKeyToObject = function setApiKeyToObject(object, keyParamName, configuration) {
  return Object(tslib_es6["b" /* __awaiter */])(this, void 0, void 0, function () {
    var localVarApiKeyValue, _a;

    return Object(tslib_es6["d" /* __generator */])(this, function (_b) {
      switch (_b.label) {
        case 0:
          if (!(configuration && configuration.apiKey)) return [3
          /*break*/
          , 5];
          if (!(typeof configuration.apiKey === 'function')) return [3
          /*break*/
          , 2];
          return [4
          /*yield*/
          , configuration.apiKey(keyParamName)];

        case 1:
          _a = _b.sent();
          return [3
          /*break*/
          , 4];

        case 2:
          return [4
          /*yield*/
          , configuration.apiKey];

        case 3:
          _a = _b.sent();
          _b.label = 4;

        case 4:
          localVarApiKeyValue = _a;
          object[keyParamName] = localVarApiKeyValue;
          _b.label = 5;

        case 5:
          return [2
          /*return*/
          ];
      }
    });
  });
};
/**
 *
 * @export
 */

var setBasicAuthToObject = function setBasicAuthToObject(object, configuration) {
  if (configuration && (configuration.username || configuration.password)) {
    object["auth"] = {
      username: configuration.username,
      password: configuration.password
    };
  }
};
/**
 *
 * @export
 */

var common_setBearerAuthToObject = function setBearerAuthToObject(object, configuration) {
  return Object(tslib_es6["b" /* __awaiter */])(this, void 0, void 0, function () {
    var accessToken, _a;

    return Object(tslib_es6["d" /* __generator */])(this, function (_b) {
      switch (_b.label) {
        case 0:
          if (!(configuration && configuration.accessToken)) return [3
          /*break*/
          , 5];
          if (!(typeof configuration.accessToken === 'function')) return [3
          /*break*/
          , 2];
          return [4
          /*yield*/
          , configuration.accessToken()];

        case 1:
          _a = _b.sent();
          return [3
          /*break*/
          , 4];

        case 2:
          return [4
          /*yield*/
          , configuration.accessToken];

        case 3:
          _a = _b.sent();
          _b.label = 4;

        case 4:
          accessToken = _a;
          object["Authorization"] = "Bearer " + accessToken;
          _b.label = 5;

        case 5:
          return [2
          /*return*/
          ];
      }
    });
  });
};
/**
 *
 * @export
 */

var common_setOAuthToObject = function setOAuthToObject(object, name, scopes, configuration) {
  return Object(tslib_es6["b" /* __awaiter */])(this, void 0, void 0, function () {
    var localVarAccessTokenValue, _a;

    return Object(tslib_es6["d" /* __generator */])(this, function (_b) {
      switch (_b.label) {
        case 0:
          if (!(configuration && configuration.accessToken)) return [3
          /*break*/
          , 5];
          if (!(typeof configuration.accessToken === 'function')) return [3
          /*break*/
          , 2];
          return [4
          /*yield*/
          , configuration.accessToken(name, scopes)];

        case 1:
          _a = _b.sent();
          return [3
          /*break*/
          , 4];

        case 2:
          return [4
          /*yield*/
          , configuration.accessToken];

        case 3:
          _a = _b.sent();
          _b.label = 4;

        case 4:
          localVarAccessTokenValue = _a;
          object["Authorization"] = "Bearer " + localVarAccessTokenValue;
          _b.label = 5;

        case 5:
          return [2
          /*return*/
          ];
      }
    });
  });
};
/**
 *
 * @export
 */

var setSearchParams = function setSearchParams(url) {
  var objects = [];

  for (var _i = 1; _i < arguments.length; _i++) {
    objects[_i - 1] = arguments[_i];
  }

  var searchParams = new URLSearchParams(url.search);

  for (var _a = 0, objects_1 = objects; _a < objects_1.length; _a++) {
    var object = objects_1[_a];

    for (var key in object) {
      if (Array.isArray(object[key])) {
        searchParams.delete(key);

        for (var _b = 0, _c = object[key]; _b < _c.length; _b++) {
          var item = _c[_b];
          searchParams.append(key, item);
        }
      } else {
        searchParams.set(key, object[key]);
      }
    }
  }

  url.search = searchParams.toString();
};
/**
 *
 * @export
 */

var serializeDataIfNeeded = function serializeDataIfNeeded(value, requestOptions, configuration) {
  var nonString = typeof value !== 'string';
  var needsSerialization = nonString && configuration && configuration.isJsonMime ? configuration.isJsonMime(requestOptions.headers['Content-Type']) : nonString;
  return needsSerialization ? JSON.stringify(value !== undefined ? value : {}) : value || "";
};
/**
 *
 * @export
 */

var toPathString = function toPathString(url) {
  return url.pathname + url.search + url.hash;
};
/**
 *
 * @export
 */

var common_createRequestFunction = function createRequestFunction(axiosArgs, globalAxios, BASE_PATH, configuration) {
  return function (axios, basePath) {
    if (axios === void 0) {
      axios = globalAxios;
    }

    if (basePath === void 0) {
      basePath = BASE_PATH;
    }

    var axiosRequestArgs = Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({}, axiosArgs.options), {
      url: ((configuration === null || configuration === void 0 ? void 0 : configuration.basePath) || basePath) + axiosArgs.url
    });

    return axios.request(axiosRequestArgs);
  };
};
// CONCATENATED MODULE: ./src/utils/openapi/api.ts
/* tslint:disable */ /* eslint-disable */ /**
 * Django Recipes
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 0.0.0
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */// Some imports not used depending on template conditions
// @ts-ignore
// @ts-ignore
/**
    * @export
    * @enum {string}
    */var RecipeStepsTypeEnum;(function(RecipeStepsTypeEnum){RecipeStepsTypeEnum["Text"]="TEXT";RecipeStepsTypeEnum["Time"]="TIME";RecipeStepsTypeEnum["File"]="FILE";RecipeStepsTypeEnum["Recipe"]="RECIPE";})(RecipeStepsTypeEnum||(RecipeStepsTypeEnum={}));/**
    * @export
    * @enum {string}
    */var StepTypeEnum;(function(StepTypeEnum){StepTypeEnum["Text"]="TEXT";StepTypeEnum["Time"]="TIME";StepTypeEnum["File"]="FILE";StepTypeEnum["Recipe"]="RECIPE";})(StepTypeEnum||(StepTypeEnum={}));/**
    * @export
    * @enum {string}
    */var StorageMethodEnum;(function(StorageMethodEnum){StorageMethodEnum["Db"]="DB";StorageMethodEnum["Nextcloud"]="NEXTCLOUD";StorageMethodEnum["Local"]="LOCAL";})(StorageMethodEnum||(StorageMethodEnum={}));/**
    * @export
    * @enum {string}
    */var UserPreferenceThemeEnum;(function(UserPreferenceThemeEnum){UserPreferenceThemeEnum["Tandoor"]="TANDOOR";UserPreferenceThemeEnum["Bootstrap"]="BOOTSTRAP";UserPreferenceThemeEnum["Darkly"]="DARKLY";UserPreferenceThemeEnum["Flatly"]="FLATLY";UserPreferenceThemeEnum["Superhero"]="SUPERHERO";})(UserPreferenceThemeEnum||(UserPreferenceThemeEnum={}));/**
    * @export
    * @enum {string}
    */var UserPreferenceNavColorEnum;(function(UserPreferenceNavColorEnum){UserPreferenceNavColorEnum["Primary"]="PRIMARY";UserPreferenceNavColorEnum["Secondary"]="SECONDARY";UserPreferenceNavColorEnum["Success"]="SUCCESS";UserPreferenceNavColorEnum["Info"]="INFO";UserPreferenceNavColorEnum["Warning"]="WARNING";UserPreferenceNavColorEnum["Danger"]="DANGER";UserPreferenceNavColorEnum["Light"]="LIGHT";UserPreferenceNavColorEnum["Dark"]="DARK";})(UserPreferenceNavColorEnum||(UserPreferenceNavColorEnum={}));/**
    * @export
    * @enum {string}
    */var UserPreferenceDefaultPageEnum;(function(UserPreferenceDefaultPageEnum){UserPreferenceDefaultPageEnum["Search"]="SEARCH";UserPreferenceDefaultPageEnum["Plan"]="PLAN";UserPreferenceDefaultPageEnum["Books"]="BOOKS";})(UserPreferenceDefaultPageEnum||(UserPreferenceDefaultPageEnum={}));/**
    * @export
    * @enum {string}
    */var UserPreferenceSearchStyleEnum;(function(UserPreferenceSearchStyleEnum){UserPreferenceSearchStyleEnum["Small"]="SMALL";UserPreferenceSearchStyleEnum["Large"]="LARGE";UserPreferenceSearchStyleEnum["New"]="NEW";})(UserPreferenceSearchStyleEnum||(UserPreferenceSearchStyleEnum={}));/**
 * ApiApi - axios parameter creator
 * @export
 */var api_ApiApiAxiosParamCreator=function ApiApiAxiosParamCreator(configuration){var _this=this;return{/**
         *
         * @param {BookmarkletImport} [bookmarkletImport]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createBookmarkletImport:function createBookmarkletImport(bookmarkletImport,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){localVarPath="/api/bookmarklet-import/";localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'POST'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(bookmarkletImport,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {CookLog} [cookLog]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createCookLog:function createCookLog(cookLog,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){localVarPath="/api/cook-log/";localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'POST'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(cookLog,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {Food} [food]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createFood:function createFood(food,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){localVarPath="/api/food/";localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'POST'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(food,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {ImportLog} [importLog]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createImportLog:function createImportLog(importLog,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){localVarPath="/api/import-log/";localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'POST'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(importLog,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {Ingredient} [ingredient]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createIngredient:function createIngredient(ingredient,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){localVarPath="/api/ingredient/";localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'POST'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(ingredient,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {Keyword} [keyword]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createKeyword:function createKeyword(keyword,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){localVarPath="/api/keyword/";localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'POST'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(keyword,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {MealPlan} [mealPlan]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createMealPlan:function createMealPlan(mealPlan,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){localVarPath="/api/meal-plan/";localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'POST'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(mealPlan,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         * returns list of meal types created by the requesting user ordered by the order field.
         * @param {MealType} [mealType]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createMealType:function createMealType(mealType,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){localVarPath="/api/meal-type/";localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'POST'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(mealType,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {Recipe} [recipe]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createRecipe:function createRecipe(recipe,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){localVarPath="/api/recipe/";localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'POST'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(recipe,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {RecipeBook} [recipeBook]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createRecipeBook:function createRecipeBook(recipeBook,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){localVarPath="/api/recipe-book/";localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'POST'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(recipeBook,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {RecipeBookEntry} [recipeBookEntry]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createRecipeBookEntry:function createRecipeBookEntry(recipeBookEntry,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){localVarPath="/api/recipe-book-entry/";localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'POST'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(recipeBookEntry,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {ShoppingList} [shoppingList]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createShoppingList:function createShoppingList(shoppingList,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){localVarPath="/api/shopping-list/";localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'POST'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(shoppingList,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {ShoppingListEntry} [shoppingListEntry]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createShoppingListEntry:function createShoppingListEntry(shoppingListEntry,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){localVarPath="/api/shopping-list-entry/";localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'POST'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(shoppingListEntry,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {ShoppingListRecipe} [shoppingListRecipe]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createShoppingListRecipe:function createShoppingListRecipe(shoppingListRecipe,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){localVarPath="/api/shopping-list-recipe/";localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'POST'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(shoppingListRecipe,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {Step} [step]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createStep:function createStep(step,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){localVarPath="/api/step/";localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'POST'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(step,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {Storage} [storage]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createStorage:function createStorage(storage,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){localVarPath="/api/storage/";localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'POST'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(storage,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {Supermarket} [supermarket]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createSupermarket:function createSupermarket(supermarket,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){localVarPath="/api/supermarket/";localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'POST'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(supermarket,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {SupermarketCategory} [supermarketCategory]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createSupermarketCategory:function createSupermarketCategory(supermarketCategory,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){localVarPath="/api/supermarket-category/";localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'POST'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(supermarketCategory,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {SupermarketCategoryRelation} [supermarketCategoryRelation]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createSupermarketCategoryRelation:function createSupermarketCategoryRelation(supermarketCategoryRelation,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){localVarPath="/api/supermarket-category-relation/";localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'POST'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(supermarketCategoryRelation,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {Sync} [sync]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createSync:function createSync(sync,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){localVarPath="/api/sync/";localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'POST'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(sync,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {Unit} [unit]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createUnit:function createUnit(unit,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){localVarPath="/api/unit/";localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'POST'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(unit,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} name
         * @param {any} [file]
         * @param {number} [fileSizeKb]
         * @param {number} [id]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createUserFile:function createUserFile(name,file,fileSizeKb,id,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,localVarFormParams,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'name' is not null or undefined
common_assertParamExists('createUserFile','name',name);localVarPath="/api/user-file/";localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'POST'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarFormParams=new(configuration&&configuration.formDataCtor||FormData)();if(name!==undefined){localVarFormParams.append('name',name);}if(file!==undefined){localVarFormParams.append('file',file);}if(fileSizeKb!==undefined){localVarFormParams.append('file_size_kb',fileSizeKb);}if(id!==undefined){localVarFormParams.append('id',id);}localVarHeaderParameter['Content-Type']='multipart/form-data';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=localVarFormParams;return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {UserPreference} [userPreference]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createUserPreference:function createUserPreference(userPreference,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){localVarPath="/api/user-preference/";localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'POST'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(userPreference,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {ViewLog} [viewLog]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createViewLog:function createViewLog(viewLog,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){localVarPath="/api/view-log/";localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'POST'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(viewLog,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this bookmarklet import.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyBookmarkletImport:function destroyBookmarkletImport(id,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('destroyBookmarkletImport','id',id);localVarPath="/api/bookmarklet-import/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'DELETE'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this cook log.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyCookLog:function destroyCookLog(id,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('destroyCookLog','id',id);localVarPath="/api/cook-log/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'DELETE'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this food.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyFood:function destroyFood(id,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('destroyFood','id',id);localVarPath="/api/food/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'DELETE'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this import log.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyImportLog:function destroyImportLog(id,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('destroyImportLog','id',id);localVarPath="/api/import-log/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'DELETE'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this ingredient.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyIngredient:function destroyIngredient(id,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('destroyIngredient','id',id);localVarPath="/api/ingredient/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'DELETE'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this keyword.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyKeyword:function destroyKeyword(id,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('destroyKeyword','id',id);localVarPath="/api/keyword/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'DELETE'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this meal plan.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyMealPlan:function destroyMealPlan(id,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('destroyMealPlan','id',id);localVarPath="/api/meal-plan/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'DELETE'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         * returns list of meal types created by the requesting user ordered by the order field.
         * @param {string} id A unique integer value identifying this meal type.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyMealType:function destroyMealType(id,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('destroyMealType','id',id);localVarPath="/api/meal-type/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'DELETE'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this recipe.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyRecipe:function destroyRecipe(id,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('destroyRecipe','id',id);localVarPath="/api/recipe/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'DELETE'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this recipe book.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyRecipeBook:function destroyRecipeBook(id,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('destroyRecipeBook','id',id);localVarPath="/api/recipe-book/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'DELETE'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this recipe book entry.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyRecipeBookEntry:function destroyRecipeBookEntry(id,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('destroyRecipeBookEntry','id',id);localVarPath="/api/recipe-book-entry/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'DELETE'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this shopping list.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyShoppingList:function destroyShoppingList(id,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('destroyShoppingList','id',id);localVarPath="/api/shopping-list/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'DELETE'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this shopping list entry.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyShoppingListEntry:function destroyShoppingListEntry(id,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('destroyShoppingListEntry','id',id);localVarPath="/api/shopping-list-entry/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'DELETE'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this shopping list recipe.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyShoppingListRecipe:function destroyShoppingListRecipe(id,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('destroyShoppingListRecipe','id',id);localVarPath="/api/shopping-list-recipe/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'DELETE'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this step.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyStep:function destroyStep(id,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('destroyStep','id',id);localVarPath="/api/step/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'DELETE'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this storage.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyStorage:function destroyStorage(id,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('destroyStorage','id',id);localVarPath="/api/storage/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'DELETE'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this supermarket.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroySupermarket:function destroySupermarket(id,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('destroySupermarket','id',id);localVarPath="/api/supermarket/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'DELETE'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this supermarket category.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroySupermarketCategory:function destroySupermarketCategory(id,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('destroySupermarketCategory','id',id);localVarPath="/api/supermarket-category/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'DELETE'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this supermarket category relation.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroySupermarketCategoryRelation:function destroySupermarketCategoryRelation(id,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('destroySupermarketCategoryRelation','id',id);localVarPath="/api/supermarket-category-relation/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'DELETE'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this sync.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroySync:function destroySync(id,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('destroySync','id',id);localVarPath="/api/sync/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'DELETE'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this unit.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyUnit:function destroyUnit(id,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('destroyUnit','id',id);localVarPath="/api/unit/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'DELETE'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this user file.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyUserFile:function destroyUserFile(id,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('destroyUserFile','id',id);localVarPath="/api/user-file/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'DELETE'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} user A unique value identifying this user preference.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyUserPreference:function destroyUserPreference(user,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'user' is not null or undefined
common_assertParamExists('destroyUserPreference','user',user);localVarPath="/api/user-preference/{user}/".replace("{"+"user"+"}",encodeURIComponent(String(user)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'DELETE'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this view log.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyViewLog:function destroyViewLog(id,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('destroyViewLog','id',id);localVarPath="/api/view-log/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'DELETE'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this recipe.
         * @param {any} [image]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */imageRecipe:function imageRecipe(id,image,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,localVarFormParams,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('imageRecipe','id',id);localVarPath="/api/recipe/{id}/image/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'PUT'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarFormParams=new(configuration&&configuration.formDataCtor||FormData)();if(image!==undefined){localVarFormParams.append('image',image);}localVarHeaderParameter['Content-Type']='multipart/form-data';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=localVarFormParams;return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listBookmarkletImports:function listBookmarkletImports(options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){localVarPath="/api/bookmarklet-import/";localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'GET'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listCookLogs:function listCookLogs(options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){localVarPath="/api/cook-log/";localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'GET'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} [query] Query string matched against food name.
         * @param {number} [root] Return first level children of food with ID [int].  Integer 0 will return root foods.
         * @param {number} [tree] Return all self and children of food with ID [int].
         * @param {number} [page] A page number within the paginated result set.
         * @param {number} [pageSize] Number of results to return per page.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listFoods:function listFoods(query,root,tree,page,pageSize,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){localVarPath="/api/food/";localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'GET'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};if(query!==undefined){localVarQueryParameter['query']=query;}if(root!==undefined){localVarQueryParameter['root']=root;}if(tree!==undefined){localVarQueryParameter['tree']=tree;}if(page!==undefined){localVarQueryParameter['page']=page;}if(pageSize!==undefined){localVarQueryParameter['page_size']=pageSize;}setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listImportLogs:function listImportLogs(options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){localVarPath="/api/import-log/";localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'GET'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listIngredients:function listIngredients(options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){localVarPath="/api/ingredient/";localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'GET'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} [query] Query string matched against keyword name.
         * @param {number} [root] Return first level children of keyword with ID [int].  Integer 0 will return root keywords.
         * @param {number} [tree] Return all self and children of keyword with ID [int].
         * @param {number} [page] A page number within the paginated result set.
         * @param {number} [pageSize] Number of results to return per page.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listKeywords:function listKeywords(query,root,tree,page,pageSize,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){localVarPath="/api/keyword/";localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'GET'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};if(query!==undefined){localVarQueryParameter['query']=query;}if(root!==undefined){localVarQueryParameter['root']=root;}if(tree!==undefined){localVarQueryParameter['tree']=tree;}if(page!==undefined){localVarQueryParameter['page']=page;}if(pageSize!==undefined){localVarQueryParameter['page_size']=pageSize;}setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         * optional parameters  - **from_date**: filter from (inclusive) a certain date onward - **to_date**: filter upward to (inclusive) certain date
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listMealPlans:function listMealPlans(options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){localVarPath="/api/meal-plan/";localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'GET'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         * returns list of meal types created by the requesting user ordered by the order field.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listMealTypes:function listMealTypes(options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){localVarPath="/api/meal-type/";localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'GET'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listRecipeBookEntrys:function listRecipeBookEntrys(options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){localVarPath="/api/recipe-book-entry/";localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'GET'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listRecipeBooks:function listRecipeBooks(options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){localVarPath="/api/recipe-book/";localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'GET'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} [query] Query string matched (fuzzy) against recipe name. In the future also fulltext search.
         * @param {string} [keywords] Id of keyword a recipe should have. For multiple repeat parameter.
         * @param {string} [foods] Id of food a recipe should have. For multiple repeat parameter.
         * @param {string} [books] Id of book a recipe should have. For multiple repeat parameter.
         * @param {string} [keywordsOr] If recipe should have all (AND) or any (OR) of the provided keywords.
         * @param {string} [foodsOr] If recipe should have all (AND) or any (OR) any of the provided foods.
         * @param {string} [booksOr] If recipe should be in all (AND) or any (OR) any of the provided books.
         * @param {string} [internal] true or false. If only internal recipes should be returned or not.
         * @param {string} [random] true or false. returns the results in randomized order.
         * @param {string} [_new] true or false. returns new results first in search results
         * @param {number} [page] A page number within the paginated result set.
         * @param {number} [pageSize] Number of results to return per page.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listRecipes:function listRecipes(query,keywords,foods,books,keywordsOr,foodsOr,booksOr,internal,random,_new,page,pageSize,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){localVarPath="/api/recipe/";localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'GET'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};if(query!==undefined){localVarQueryParameter['query']=query;}if(keywords!==undefined){localVarQueryParameter['keywords']=keywords;}if(foods!==undefined){localVarQueryParameter['foods']=foods;}if(books!==undefined){localVarQueryParameter['books']=books;}if(keywordsOr!==undefined){localVarQueryParameter['keywords_or']=keywordsOr;}if(foodsOr!==undefined){localVarQueryParameter['foods_or']=foodsOr;}if(booksOr!==undefined){localVarQueryParameter['books_or']=booksOr;}if(internal!==undefined){localVarQueryParameter['internal']=internal;}if(random!==undefined){localVarQueryParameter['random']=random;}if(_new!==undefined){localVarQueryParameter['new']=_new;}if(page!==undefined){localVarQueryParameter['page']=page;}if(pageSize!==undefined){localVarQueryParameter['page_size']=pageSize;}setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listShoppingListEntrys:function listShoppingListEntrys(options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){localVarPath="/api/shopping-list-entry/";localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'GET'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listShoppingListRecipes:function listShoppingListRecipes(options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){localVarPath="/api/shopping-list-recipe/";localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'GET'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listShoppingLists:function listShoppingLists(options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){localVarPath="/api/shopping-list/";localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'GET'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listSteps:function listSteps(options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){localVarPath="/api/step/";localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'GET'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listStorages:function listStorages(options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){localVarPath="/api/storage/";localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'GET'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {number} [page] A page number within the paginated result set.
         * @param {number} [pageSize] Number of results to return per page.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listSupermarketCategoryRelations:function listSupermarketCategoryRelations(page,pageSize,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){localVarPath="/api/supermarket-category-relation/";localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'GET'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};if(page!==undefined){localVarQueryParameter['page']=page;}if(pageSize!==undefined){localVarQueryParameter['page_size']=pageSize;}setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listSupermarketCategorys:function listSupermarketCategorys(options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){localVarPath="/api/supermarket-category/";localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'GET'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listSupermarkets:function listSupermarkets(options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){localVarPath="/api/supermarket/";localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'GET'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listSyncLogs:function listSyncLogs(options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){localVarPath="/api/sync-log/";localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'GET'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listSyncs:function listSyncs(options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){localVarPath="/api/sync/";localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'GET'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listUnits:function listUnits(options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){localVarPath="/api/unit/";localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'GET'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listUserFiles:function listUserFiles(options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){localVarPath="/api/user-file/";localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'GET'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listUserPreferences:function listUserPreferences(options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){localVarPath="/api/user-preference/";localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'GET'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         * optional parameters  - **filter_list**: array of user id\'s to get names for
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listUsers:function listUsers(options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){localVarPath="/api/user-name/";localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'GET'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listViewLogs:function listViewLogs(options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){localVarPath="/api/view-log/";localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'GET'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this food.
         * @param {string} target
         * @param {Food} [food]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */mergeFood:function mergeFood(id,target,food,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('mergeFood','id',id);// verify required parameter 'target' is not null or undefined
common_assertParamExists('mergeFood','target',target);localVarPath="/api/food/{id}/merge/{target}/".replace("{"+"id"+"}",encodeURIComponent(String(id))).replace("{"+"target"+"}",encodeURIComponent(String(target)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'PUT'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(food,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this keyword.
         * @param {string} target
         * @param {Keyword} [keyword]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */mergeKeyword:function mergeKeyword(id,target,keyword,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('mergeKeyword','id',id);// verify required parameter 'target' is not null or undefined
common_assertParamExists('mergeKeyword','target',target);localVarPath="/api/keyword/{id}/merge/{target}/".replace("{"+"id"+"}",encodeURIComponent(String(id))).replace("{"+"target"+"}",encodeURIComponent(String(target)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'PUT'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(keyword,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this food.
         * @param {string} parent
         * @param {Food} [food]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */moveFood:function moveFood(id,parent,food,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('moveFood','id',id);// verify required parameter 'parent' is not null or undefined
common_assertParamExists('moveFood','parent',parent);localVarPath="/api/food/{id}/move/{parent}/".replace("{"+"id"+"}",encodeURIComponent(String(id))).replace("{"+"parent"+"}",encodeURIComponent(String(parent)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'PUT'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(food,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this keyword.
         * @param {string} parent
         * @param {Keyword} [keyword]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */moveKeyword:function moveKeyword(id,parent,keyword,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('moveKeyword','id',id);// verify required parameter 'parent' is not null or undefined
common_assertParamExists('moveKeyword','parent',parent);localVarPath="/api/keyword/{id}/move/{parent}/".replace("{"+"id"+"}",encodeURIComponent(String(id))).replace("{"+"parent"+"}",encodeURIComponent(String(parent)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'PUT'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(keyword,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this bookmarklet import.
         * @param {BookmarkletImport} [bookmarkletImport]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateBookmarkletImport:function partialUpdateBookmarkletImport(id,bookmarkletImport,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('partialUpdateBookmarkletImport','id',id);localVarPath="/api/bookmarklet-import/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'PATCH'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(bookmarkletImport,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this cook log.
         * @param {CookLog} [cookLog]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateCookLog:function partialUpdateCookLog(id,cookLog,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('partialUpdateCookLog','id',id);localVarPath="/api/cook-log/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'PATCH'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(cookLog,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this food.
         * @param {Food} [food]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateFood:function partialUpdateFood(id,food,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('partialUpdateFood','id',id);localVarPath="/api/food/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'PATCH'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(food,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this import log.
         * @param {ImportLog} [importLog]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateImportLog:function partialUpdateImportLog(id,importLog,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('partialUpdateImportLog','id',id);localVarPath="/api/import-log/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'PATCH'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(importLog,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this ingredient.
         * @param {Ingredient} [ingredient]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateIngredient:function partialUpdateIngredient(id,ingredient,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('partialUpdateIngredient','id',id);localVarPath="/api/ingredient/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'PATCH'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(ingredient,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this keyword.
         * @param {Keyword} [keyword]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateKeyword:function partialUpdateKeyword(id,keyword,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('partialUpdateKeyword','id',id);localVarPath="/api/keyword/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'PATCH'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(keyword,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this meal plan.
         * @param {MealPlan} [mealPlan]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateMealPlan:function partialUpdateMealPlan(id,mealPlan,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('partialUpdateMealPlan','id',id);localVarPath="/api/meal-plan/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'PATCH'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(mealPlan,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         * returns list of meal types created by the requesting user ordered by the order field.
         * @param {string} id A unique integer value identifying this meal type.
         * @param {MealType} [mealType]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateMealType:function partialUpdateMealType(id,mealType,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('partialUpdateMealType','id',id);localVarPath="/api/meal-type/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'PATCH'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(mealType,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this recipe.
         * @param {Recipe} [recipe]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateRecipe:function partialUpdateRecipe(id,recipe,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('partialUpdateRecipe','id',id);localVarPath="/api/recipe/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'PATCH'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(recipe,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this recipe book.
         * @param {RecipeBook} [recipeBook]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateRecipeBook:function partialUpdateRecipeBook(id,recipeBook,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('partialUpdateRecipeBook','id',id);localVarPath="/api/recipe-book/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'PATCH'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(recipeBook,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this recipe book entry.
         * @param {RecipeBookEntry} [recipeBookEntry]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateRecipeBookEntry:function partialUpdateRecipeBookEntry(id,recipeBookEntry,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('partialUpdateRecipeBookEntry','id',id);localVarPath="/api/recipe-book-entry/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'PATCH'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(recipeBookEntry,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this shopping list.
         * @param {ShoppingList} [shoppingList]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateShoppingList:function partialUpdateShoppingList(id,shoppingList,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('partialUpdateShoppingList','id',id);localVarPath="/api/shopping-list/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'PATCH'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(shoppingList,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this shopping list entry.
         * @param {ShoppingListEntry} [shoppingListEntry]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateShoppingListEntry:function partialUpdateShoppingListEntry(id,shoppingListEntry,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('partialUpdateShoppingListEntry','id',id);localVarPath="/api/shopping-list-entry/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'PATCH'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(shoppingListEntry,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this shopping list recipe.
         * @param {ShoppingListRecipe} [shoppingListRecipe]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateShoppingListRecipe:function partialUpdateShoppingListRecipe(id,shoppingListRecipe,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('partialUpdateShoppingListRecipe','id',id);localVarPath="/api/shopping-list-recipe/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'PATCH'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(shoppingListRecipe,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this step.
         * @param {Step} [step]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateStep:function partialUpdateStep(id,step,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('partialUpdateStep','id',id);localVarPath="/api/step/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'PATCH'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(step,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this storage.
         * @param {Storage} [storage]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateStorage:function partialUpdateStorage(id,storage,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('partialUpdateStorage','id',id);localVarPath="/api/storage/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'PATCH'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(storage,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this supermarket.
         * @param {Supermarket} [supermarket]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateSupermarket:function partialUpdateSupermarket(id,supermarket,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('partialUpdateSupermarket','id',id);localVarPath="/api/supermarket/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'PATCH'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(supermarket,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this supermarket category.
         * @param {SupermarketCategory} [supermarketCategory]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateSupermarketCategory:function partialUpdateSupermarketCategory(id,supermarketCategory,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('partialUpdateSupermarketCategory','id',id);localVarPath="/api/supermarket-category/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'PATCH'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(supermarketCategory,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this supermarket category relation.
         * @param {SupermarketCategoryRelation} [supermarketCategoryRelation]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateSupermarketCategoryRelation:function partialUpdateSupermarketCategoryRelation(id,supermarketCategoryRelation,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('partialUpdateSupermarketCategoryRelation','id',id);localVarPath="/api/supermarket-category-relation/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'PATCH'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(supermarketCategoryRelation,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this sync.
         * @param {Sync} [sync]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateSync:function partialUpdateSync(id,sync,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('partialUpdateSync','id',id);localVarPath="/api/sync/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'PATCH'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(sync,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this unit.
         * @param {Unit} [unit]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateUnit:function partialUpdateUnit(id,unit,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('partialUpdateUnit','id',id);localVarPath="/api/unit/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'PATCH'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(unit,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this user file.
         * @param {string} name
         * @param {any} [file]
         * @param {number} [fileSizeKb]
         * @param {number} [id2]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateUserFile:function partialUpdateUserFile(id,name,file,fileSizeKb,id2,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,localVarFormParams,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('partialUpdateUserFile','id',id);// verify required parameter 'name' is not null or undefined
common_assertParamExists('partialUpdateUserFile','name',name);localVarPath="/api/user-file/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'PATCH'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarFormParams=new(configuration&&configuration.formDataCtor||FormData)();if(name!==undefined){localVarFormParams.append('name',name);}if(file!==undefined){localVarFormParams.append('file',file);}if(fileSizeKb!==undefined){localVarFormParams.append('file_size_kb',fileSizeKb);}if(id2!==undefined){localVarFormParams.append('id',id2);}localVarHeaderParameter['Content-Type']='multipart/form-data';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=localVarFormParams;return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} user A unique value identifying this user preference.
         * @param {UserPreference} [userPreference]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateUserPreference:function partialUpdateUserPreference(user,userPreference,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'user' is not null or undefined
common_assertParamExists('partialUpdateUserPreference','user',user);localVarPath="/api/user-preference/{user}/".replace("{"+"user"+"}",encodeURIComponent(String(user)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'PATCH'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(userPreference,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this view log.
         * @param {ViewLog} [viewLog]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateViewLog:function partialUpdateViewLog(id,viewLog,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('partialUpdateViewLog','id',id);localVarPath="/api/view-log/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'PATCH'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(viewLog,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this bookmarklet import.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveBookmarkletImport:function retrieveBookmarkletImport(id,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('retrieveBookmarkletImport','id',id);localVarPath="/api/bookmarklet-import/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'GET'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this cook log.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveCookLog:function retrieveCookLog(id,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('retrieveCookLog','id',id);localVarPath="/api/cook-log/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'GET'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this food.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveFood:function retrieveFood(id,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('retrieveFood','id',id);localVarPath="/api/food/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'GET'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this import log.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveImportLog:function retrieveImportLog(id,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('retrieveImportLog','id',id);localVarPath="/api/import-log/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'GET'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this ingredient.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveIngredient:function retrieveIngredient(id,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('retrieveIngredient','id',id);localVarPath="/api/ingredient/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'GET'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this keyword.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveKeyword:function retrieveKeyword(id,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('retrieveKeyword','id',id);localVarPath="/api/keyword/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'GET'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this meal plan.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveMealPlan:function retrieveMealPlan(id,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('retrieveMealPlan','id',id);localVarPath="/api/meal-plan/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'GET'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         * returns list of meal types created by the requesting user ordered by the order field.
         * @param {string} id A unique integer value identifying this meal type.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveMealType:function retrieveMealType(id,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('retrieveMealType','id',id);localVarPath="/api/meal-type/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'GET'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this recipe.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveRecipe:function retrieveRecipe(id,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('retrieveRecipe','id',id);localVarPath="/api/recipe/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'GET'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this recipe book.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveRecipeBook:function retrieveRecipeBook(id,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('retrieveRecipeBook','id',id);localVarPath="/api/recipe-book/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'GET'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this recipe book entry.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveRecipeBookEntry:function retrieveRecipeBookEntry(id,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('retrieveRecipeBookEntry','id',id);localVarPath="/api/recipe-book-entry/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'GET'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this shopping list.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveShoppingList:function retrieveShoppingList(id,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('retrieveShoppingList','id',id);localVarPath="/api/shopping-list/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'GET'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this shopping list entry.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveShoppingListEntry:function retrieveShoppingListEntry(id,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('retrieveShoppingListEntry','id',id);localVarPath="/api/shopping-list-entry/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'GET'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this shopping list recipe.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveShoppingListRecipe:function retrieveShoppingListRecipe(id,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('retrieveShoppingListRecipe','id',id);localVarPath="/api/shopping-list-recipe/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'GET'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this step.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveStep:function retrieveStep(id,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('retrieveStep','id',id);localVarPath="/api/step/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'GET'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this storage.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveStorage:function retrieveStorage(id,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('retrieveStorage','id',id);localVarPath="/api/storage/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'GET'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this supermarket.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveSupermarket:function retrieveSupermarket(id,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('retrieveSupermarket','id',id);localVarPath="/api/supermarket/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'GET'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this supermarket category.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveSupermarketCategory:function retrieveSupermarketCategory(id,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('retrieveSupermarketCategory','id',id);localVarPath="/api/supermarket-category/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'GET'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this supermarket category relation.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveSupermarketCategoryRelation:function retrieveSupermarketCategoryRelation(id,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('retrieveSupermarketCategoryRelation','id',id);localVarPath="/api/supermarket-category-relation/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'GET'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this sync.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveSync:function retrieveSync(id,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('retrieveSync','id',id);localVarPath="/api/sync/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'GET'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this sync log.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveSyncLog:function retrieveSyncLog(id,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('retrieveSyncLog','id',id);localVarPath="/api/sync-log/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'GET'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this unit.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveUnit:function retrieveUnit(id,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('retrieveUnit','id',id);localVarPath="/api/unit/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'GET'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this user.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveUser:function retrieveUser(id,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('retrieveUser','id',id);localVarPath="/api/user-name/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'GET'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this user file.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveUserFile:function retrieveUserFile(id,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('retrieveUserFile','id',id);localVarPath="/api/user-file/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'GET'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} user A unique value identifying this user preference.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveUserPreference:function retrieveUserPreference(user,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'user' is not null or undefined
common_assertParamExists('retrieveUserPreference','user',user);localVarPath="/api/user-preference/{user}/".replace("{"+"user"+"}",encodeURIComponent(String(user)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'GET'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this view log.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveViewLog:function retrieveViewLog(id,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('retrieveViewLog','id',id);localVarPath="/api/view-log/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'GET'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this bookmarklet import.
         * @param {BookmarkletImport} [bookmarkletImport]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateBookmarkletImport:function updateBookmarkletImport(id,bookmarkletImport,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('updateBookmarkletImport','id',id);localVarPath="/api/bookmarklet-import/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'PUT'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(bookmarkletImport,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this cook log.
         * @param {CookLog} [cookLog]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateCookLog:function updateCookLog(id,cookLog,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('updateCookLog','id',id);localVarPath="/api/cook-log/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'PUT'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(cookLog,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this food.
         * @param {Food} [food]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateFood:function updateFood(id,food,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('updateFood','id',id);localVarPath="/api/food/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'PUT'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(food,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this import log.
         * @param {ImportLog} [importLog]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateImportLog:function updateImportLog(id,importLog,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('updateImportLog','id',id);localVarPath="/api/import-log/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'PUT'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(importLog,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this ingredient.
         * @param {Ingredient} [ingredient]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateIngredient:function updateIngredient(id,ingredient,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('updateIngredient','id',id);localVarPath="/api/ingredient/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'PUT'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(ingredient,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this keyword.
         * @param {Keyword} [keyword]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateKeyword:function updateKeyword(id,keyword,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('updateKeyword','id',id);localVarPath="/api/keyword/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'PUT'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(keyword,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this meal plan.
         * @param {MealPlan} [mealPlan]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateMealPlan:function updateMealPlan(id,mealPlan,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('updateMealPlan','id',id);localVarPath="/api/meal-plan/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'PUT'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(mealPlan,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         * returns list of meal types created by the requesting user ordered by the order field.
         * @param {string} id A unique integer value identifying this meal type.
         * @param {MealType} [mealType]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateMealType:function updateMealType(id,mealType,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('updateMealType','id',id);localVarPath="/api/meal-type/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'PUT'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(mealType,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this recipe.
         * @param {Recipe} [recipe]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateRecipe:function updateRecipe(id,recipe,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('updateRecipe','id',id);localVarPath="/api/recipe/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'PUT'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(recipe,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this recipe book.
         * @param {RecipeBook} [recipeBook]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateRecipeBook:function updateRecipeBook(id,recipeBook,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('updateRecipeBook','id',id);localVarPath="/api/recipe-book/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'PUT'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(recipeBook,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this recipe book entry.
         * @param {RecipeBookEntry} [recipeBookEntry]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateRecipeBookEntry:function updateRecipeBookEntry(id,recipeBookEntry,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('updateRecipeBookEntry','id',id);localVarPath="/api/recipe-book-entry/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'PUT'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(recipeBookEntry,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this shopping list.
         * @param {ShoppingList} [shoppingList]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateShoppingList:function updateShoppingList(id,shoppingList,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('updateShoppingList','id',id);localVarPath="/api/shopping-list/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'PUT'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(shoppingList,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this shopping list entry.
         * @param {ShoppingListEntry} [shoppingListEntry]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateShoppingListEntry:function updateShoppingListEntry(id,shoppingListEntry,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('updateShoppingListEntry','id',id);localVarPath="/api/shopping-list-entry/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'PUT'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(shoppingListEntry,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this shopping list recipe.
         * @param {ShoppingListRecipe} [shoppingListRecipe]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateShoppingListRecipe:function updateShoppingListRecipe(id,shoppingListRecipe,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('updateShoppingListRecipe','id',id);localVarPath="/api/shopping-list-recipe/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'PUT'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(shoppingListRecipe,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this step.
         * @param {Step} [step]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateStep:function updateStep(id,step,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('updateStep','id',id);localVarPath="/api/step/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'PUT'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(step,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this storage.
         * @param {Storage} [storage]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateStorage:function updateStorage(id,storage,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('updateStorage','id',id);localVarPath="/api/storage/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'PUT'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(storage,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this supermarket.
         * @param {Supermarket} [supermarket]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateSupermarket:function updateSupermarket(id,supermarket,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('updateSupermarket','id',id);localVarPath="/api/supermarket/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'PUT'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(supermarket,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this supermarket category.
         * @param {SupermarketCategory} [supermarketCategory]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateSupermarketCategory:function updateSupermarketCategory(id,supermarketCategory,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('updateSupermarketCategory','id',id);localVarPath="/api/supermarket-category/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'PUT'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(supermarketCategory,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this supermarket category relation.
         * @param {SupermarketCategoryRelation} [supermarketCategoryRelation]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateSupermarketCategoryRelation:function updateSupermarketCategoryRelation(id,supermarketCategoryRelation,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('updateSupermarketCategoryRelation','id',id);localVarPath="/api/supermarket-category-relation/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'PUT'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(supermarketCategoryRelation,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this sync.
         * @param {Sync} [sync]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateSync:function updateSync(id,sync,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('updateSync','id',id);localVarPath="/api/sync/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'PUT'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(sync,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this unit.
         * @param {Unit} [unit]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateUnit:function updateUnit(id,unit,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('updateUnit','id',id);localVarPath="/api/unit/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'PUT'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(unit,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this user file.
         * @param {string} name
         * @param {any} [file]
         * @param {number} [fileSizeKb]
         * @param {number} [id2]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateUserFile:function updateUserFile(id,name,file,fileSizeKb,id2,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,localVarFormParams,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('updateUserFile','id',id);// verify required parameter 'name' is not null or undefined
common_assertParamExists('updateUserFile','name',name);localVarPath="/api/user-file/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'PUT'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarFormParams=new(configuration&&configuration.formDataCtor||FormData)();if(name!==undefined){localVarFormParams.append('name',name);}if(file!==undefined){localVarFormParams.append('file',file);}if(fileSizeKb!==undefined){localVarFormParams.append('file_size_kb',fileSizeKb);}if(id2!==undefined){localVarFormParams.append('id',id2);}localVarHeaderParameter['Content-Type']='multipart/form-data';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=localVarFormParams;return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} user A unique value identifying this user preference.
         * @param {UserPreference} [userPreference]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateUserPreference:function updateUserPreference(user,userPreference,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'user' is not null or undefined
common_assertParamExists('updateUserPreference','user',user);localVarPath="/api/user-preference/{user}/".replace("{"+"user"+"}",encodeURIComponent(String(user)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'PUT'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(userPreference,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
         *
         * @param {string} id A unique integer value identifying this view log.
         * @param {ViewLog} [viewLog]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateViewLog:function updateViewLog(id,viewLog,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('updateViewLog','id',id);localVarPath="/api/view-log/{id}/".replace("{"+"id"+"}",encodeURIComponent(String(id)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'PUT'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(viewLog,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});}};};/**
 * ApiApi - functional programming interface
 * @export
 */var api_ApiApiFp=function ApiApiFp(configuration){var localVarAxiosParamCreator=api_ApiApiAxiosParamCreator(configuration);return{/**
         *
         * @param {BookmarkletImport} [bookmarkletImport]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createBookmarkletImport:function createBookmarkletImport(bookmarkletImport,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.createBookmarkletImport(bookmarkletImport,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {CookLog} [cookLog]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createCookLog:function createCookLog(cookLog,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.createCookLog(cookLog,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {Food} [food]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createFood:function createFood(food,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.createFood(food,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {ImportLog} [importLog]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createImportLog:function createImportLog(importLog,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.createImportLog(importLog,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {Ingredient} [ingredient]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createIngredient:function createIngredient(ingredient,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.createIngredient(ingredient,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {Keyword} [keyword]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createKeyword:function createKeyword(keyword,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.createKeyword(keyword,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {MealPlan} [mealPlan]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createMealPlan:function createMealPlan(mealPlan,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.createMealPlan(mealPlan,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         * returns list of meal types created by the requesting user ordered by the order field.
         * @param {MealType} [mealType]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createMealType:function createMealType(mealType,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.createMealType(mealType,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {Recipe} [recipe]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createRecipe:function createRecipe(recipe,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.createRecipe(recipe,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {RecipeBook} [recipeBook]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createRecipeBook:function createRecipeBook(recipeBook,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.createRecipeBook(recipeBook,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {RecipeBookEntry} [recipeBookEntry]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createRecipeBookEntry:function createRecipeBookEntry(recipeBookEntry,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.createRecipeBookEntry(recipeBookEntry,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {ShoppingList} [shoppingList]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createShoppingList:function createShoppingList(shoppingList,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.createShoppingList(shoppingList,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {ShoppingListEntry} [shoppingListEntry]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createShoppingListEntry:function createShoppingListEntry(shoppingListEntry,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.createShoppingListEntry(shoppingListEntry,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {ShoppingListRecipe} [shoppingListRecipe]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createShoppingListRecipe:function createShoppingListRecipe(shoppingListRecipe,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.createShoppingListRecipe(shoppingListRecipe,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {Step} [step]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createStep:function createStep(step,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.createStep(step,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {Storage} [storage]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createStorage:function createStorage(storage,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.createStorage(storage,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {Supermarket} [supermarket]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createSupermarket:function createSupermarket(supermarket,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.createSupermarket(supermarket,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {SupermarketCategory} [supermarketCategory]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createSupermarketCategory:function createSupermarketCategory(supermarketCategory,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.createSupermarketCategory(supermarketCategory,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {SupermarketCategoryRelation} [supermarketCategoryRelation]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createSupermarketCategoryRelation:function createSupermarketCategoryRelation(supermarketCategoryRelation,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.createSupermarketCategoryRelation(supermarketCategoryRelation,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {Sync} [sync]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createSync:function createSync(sync,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.createSync(sync,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {Unit} [unit]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createUnit:function createUnit(unit,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.createUnit(unit,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} name
         * @param {any} [file]
         * @param {number} [fileSizeKb]
         * @param {number} [id]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createUserFile:function createUserFile(name,file,fileSizeKb,id,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.createUserFile(name,file,fileSizeKb,id,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {UserPreference} [userPreference]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createUserPreference:function createUserPreference(userPreference,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.createUserPreference(userPreference,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {ViewLog} [viewLog]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createViewLog:function createViewLog(viewLog,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.createViewLog(viewLog,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this bookmarklet import.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyBookmarkletImport:function destroyBookmarkletImport(id,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.destroyBookmarkletImport(id,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this cook log.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyCookLog:function destroyCookLog(id,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.destroyCookLog(id,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this food.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyFood:function destroyFood(id,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.destroyFood(id,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this import log.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyImportLog:function destroyImportLog(id,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.destroyImportLog(id,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this ingredient.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyIngredient:function destroyIngredient(id,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.destroyIngredient(id,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this keyword.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyKeyword:function destroyKeyword(id,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.destroyKeyword(id,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this meal plan.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyMealPlan:function destroyMealPlan(id,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.destroyMealPlan(id,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         * returns list of meal types created by the requesting user ordered by the order field.
         * @param {string} id A unique integer value identifying this meal type.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyMealType:function destroyMealType(id,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.destroyMealType(id,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this recipe.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyRecipe:function destroyRecipe(id,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.destroyRecipe(id,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this recipe book.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyRecipeBook:function destroyRecipeBook(id,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.destroyRecipeBook(id,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this recipe book entry.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyRecipeBookEntry:function destroyRecipeBookEntry(id,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.destroyRecipeBookEntry(id,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this shopping list.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyShoppingList:function destroyShoppingList(id,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.destroyShoppingList(id,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this shopping list entry.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyShoppingListEntry:function destroyShoppingListEntry(id,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.destroyShoppingListEntry(id,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this shopping list recipe.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyShoppingListRecipe:function destroyShoppingListRecipe(id,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.destroyShoppingListRecipe(id,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this step.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyStep:function destroyStep(id,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.destroyStep(id,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this storage.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyStorage:function destroyStorage(id,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.destroyStorage(id,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this supermarket.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroySupermarket:function destroySupermarket(id,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.destroySupermarket(id,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this supermarket category.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroySupermarketCategory:function destroySupermarketCategory(id,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.destroySupermarketCategory(id,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this supermarket category relation.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroySupermarketCategoryRelation:function destroySupermarketCategoryRelation(id,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.destroySupermarketCategoryRelation(id,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this sync.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroySync:function destroySync(id,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.destroySync(id,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this unit.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyUnit:function destroyUnit(id,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.destroyUnit(id,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this user file.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyUserFile:function destroyUserFile(id,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.destroyUserFile(id,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} user A unique value identifying this user preference.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyUserPreference:function destroyUserPreference(user,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.destroyUserPreference(user,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this view log.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyViewLog:function destroyViewLog(id,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.destroyViewLog(id,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this recipe.
         * @param {any} [image]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */imageRecipe:function imageRecipe(id,image,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.imageRecipe(id,image,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listBookmarkletImports:function listBookmarkletImports(options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.listBookmarkletImports(options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listCookLogs:function listCookLogs(options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.listCookLogs(options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} [query] Query string matched against food name.
         * @param {number} [root] Return first level children of food with ID [int].  Integer 0 will return root foods.
         * @param {number} [tree] Return all self and children of food with ID [int].
         * @param {number} [page] A page number within the paginated result set.
         * @param {number} [pageSize] Number of results to return per page.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listFoods:function listFoods(query,root,tree,page,pageSize,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.listFoods(query,root,tree,page,pageSize,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listImportLogs:function listImportLogs(options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.listImportLogs(options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listIngredients:function listIngredients(options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.listIngredients(options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} [query] Query string matched against keyword name.
         * @param {number} [root] Return first level children of keyword with ID [int].  Integer 0 will return root keywords.
         * @param {number} [tree] Return all self and children of keyword with ID [int].
         * @param {number} [page] A page number within the paginated result set.
         * @param {number} [pageSize] Number of results to return per page.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listKeywords:function listKeywords(query,root,tree,page,pageSize,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.listKeywords(query,root,tree,page,pageSize,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         * optional parameters  - **from_date**: filter from (inclusive) a certain date onward - **to_date**: filter upward to (inclusive) certain date
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listMealPlans:function listMealPlans(options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.listMealPlans(options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         * returns list of meal types created by the requesting user ordered by the order field.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listMealTypes:function listMealTypes(options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.listMealTypes(options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listRecipeBookEntrys:function listRecipeBookEntrys(options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.listRecipeBookEntrys(options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listRecipeBooks:function listRecipeBooks(options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.listRecipeBooks(options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} [query] Query string matched (fuzzy) against recipe name. In the future also fulltext search.
         * @param {string} [keywords] Id of keyword a recipe should have. For multiple repeat parameter.
         * @param {string} [foods] Id of food a recipe should have. For multiple repeat parameter.
         * @param {string} [books] Id of book a recipe should have. For multiple repeat parameter.
         * @param {string} [keywordsOr] If recipe should have all (AND) or any (OR) of the provided keywords.
         * @param {string} [foodsOr] If recipe should have all (AND) or any (OR) any of the provided foods.
         * @param {string} [booksOr] If recipe should be in all (AND) or any (OR) any of the provided books.
         * @param {string} [internal] true or false. If only internal recipes should be returned or not.
         * @param {string} [random] true or false. returns the results in randomized order.
         * @param {string} [_new] true or false. returns new results first in search results
         * @param {number} [page] A page number within the paginated result set.
         * @param {number} [pageSize] Number of results to return per page.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listRecipes:function listRecipes(query,keywords,foods,books,keywordsOr,foodsOr,booksOr,internal,random,_new,page,pageSize,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.listRecipes(query,keywords,foods,books,keywordsOr,foodsOr,booksOr,internal,random,_new,page,pageSize,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listShoppingListEntrys:function listShoppingListEntrys(options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.listShoppingListEntrys(options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listShoppingListRecipes:function listShoppingListRecipes(options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.listShoppingListRecipes(options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listShoppingLists:function listShoppingLists(options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.listShoppingLists(options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listSteps:function listSteps(options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.listSteps(options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listStorages:function listStorages(options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.listStorages(options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {number} [page] A page number within the paginated result set.
         * @param {number} [pageSize] Number of results to return per page.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listSupermarketCategoryRelations:function listSupermarketCategoryRelations(page,pageSize,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.listSupermarketCategoryRelations(page,pageSize,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listSupermarketCategorys:function listSupermarketCategorys(options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.listSupermarketCategorys(options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listSupermarkets:function listSupermarkets(options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.listSupermarkets(options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listSyncLogs:function listSyncLogs(options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.listSyncLogs(options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listSyncs:function listSyncs(options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.listSyncs(options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listUnits:function listUnits(options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.listUnits(options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listUserFiles:function listUserFiles(options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.listUserFiles(options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listUserPreferences:function listUserPreferences(options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.listUserPreferences(options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         * optional parameters  - **filter_list**: array of user id\'s to get names for
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listUsers:function listUsers(options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.listUsers(options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listViewLogs:function listViewLogs(options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.listViewLogs(options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this food.
         * @param {string} target
         * @param {Food} [food]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */mergeFood:function mergeFood(id,target,food,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.mergeFood(id,target,food,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this keyword.
         * @param {string} target
         * @param {Keyword} [keyword]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */mergeKeyword:function mergeKeyword(id,target,keyword,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.mergeKeyword(id,target,keyword,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this food.
         * @param {string} parent
         * @param {Food} [food]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */moveFood:function moveFood(id,parent,food,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.moveFood(id,parent,food,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this keyword.
         * @param {string} parent
         * @param {Keyword} [keyword]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */moveKeyword:function moveKeyword(id,parent,keyword,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.moveKeyword(id,parent,keyword,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this bookmarklet import.
         * @param {BookmarkletImport} [bookmarkletImport]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateBookmarkletImport:function partialUpdateBookmarkletImport(id,bookmarkletImport,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.partialUpdateBookmarkletImport(id,bookmarkletImport,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this cook log.
         * @param {CookLog} [cookLog]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateCookLog:function partialUpdateCookLog(id,cookLog,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.partialUpdateCookLog(id,cookLog,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this food.
         * @param {Food} [food]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateFood:function partialUpdateFood(id,food,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.partialUpdateFood(id,food,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this import log.
         * @param {ImportLog} [importLog]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateImportLog:function partialUpdateImportLog(id,importLog,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.partialUpdateImportLog(id,importLog,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this ingredient.
         * @param {Ingredient} [ingredient]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateIngredient:function partialUpdateIngredient(id,ingredient,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.partialUpdateIngredient(id,ingredient,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this keyword.
         * @param {Keyword} [keyword]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateKeyword:function partialUpdateKeyword(id,keyword,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.partialUpdateKeyword(id,keyword,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this meal plan.
         * @param {MealPlan} [mealPlan]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateMealPlan:function partialUpdateMealPlan(id,mealPlan,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.partialUpdateMealPlan(id,mealPlan,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         * returns list of meal types created by the requesting user ordered by the order field.
         * @param {string} id A unique integer value identifying this meal type.
         * @param {MealType} [mealType]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateMealType:function partialUpdateMealType(id,mealType,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.partialUpdateMealType(id,mealType,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this recipe.
         * @param {Recipe} [recipe]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateRecipe:function partialUpdateRecipe(id,recipe,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.partialUpdateRecipe(id,recipe,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this recipe book.
         * @param {RecipeBook} [recipeBook]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateRecipeBook:function partialUpdateRecipeBook(id,recipeBook,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.partialUpdateRecipeBook(id,recipeBook,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this recipe book entry.
         * @param {RecipeBookEntry} [recipeBookEntry]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateRecipeBookEntry:function partialUpdateRecipeBookEntry(id,recipeBookEntry,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.partialUpdateRecipeBookEntry(id,recipeBookEntry,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this shopping list.
         * @param {ShoppingList} [shoppingList]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateShoppingList:function partialUpdateShoppingList(id,shoppingList,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.partialUpdateShoppingList(id,shoppingList,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this shopping list entry.
         * @param {ShoppingListEntry} [shoppingListEntry]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateShoppingListEntry:function partialUpdateShoppingListEntry(id,shoppingListEntry,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.partialUpdateShoppingListEntry(id,shoppingListEntry,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this shopping list recipe.
         * @param {ShoppingListRecipe} [shoppingListRecipe]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateShoppingListRecipe:function partialUpdateShoppingListRecipe(id,shoppingListRecipe,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.partialUpdateShoppingListRecipe(id,shoppingListRecipe,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this step.
         * @param {Step} [step]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateStep:function partialUpdateStep(id,step,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.partialUpdateStep(id,step,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this storage.
         * @param {Storage} [storage]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateStorage:function partialUpdateStorage(id,storage,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.partialUpdateStorage(id,storage,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this supermarket.
         * @param {Supermarket} [supermarket]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateSupermarket:function partialUpdateSupermarket(id,supermarket,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.partialUpdateSupermarket(id,supermarket,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this supermarket category.
         * @param {SupermarketCategory} [supermarketCategory]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateSupermarketCategory:function partialUpdateSupermarketCategory(id,supermarketCategory,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.partialUpdateSupermarketCategory(id,supermarketCategory,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this supermarket category relation.
         * @param {SupermarketCategoryRelation} [supermarketCategoryRelation]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateSupermarketCategoryRelation:function partialUpdateSupermarketCategoryRelation(id,supermarketCategoryRelation,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.partialUpdateSupermarketCategoryRelation(id,supermarketCategoryRelation,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this sync.
         * @param {Sync} [sync]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateSync:function partialUpdateSync(id,sync,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.partialUpdateSync(id,sync,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this unit.
         * @param {Unit} [unit]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateUnit:function partialUpdateUnit(id,unit,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.partialUpdateUnit(id,unit,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this user file.
         * @param {string} name
         * @param {any} [file]
         * @param {number} [fileSizeKb]
         * @param {number} [id2]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateUserFile:function partialUpdateUserFile(id,name,file,fileSizeKb,id2,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.partialUpdateUserFile(id,name,file,fileSizeKb,id2,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} user A unique value identifying this user preference.
         * @param {UserPreference} [userPreference]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateUserPreference:function partialUpdateUserPreference(user,userPreference,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.partialUpdateUserPreference(user,userPreference,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this view log.
         * @param {ViewLog} [viewLog]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateViewLog:function partialUpdateViewLog(id,viewLog,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.partialUpdateViewLog(id,viewLog,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this bookmarklet import.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveBookmarkletImport:function retrieveBookmarkletImport(id,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.retrieveBookmarkletImport(id,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this cook log.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveCookLog:function retrieveCookLog(id,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.retrieveCookLog(id,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this food.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveFood:function retrieveFood(id,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.retrieveFood(id,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this import log.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveImportLog:function retrieveImportLog(id,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.retrieveImportLog(id,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this ingredient.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveIngredient:function retrieveIngredient(id,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.retrieveIngredient(id,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this keyword.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveKeyword:function retrieveKeyword(id,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.retrieveKeyword(id,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this meal plan.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveMealPlan:function retrieveMealPlan(id,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.retrieveMealPlan(id,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         * returns list of meal types created by the requesting user ordered by the order field.
         * @param {string} id A unique integer value identifying this meal type.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveMealType:function retrieveMealType(id,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.retrieveMealType(id,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this recipe.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveRecipe:function retrieveRecipe(id,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.retrieveRecipe(id,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this recipe book.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveRecipeBook:function retrieveRecipeBook(id,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.retrieveRecipeBook(id,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this recipe book entry.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveRecipeBookEntry:function retrieveRecipeBookEntry(id,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.retrieveRecipeBookEntry(id,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this shopping list.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveShoppingList:function retrieveShoppingList(id,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.retrieveShoppingList(id,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this shopping list entry.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveShoppingListEntry:function retrieveShoppingListEntry(id,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.retrieveShoppingListEntry(id,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this shopping list recipe.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveShoppingListRecipe:function retrieveShoppingListRecipe(id,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.retrieveShoppingListRecipe(id,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this step.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveStep:function retrieveStep(id,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.retrieveStep(id,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this storage.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveStorage:function retrieveStorage(id,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.retrieveStorage(id,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this supermarket.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveSupermarket:function retrieveSupermarket(id,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.retrieveSupermarket(id,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this supermarket category.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveSupermarketCategory:function retrieveSupermarketCategory(id,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.retrieveSupermarketCategory(id,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this supermarket category relation.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveSupermarketCategoryRelation:function retrieveSupermarketCategoryRelation(id,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.retrieveSupermarketCategoryRelation(id,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this sync.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveSync:function retrieveSync(id,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.retrieveSync(id,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this sync log.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveSyncLog:function retrieveSyncLog(id,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.retrieveSyncLog(id,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this unit.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveUnit:function retrieveUnit(id,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.retrieveUnit(id,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this user.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveUser:function retrieveUser(id,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.retrieveUser(id,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this user file.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveUserFile:function retrieveUserFile(id,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.retrieveUserFile(id,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} user A unique value identifying this user preference.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveUserPreference:function retrieveUserPreference(user,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.retrieveUserPreference(user,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this view log.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveViewLog:function retrieveViewLog(id,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.retrieveViewLog(id,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this bookmarklet import.
         * @param {BookmarkletImport} [bookmarkletImport]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateBookmarkletImport:function updateBookmarkletImport(id,bookmarkletImport,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.updateBookmarkletImport(id,bookmarkletImport,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this cook log.
         * @param {CookLog} [cookLog]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateCookLog:function updateCookLog(id,cookLog,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.updateCookLog(id,cookLog,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this food.
         * @param {Food} [food]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateFood:function updateFood(id,food,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.updateFood(id,food,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this import log.
         * @param {ImportLog} [importLog]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateImportLog:function updateImportLog(id,importLog,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.updateImportLog(id,importLog,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this ingredient.
         * @param {Ingredient} [ingredient]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateIngredient:function updateIngredient(id,ingredient,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.updateIngredient(id,ingredient,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this keyword.
         * @param {Keyword} [keyword]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateKeyword:function updateKeyword(id,keyword,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.updateKeyword(id,keyword,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this meal plan.
         * @param {MealPlan} [mealPlan]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateMealPlan:function updateMealPlan(id,mealPlan,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.updateMealPlan(id,mealPlan,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         * returns list of meal types created by the requesting user ordered by the order field.
         * @param {string} id A unique integer value identifying this meal type.
         * @param {MealType} [mealType]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateMealType:function updateMealType(id,mealType,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.updateMealType(id,mealType,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this recipe.
         * @param {Recipe} [recipe]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateRecipe:function updateRecipe(id,recipe,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.updateRecipe(id,recipe,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this recipe book.
         * @param {RecipeBook} [recipeBook]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateRecipeBook:function updateRecipeBook(id,recipeBook,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.updateRecipeBook(id,recipeBook,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this recipe book entry.
         * @param {RecipeBookEntry} [recipeBookEntry]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateRecipeBookEntry:function updateRecipeBookEntry(id,recipeBookEntry,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.updateRecipeBookEntry(id,recipeBookEntry,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this shopping list.
         * @param {ShoppingList} [shoppingList]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateShoppingList:function updateShoppingList(id,shoppingList,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.updateShoppingList(id,shoppingList,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this shopping list entry.
         * @param {ShoppingListEntry} [shoppingListEntry]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateShoppingListEntry:function updateShoppingListEntry(id,shoppingListEntry,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.updateShoppingListEntry(id,shoppingListEntry,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this shopping list recipe.
         * @param {ShoppingListRecipe} [shoppingListRecipe]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateShoppingListRecipe:function updateShoppingListRecipe(id,shoppingListRecipe,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.updateShoppingListRecipe(id,shoppingListRecipe,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this step.
         * @param {Step} [step]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateStep:function updateStep(id,step,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.updateStep(id,step,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this storage.
         * @param {Storage} [storage]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateStorage:function updateStorage(id,storage,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.updateStorage(id,storage,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this supermarket.
         * @param {Supermarket} [supermarket]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateSupermarket:function updateSupermarket(id,supermarket,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.updateSupermarket(id,supermarket,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this supermarket category.
         * @param {SupermarketCategory} [supermarketCategory]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateSupermarketCategory:function updateSupermarketCategory(id,supermarketCategory,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.updateSupermarketCategory(id,supermarketCategory,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this supermarket category relation.
         * @param {SupermarketCategoryRelation} [supermarketCategoryRelation]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateSupermarketCategoryRelation:function updateSupermarketCategoryRelation(id,supermarketCategoryRelation,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.updateSupermarketCategoryRelation(id,supermarketCategoryRelation,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this sync.
         * @param {Sync} [sync]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateSync:function updateSync(id,sync,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.updateSync(id,sync,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this unit.
         * @param {Unit} [unit]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateUnit:function updateUnit(id,unit,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.updateUnit(id,unit,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this user file.
         * @param {string} name
         * @param {any} [file]
         * @param {number} [fileSizeKb]
         * @param {number} [id2]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateUserFile:function updateUserFile(id,name,file,fileSizeKb,id2,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.updateUserFile(id,name,file,fileSizeKb,id2,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} user A unique value identifying this user preference.
         * @param {UserPreference} [userPreference]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateUserPreference:function updateUserPreference(user,userPreference,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.updateUserPreference(user,userPreference,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
         *
         * @param {string} id A unique integer value identifying this view log.
         * @param {ViewLog} [viewLog]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateViewLog:function updateViewLog(id,viewLog,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.updateViewLog(id,viewLog,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});}};};/**
 * ApiApi - factory interface
 * @export
 */var ApiApiFactory=function ApiApiFactory(configuration,basePath,axios){var localVarFp=api_ApiApiFp(configuration);return{/**
         *
         * @param {BookmarkletImport} [bookmarkletImport]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createBookmarkletImport:function createBookmarkletImport(bookmarkletImport,options){return localVarFp.createBookmarkletImport(bookmarkletImport,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {CookLog} [cookLog]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createCookLog:function createCookLog(cookLog,options){return localVarFp.createCookLog(cookLog,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {Food} [food]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createFood:function createFood(food,options){return localVarFp.createFood(food,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {ImportLog} [importLog]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createImportLog:function createImportLog(importLog,options){return localVarFp.createImportLog(importLog,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {Ingredient} [ingredient]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createIngredient:function createIngredient(ingredient,options){return localVarFp.createIngredient(ingredient,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {Keyword} [keyword]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createKeyword:function createKeyword(keyword,options){return localVarFp.createKeyword(keyword,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {MealPlan} [mealPlan]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createMealPlan:function createMealPlan(mealPlan,options){return localVarFp.createMealPlan(mealPlan,options).then(function(request){return request(axios,basePath);});},/**
         * returns list of meal types created by the requesting user ordered by the order field.
         * @param {MealType} [mealType]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createMealType:function createMealType(mealType,options){return localVarFp.createMealType(mealType,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {Recipe} [recipe]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createRecipe:function createRecipe(recipe,options){return localVarFp.createRecipe(recipe,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {RecipeBook} [recipeBook]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createRecipeBook:function createRecipeBook(recipeBook,options){return localVarFp.createRecipeBook(recipeBook,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {RecipeBookEntry} [recipeBookEntry]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createRecipeBookEntry:function createRecipeBookEntry(recipeBookEntry,options){return localVarFp.createRecipeBookEntry(recipeBookEntry,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {ShoppingList} [shoppingList]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createShoppingList:function createShoppingList(shoppingList,options){return localVarFp.createShoppingList(shoppingList,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {ShoppingListEntry} [shoppingListEntry]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createShoppingListEntry:function createShoppingListEntry(shoppingListEntry,options){return localVarFp.createShoppingListEntry(shoppingListEntry,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {ShoppingListRecipe} [shoppingListRecipe]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createShoppingListRecipe:function createShoppingListRecipe(shoppingListRecipe,options){return localVarFp.createShoppingListRecipe(shoppingListRecipe,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {Step} [step]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createStep:function createStep(step,options){return localVarFp.createStep(step,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {Storage} [storage]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createStorage:function createStorage(storage,options){return localVarFp.createStorage(storage,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {Supermarket} [supermarket]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createSupermarket:function createSupermarket(supermarket,options){return localVarFp.createSupermarket(supermarket,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {SupermarketCategory} [supermarketCategory]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createSupermarketCategory:function createSupermarketCategory(supermarketCategory,options){return localVarFp.createSupermarketCategory(supermarketCategory,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {SupermarketCategoryRelation} [supermarketCategoryRelation]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createSupermarketCategoryRelation:function createSupermarketCategoryRelation(supermarketCategoryRelation,options){return localVarFp.createSupermarketCategoryRelation(supermarketCategoryRelation,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {Sync} [sync]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createSync:function createSync(sync,options){return localVarFp.createSync(sync,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {Unit} [unit]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createUnit:function createUnit(unit,options){return localVarFp.createUnit(unit,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} name
         * @param {any} [file]
         * @param {number} [fileSizeKb]
         * @param {number} [id]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createUserFile:function createUserFile(name,file,fileSizeKb,id,options){return localVarFp.createUserFile(name,file,fileSizeKb,id,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {UserPreference} [userPreference]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createUserPreference:function createUserPreference(userPreference,options){return localVarFp.createUserPreference(userPreference,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {ViewLog} [viewLog]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */createViewLog:function createViewLog(viewLog,options){return localVarFp.createViewLog(viewLog,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this bookmarklet import.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyBookmarkletImport:function destroyBookmarkletImport(id,options){return localVarFp.destroyBookmarkletImport(id,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this cook log.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyCookLog:function destroyCookLog(id,options){return localVarFp.destroyCookLog(id,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this food.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyFood:function destroyFood(id,options){return localVarFp.destroyFood(id,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this import log.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyImportLog:function destroyImportLog(id,options){return localVarFp.destroyImportLog(id,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this ingredient.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyIngredient:function destroyIngredient(id,options){return localVarFp.destroyIngredient(id,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this keyword.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyKeyword:function destroyKeyword(id,options){return localVarFp.destroyKeyword(id,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this meal plan.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyMealPlan:function destroyMealPlan(id,options){return localVarFp.destroyMealPlan(id,options).then(function(request){return request(axios,basePath);});},/**
         * returns list of meal types created by the requesting user ordered by the order field.
         * @param {string} id A unique integer value identifying this meal type.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyMealType:function destroyMealType(id,options){return localVarFp.destroyMealType(id,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this recipe.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyRecipe:function destroyRecipe(id,options){return localVarFp.destroyRecipe(id,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this recipe book.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyRecipeBook:function destroyRecipeBook(id,options){return localVarFp.destroyRecipeBook(id,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this recipe book entry.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyRecipeBookEntry:function destroyRecipeBookEntry(id,options){return localVarFp.destroyRecipeBookEntry(id,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this shopping list.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyShoppingList:function destroyShoppingList(id,options){return localVarFp.destroyShoppingList(id,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this shopping list entry.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyShoppingListEntry:function destroyShoppingListEntry(id,options){return localVarFp.destroyShoppingListEntry(id,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this shopping list recipe.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyShoppingListRecipe:function destroyShoppingListRecipe(id,options){return localVarFp.destroyShoppingListRecipe(id,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this step.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyStep:function destroyStep(id,options){return localVarFp.destroyStep(id,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this storage.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyStorage:function destroyStorage(id,options){return localVarFp.destroyStorage(id,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this supermarket.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroySupermarket:function destroySupermarket(id,options){return localVarFp.destroySupermarket(id,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this supermarket category.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroySupermarketCategory:function destroySupermarketCategory(id,options){return localVarFp.destroySupermarketCategory(id,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this supermarket category relation.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroySupermarketCategoryRelation:function destroySupermarketCategoryRelation(id,options){return localVarFp.destroySupermarketCategoryRelation(id,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this sync.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroySync:function destroySync(id,options){return localVarFp.destroySync(id,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this unit.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyUnit:function destroyUnit(id,options){return localVarFp.destroyUnit(id,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this user file.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyUserFile:function destroyUserFile(id,options){return localVarFp.destroyUserFile(id,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} user A unique value identifying this user preference.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyUserPreference:function destroyUserPreference(user,options){return localVarFp.destroyUserPreference(user,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this view log.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */destroyViewLog:function destroyViewLog(id,options){return localVarFp.destroyViewLog(id,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this recipe.
         * @param {any} [image]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */imageRecipe:function imageRecipe(id,image,options){return localVarFp.imageRecipe(id,image,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listBookmarkletImports:function listBookmarkletImports(options){return localVarFp.listBookmarkletImports(options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listCookLogs:function listCookLogs(options){return localVarFp.listCookLogs(options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} [query] Query string matched against food name.
         * @param {number} [root] Return first level children of food with ID [int].  Integer 0 will return root foods.
         * @param {number} [tree] Return all self and children of food with ID [int].
         * @param {number} [page] A page number within the paginated result set.
         * @param {number} [pageSize] Number of results to return per page.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listFoods:function listFoods(query,root,tree,page,pageSize,options){return localVarFp.listFoods(query,root,tree,page,pageSize,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listImportLogs:function listImportLogs(options){return localVarFp.listImportLogs(options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listIngredients:function listIngredients(options){return localVarFp.listIngredients(options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} [query] Query string matched against keyword name.
         * @param {number} [root] Return first level children of keyword with ID [int].  Integer 0 will return root keywords.
         * @param {number} [tree] Return all self and children of keyword with ID [int].
         * @param {number} [page] A page number within the paginated result set.
         * @param {number} [pageSize] Number of results to return per page.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listKeywords:function listKeywords(query,root,tree,page,pageSize,options){return localVarFp.listKeywords(query,root,tree,page,pageSize,options).then(function(request){return request(axios,basePath);});},/**
         * optional parameters  - **from_date**: filter from (inclusive) a certain date onward - **to_date**: filter upward to (inclusive) certain date
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listMealPlans:function listMealPlans(options){return localVarFp.listMealPlans(options).then(function(request){return request(axios,basePath);});},/**
         * returns list of meal types created by the requesting user ordered by the order field.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listMealTypes:function listMealTypes(options){return localVarFp.listMealTypes(options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listRecipeBookEntrys:function listRecipeBookEntrys(options){return localVarFp.listRecipeBookEntrys(options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listRecipeBooks:function listRecipeBooks(options){return localVarFp.listRecipeBooks(options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} [query] Query string matched (fuzzy) against recipe name. In the future also fulltext search.
         * @param {string} [keywords] Id of keyword a recipe should have. For multiple repeat parameter.
         * @param {string} [foods] Id of food a recipe should have. For multiple repeat parameter.
         * @param {string} [books] Id of book a recipe should have. For multiple repeat parameter.
         * @param {string} [keywordsOr] If recipe should have all (AND) or any (OR) of the provided keywords.
         * @param {string} [foodsOr] If recipe should have all (AND) or any (OR) any of the provided foods.
         * @param {string} [booksOr] If recipe should be in all (AND) or any (OR) any of the provided books.
         * @param {string} [internal] true or false. If only internal recipes should be returned or not.
         * @param {string} [random] true or false. returns the results in randomized order.
         * @param {string} [_new] true or false. returns new results first in search results
         * @param {number} [page] A page number within the paginated result set.
         * @param {number} [pageSize] Number of results to return per page.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listRecipes:function listRecipes(query,keywords,foods,books,keywordsOr,foodsOr,booksOr,internal,random,_new,page,pageSize,options){return localVarFp.listRecipes(query,keywords,foods,books,keywordsOr,foodsOr,booksOr,internal,random,_new,page,pageSize,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listShoppingListEntrys:function listShoppingListEntrys(options){return localVarFp.listShoppingListEntrys(options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listShoppingListRecipes:function listShoppingListRecipes(options){return localVarFp.listShoppingListRecipes(options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listShoppingLists:function listShoppingLists(options){return localVarFp.listShoppingLists(options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listSteps:function listSteps(options){return localVarFp.listSteps(options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listStorages:function listStorages(options){return localVarFp.listStorages(options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {number} [page] A page number within the paginated result set.
         * @param {number} [pageSize] Number of results to return per page.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listSupermarketCategoryRelations:function listSupermarketCategoryRelations(page,pageSize,options){return localVarFp.listSupermarketCategoryRelations(page,pageSize,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listSupermarketCategorys:function listSupermarketCategorys(options){return localVarFp.listSupermarketCategorys(options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listSupermarkets:function listSupermarkets(options){return localVarFp.listSupermarkets(options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listSyncLogs:function listSyncLogs(options){return localVarFp.listSyncLogs(options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listSyncs:function listSyncs(options){return localVarFp.listSyncs(options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listUnits:function listUnits(options){return localVarFp.listUnits(options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listUserFiles:function listUserFiles(options){return localVarFp.listUserFiles(options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listUserPreferences:function listUserPreferences(options){return localVarFp.listUserPreferences(options).then(function(request){return request(axios,basePath);});},/**
         * optional parameters  - **filter_list**: array of user id\'s to get names for
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listUsers:function listUsers(options){return localVarFp.listUsers(options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listViewLogs:function listViewLogs(options){return localVarFp.listViewLogs(options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this food.
         * @param {string} target
         * @param {Food} [food]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */mergeFood:function mergeFood(id,target,food,options){return localVarFp.mergeFood(id,target,food,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this keyword.
         * @param {string} target
         * @param {Keyword} [keyword]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */mergeKeyword:function mergeKeyword(id,target,keyword,options){return localVarFp.mergeKeyword(id,target,keyword,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this food.
         * @param {string} parent
         * @param {Food} [food]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */moveFood:function moveFood(id,parent,food,options){return localVarFp.moveFood(id,parent,food,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this keyword.
         * @param {string} parent
         * @param {Keyword} [keyword]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */moveKeyword:function moveKeyword(id,parent,keyword,options){return localVarFp.moveKeyword(id,parent,keyword,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this bookmarklet import.
         * @param {BookmarkletImport} [bookmarkletImport]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateBookmarkletImport:function partialUpdateBookmarkletImport(id,bookmarkletImport,options){return localVarFp.partialUpdateBookmarkletImport(id,bookmarkletImport,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this cook log.
         * @param {CookLog} [cookLog]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateCookLog:function partialUpdateCookLog(id,cookLog,options){return localVarFp.partialUpdateCookLog(id,cookLog,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this food.
         * @param {Food} [food]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateFood:function partialUpdateFood(id,food,options){return localVarFp.partialUpdateFood(id,food,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this import log.
         * @param {ImportLog} [importLog]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateImportLog:function partialUpdateImportLog(id,importLog,options){return localVarFp.partialUpdateImportLog(id,importLog,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this ingredient.
         * @param {Ingredient} [ingredient]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateIngredient:function partialUpdateIngredient(id,ingredient,options){return localVarFp.partialUpdateIngredient(id,ingredient,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this keyword.
         * @param {Keyword} [keyword]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateKeyword:function partialUpdateKeyword(id,keyword,options){return localVarFp.partialUpdateKeyword(id,keyword,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this meal plan.
         * @param {MealPlan} [mealPlan]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateMealPlan:function partialUpdateMealPlan(id,mealPlan,options){return localVarFp.partialUpdateMealPlan(id,mealPlan,options).then(function(request){return request(axios,basePath);});},/**
         * returns list of meal types created by the requesting user ordered by the order field.
         * @param {string} id A unique integer value identifying this meal type.
         * @param {MealType} [mealType]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateMealType:function partialUpdateMealType(id,mealType,options){return localVarFp.partialUpdateMealType(id,mealType,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this recipe.
         * @param {Recipe} [recipe]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateRecipe:function partialUpdateRecipe(id,recipe,options){return localVarFp.partialUpdateRecipe(id,recipe,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this recipe book.
         * @param {RecipeBook} [recipeBook]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateRecipeBook:function partialUpdateRecipeBook(id,recipeBook,options){return localVarFp.partialUpdateRecipeBook(id,recipeBook,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this recipe book entry.
         * @param {RecipeBookEntry} [recipeBookEntry]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateRecipeBookEntry:function partialUpdateRecipeBookEntry(id,recipeBookEntry,options){return localVarFp.partialUpdateRecipeBookEntry(id,recipeBookEntry,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this shopping list.
         * @param {ShoppingList} [shoppingList]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateShoppingList:function partialUpdateShoppingList(id,shoppingList,options){return localVarFp.partialUpdateShoppingList(id,shoppingList,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this shopping list entry.
         * @param {ShoppingListEntry} [shoppingListEntry]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateShoppingListEntry:function partialUpdateShoppingListEntry(id,shoppingListEntry,options){return localVarFp.partialUpdateShoppingListEntry(id,shoppingListEntry,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this shopping list recipe.
         * @param {ShoppingListRecipe} [shoppingListRecipe]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateShoppingListRecipe:function partialUpdateShoppingListRecipe(id,shoppingListRecipe,options){return localVarFp.partialUpdateShoppingListRecipe(id,shoppingListRecipe,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this step.
         * @param {Step} [step]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateStep:function partialUpdateStep(id,step,options){return localVarFp.partialUpdateStep(id,step,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this storage.
         * @param {Storage} [storage]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateStorage:function partialUpdateStorage(id,storage,options){return localVarFp.partialUpdateStorage(id,storage,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this supermarket.
         * @param {Supermarket} [supermarket]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateSupermarket:function partialUpdateSupermarket(id,supermarket,options){return localVarFp.partialUpdateSupermarket(id,supermarket,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this supermarket category.
         * @param {SupermarketCategory} [supermarketCategory]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateSupermarketCategory:function partialUpdateSupermarketCategory(id,supermarketCategory,options){return localVarFp.partialUpdateSupermarketCategory(id,supermarketCategory,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this supermarket category relation.
         * @param {SupermarketCategoryRelation} [supermarketCategoryRelation]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateSupermarketCategoryRelation:function partialUpdateSupermarketCategoryRelation(id,supermarketCategoryRelation,options){return localVarFp.partialUpdateSupermarketCategoryRelation(id,supermarketCategoryRelation,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this sync.
         * @param {Sync} [sync]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateSync:function partialUpdateSync(id,sync,options){return localVarFp.partialUpdateSync(id,sync,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this unit.
         * @param {Unit} [unit]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateUnit:function partialUpdateUnit(id,unit,options){return localVarFp.partialUpdateUnit(id,unit,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this user file.
         * @param {string} name
         * @param {any} [file]
         * @param {number} [fileSizeKb]
         * @param {number} [id2]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateUserFile:function partialUpdateUserFile(id,name,file,fileSizeKb,id2,options){return localVarFp.partialUpdateUserFile(id,name,file,fileSizeKb,id2,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} user A unique value identifying this user preference.
         * @param {UserPreference} [userPreference]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateUserPreference:function partialUpdateUserPreference(user,userPreference,options){return localVarFp.partialUpdateUserPreference(user,userPreference,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this view log.
         * @param {ViewLog} [viewLog]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */partialUpdateViewLog:function partialUpdateViewLog(id,viewLog,options){return localVarFp.partialUpdateViewLog(id,viewLog,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this bookmarklet import.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveBookmarkletImport:function retrieveBookmarkletImport(id,options){return localVarFp.retrieveBookmarkletImport(id,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this cook log.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveCookLog:function retrieveCookLog(id,options){return localVarFp.retrieveCookLog(id,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this food.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveFood:function retrieveFood(id,options){return localVarFp.retrieveFood(id,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this import log.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveImportLog:function retrieveImportLog(id,options){return localVarFp.retrieveImportLog(id,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this ingredient.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveIngredient:function retrieveIngredient(id,options){return localVarFp.retrieveIngredient(id,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this keyword.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveKeyword:function retrieveKeyword(id,options){return localVarFp.retrieveKeyword(id,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this meal plan.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveMealPlan:function retrieveMealPlan(id,options){return localVarFp.retrieveMealPlan(id,options).then(function(request){return request(axios,basePath);});},/**
         * returns list of meal types created by the requesting user ordered by the order field.
         * @param {string} id A unique integer value identifying this meal type.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveMealType:function retrieveMealType(id,options){return localVarFp.retrieveMealType(id,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this recipe.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveRecipe:function retrieveRecipe(id,options){return localVarFp.retrieveRecipe(id,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this recipe book.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveRecipeBook:function retrieveRecipeBook(id,options){return localVarFp.retrieveRecipeBook(id,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this recipe book entry.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveRecipeBookEntry:function retrieveRecipeBookEntry(id,options){return localVarFp.retrieveRecipeBookEntry(id,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this shopping list.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveShoppingList:function retrieveShoppingList(id,options){return localVarFp.retrieveShoppingList(id,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this shopping list entry.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveShoppingListEntry:function retrieveShoppingListEntry(id,options){return localVarFp.retrieveShoppingListEntry(id,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this shopping list recipe.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveShoppingListRecipe:function retrieveShoppingListRecipe(id,options){return localVarFp.retrieveShoppingListRecipe(id,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this step.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveStep:function retrieveStep(id,options){return localVarFp.retrieveStep(id,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this storage.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveStorage:function retrieveStorage(id,options){return localVarFp.retrieveStorage(id,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this supermarket.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveSupermarket:function retrieveSupermarket(id,options){return localVarFp.retrieveSupermarket(id,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this supermarket category.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveSupermarketCategory:function retrieveSupermarketCategory(id,options){return localVarFp.retrieveSupermarketCategory(id,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this supermarket category relation.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveSupermarketCategoryRelation:function retrieveSupermarketCategoryRelation(id,options){return localVarFp.retrieveSupermarketCategoryRelation(id,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this sync.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveSync:function retrieveSync(id,options){return localVarFp.retrieveSync(id,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this sync log.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveSyncLog:function retrieveSyncLog(id,options){return localVarFp.retrieveSyncLog(id,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this unit.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveUnit:function retrieveUnit(id,options){return localVarFp.retrieveUnit(id,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this user.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveUser:function retrieveUser(id,options){return localVarFp.retrieveUser(id,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this user file.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveUserFile:function retrieveUserFile(id,options){return localVarFp.retrieveUserFile(id,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} user A unique value identifying this user preference.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveUserPreference:function retrieveUserPreference(user,options){return localVarFp.retrieveUserPreference(user,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this view log.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */retrieveViewLog:function retrieveViewLog(id,options){return localVarFp.retrieveViewLog(id,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this bookmarklet import.
         * @param {BookmarkletImport} [bookmarkletImport]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateBookmarkletImport:function updateBookmarkletImport(id,bookmarkletImport,options){return localVarFp.updateBookmarkletImport(id,bookmarkletImport,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this cook log.
         * @param {CookLog} [cookLog]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateCookLog:function updateCookLog(id,cookLog,options){return localVarFp.updateCookLog(id,cookLog,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this food.
         * @param {Food} [food]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateFood:function updateFood(id,food,options){return localVarFp.updateFood(id,food,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this import log.
         * @param {ImportLog} [importLog]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateImportLog:function updateImportLog(id,importLog,options){return localVarFp.updateImportLog(id,importLog,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this ingredient.
         * @param {Ingredient} [ingredient]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateIngredient:function updateIngredient(id,ingredient,options){return localVarFp.updateIngredient(id,ingredient,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this keyword.
         * @param {Keyword} [keyword]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateKeyword:function updateKeyword(id,keyword,options){return localVarFp.updateKeyword(id,keyword,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this meal plan.
         * @param {MealPlan} [mealPlan]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateMealPlan:function updateMealPlan(id,mealPlan,options){return localVarFp.updateMealPlan(id,mealPlan,options).then(function(request){return request(axios,basePath);});},/**
         * returns list of meal types created by the requesting user ordered by the order field.
         * @param {string} id A unique integer value identifying this meal type.
         * @param {MealType} [mealType]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateMealType:function updateMealType(id,mealType,options){return localVarFp.updateMealType(id,mealType,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this recipe.
         * @param {Recipe} [recipe]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateRecipe:function updateRecipe(id,recipe,options){return localVarFp.updateRecipe(id,recipe,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this recipe book.
         * @param {RecipeBook} [recipeBook]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateRecipeBook:function updateRecipeBook(id,recipeBook,options){return localVarFp.updateRecipeBook(id,recipeBook,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this recipe book entry.
         * @param {RecipeBookEntry} [recipeBookEntry]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateRecipeBookEntry:function updateRecipeBookEntry(id,recipeBookEntry,options){return localVarFp.updateRecipeBookEntry(id,recipeBookEntry,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this shopping list.
         * @param {ShoppingList} [shoppingList]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateShoppingList:function updateShoppingList(id,shoppingList,options){return localVarFp.updateShoppingList(id,shoppingList,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this shopping list entry.
         * @param {ShoppingListEntry} [shoppingListEntry]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateShoppingListEntry:function updateShoppingListEntry(id,shoppingListEntry,options){return localVarFp.updateShoppingListEntry(id,shoppingListEntry,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this shopping list recipe.
         * @param {ShoppingListRecipe} [shoppingListRecipe]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateShoppingListRecipe:function updateShoppingListRecipe(id,shoppingListRecipe,options){return localVarFp.updateShoppingListRecipe(id,shoppingListRecipe,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this step.
         * @param {Step} [step]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateStep:function updateStep(id,step,options){return localVarFp.updateStep(id,step,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this storage.
         * @param {Storage} [storage]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateStorage:function updateStorage(id,storage,options){return localVarFp.updateStorage(id,storage,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this supermarket.
         * @param {Supermarket} [supermarket]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateSupermarket:function updateSupermarket(id,supermarket,options){return localVarFp.updateSupermarket(id,supermarket,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this supermarket category.
         * @param {SupermarketCategory} [supermarketCategory]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateSupermarketCategory:function updateSupermarketCategory(id,supermarketCategory,options){return localVarFp.updateSupermarketCategory(id,supermarketCategory,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this supermarket category relation.
         * @param {SupermarketCategoryRelation} [supermarketCategoryRelation]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateSupermarketCategoryRelation:function updateSupermarketCategoryRelation(id,supermarketCategoryRelation,options){return localVarFp.updateSupermarketCategoryRelation(id,supermarketCategoryRelation,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this sync.
         * @param {Sync} [sync]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateSync:function updateSync(id,sync,options){return localVarFp.updateSync(id,sync,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this unit.
         * @param {Unit} [unit]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateUnit:function updateUnit(id,unit,options){return localVarFp.updateUnit(id,unit,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this user file.
         * @param {string} name
         * @param {any} [file]
         * @param {number} [fileSizeKb]
         * @param {number} [id2]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateUserFile:function updateUserFile(id,name,file,fileSizeKb,id2,options){return localVarFp.updateUserFile(id,name,file,fileSizeKb,id2,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} user A unique value identifying this user preference.
         * @param {UserPreference} [userPreference]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateUserPreference:function updateUserPreference(user,userPreference,options){return localVarFp.updateUserPreference(user,userPreference,options).then(function(request){return request(axios,basePath);});},/**
         *
         * @param {string} id A unique integer value identifying this view log.
         * @param {ViewLog} [viewLog]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */updateViewLog:function updateViewLog(id,viewLog,options){return localVarFp.updateViewLog(id,viewLog,options).then(function(request){return request(axios,basePath);});}};};/**
 * ApiApi - object-oriented interface
 * @export
 * @class ApiApi
 * @extends {BaseAPI}
 */var api_ApiApi=/** @class */function(_super){Object(tslib_es6["c" /* __extends */])(ApiApi,_super);function ApiApi(){return _super!==null&&_super.apply(this,arguments)||this;}/**
     *
     * @param {BookmarkletImport} [bookmarkletImport]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.createBookmarkletImport=function(bookmarkletImport,options){var _this=this;return api_ApiApiFp(this.configuration).createBookmarkletImport(bookmarkletImport,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {CookLog} [cookLog]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.createCookLog=function(cookLog,options){var _this=this;return api_ApiApiFp(this.configuration).createCookLog(cookLog,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {Food} [food]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.createFood=function(food,options){var _this=this;return api_ApiApiFp(this.configuration).createFood(food,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {ImportLog} [importLog]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.createImportLog=function(importLog,options){var _this=this;return api_ApiApiFp(this.configuration).createImportLog(importLog,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {Ingredient} [ingredient]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.createIngredient=function(ingredient,options){var _this=this;return api_ApiApiFp(this.configuration).createIngredient(ingredient,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {Keyword} [keyword]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.createKeyword=function(keyword,options){var _this=this;return api_ApiApiFp(this.configuration).createKeyword(keyword,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {MealPlan} [mealPlan]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.createMealPlan=function(mealPlan,options){var _this=this;return api_ApiApiFp(this.configuration).createMealPlan(mealPlan,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     * returns list of meal types created by the requesting user ordered by the order field.
     * @param {MealType} [mealType]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.createMealType=function(mealType,options){var _this=this;return api_ApiApiFp(this.configuration).createMealType(mealType,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {Recipe} [recipe]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.createRecipe=function(recipe,options){var _this=this;return api_ApiApiFp(this.configuration).createRecipe(recipe,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {RecipeBook} [recipeBook]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.createRecipeBook=function(recipeBook,options){var _this=this;return api_ApiApiFp(this.configuration).createRecipeBook(recipeBook,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {RecipeBookEntry} [recipeBookEntry]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.createRecipeBookEntry=function(recipeBookEntry,options){var _this=this;return api_ApiApiFp(this.configuration).createRecipeBookEntry(recipeBookEntry,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {ShoppingList} [shoppingList]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.createShoppingList=function(shoppingList,options){var _this=this;return api_ApiApiFp(this.configuration).createShoppingList(shoppingList,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {ShoppingListEntry} [shoppingListEntry]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.createShoppingListEntry=function(shoppingListEntry,options){var _this=this;return api_ApiApiFp(this.configuration).createShoppingListEntry(shoppingListEntry,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {ShoppingListRecipe} [shoppingListRecipe]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.createShoppingListRecipe=function(shoppingListRecipe,options){var _this=this;return api_ApiApiFp(this.configuration).createShoppingListRecipe(shoppingListRecipe,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {Step} [step]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.createStep=function(step,options){var _this=this;return api_ApiApiFp(this.configuration).createStep(step,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {Storage} [storage]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.createStorage=function(storage,options){var _this=this;return api_ApiApiFp(this.configuration).createStorage(storage,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {Supermarket} [supermarket]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.createSupermarket=function(supermarket,options){var _this=this;return api_ApiApiFp(this.configuration).createSupermarket(supermarket,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {SupermarketCategory} [supermarketCategory]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.createSupermarketCategory=function(supermarketCategory,options){var _this=this;return api_ApiApiFp(this.configuration).createSupermarketCategory(supermarketCategory,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {SupermarketCategoryRelation} [supermarketCategoryRelation]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.createSupermarketCategoryRelation=function(supermarketCategoryRelation,options){var _this=this;return api_ApiApiFp(this.configuration).createSupermarketCategoryRelation(supermarketCategoryRelation,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {Sync} [sync]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.createSync=function(sync,options){var _this=this;return api_ApiApiFp(this.configuration).createSync(sync,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {Unit} [unit]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.createUnit=function(unit,options){var _this=this;return api_ApiApiFp(this.configuration).createUnit(unit,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} name
     * @param {any} [file]
     * @param {number} [fileSizeKb]
     * @param {number} [id]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.createUserFile=function(name,file,fileSizeKb,id,options){var _this=this;return api_ApiApiFp(this.configuration).createUserFile(name,file,fileSizeKb,id,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {UserPreference} [userPreference]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.createUserPreference=function(userPreference,options){var _this=this;return api_ApiApiFp(this.configuration).createUserPreference(userPreference,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {ViewLog} [viewLog]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.createViewLog=function(viewLog,options){var _this=this;return api_ApiApiFp(this.configuration).createViewLog(viewLog,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this bookmarklet import.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.destroyBookmarkletImport=function(id,options){var _this=this;return api_ApiApiFp(this.configuration).destroyBookmarkletImport(id,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this cook log.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.destroyCookLog=function(id,options){var _this=this;return api_ApiApiFp(this.configuration).destroyCookLog(id,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this food.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.destroyFood=function(id,options){var _this=this;return api_ApiApiFp(this.configuration).destroyFood(id,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this import log.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.destroyImportLog=function(id,options){var _this=this;return api_ApiApiFp(this.configuration).destroyImportLog(id,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this ingredient.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.destroyIngredient=function(id,options){var _this=this;return api_ApiApiFp(this.configuration).destroyIngredient(id,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this keyword.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.destroyKeyword=function(id,options){var _this=this;return api_ApiApiFp(this.configuration).destroyKeyword(id,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this meal plan.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.destroyMealPlan=function(id,options){var _this=this;return api_ApiApiFp(this.configuration).destroyMealPlan(id,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     * returns list of meal types created by the requesting user ordered by the order field.
     * @param {string} id A unique integer value identifying this meal type.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.destroyMealType=function(id,options){var _this=this;return api_ApiApiFp(this.configuration).destroyMealType(id,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this recipe.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.destroyRecipe=function(id,options){var _this=this;return api_ApiApiFp(this.configuration).destroyRecipe(id,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this recipe book.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.destroyRecipeBook=function(id,options){var _this=this;return api_ApiApiFp(this.configuration).destroyRecipeBook(id,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this recipe book entry.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.destroyRecipeBookEntry=function(id,options){var _this=this;return api_ApiApiFp(this.configuration).destroyRecipeBookEntry(id,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this shopping list.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.destroyShoppingList=function(id,options){var _this=this;return api_ApiApiFp(this.configuration).destroyShoppingList(id,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this shopping list entry.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.destroyShoppingListEntry=function(id,options){var _this=this;return api_ApiApiFp(this.configuration).destroyShoppingListEntry(id,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this shopping list recipe.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.destroyShoppingListRecipe=function(id,options){var _this=this;return api_ApiApiFp(this.configuration).destroyShoppingListRecipe(id,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this step.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.destroyStep=function(id,options){var _this=this;return api_ApiApiFp(this.configuration).destroyStep(id,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this storage.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.destroyStorage=function(id,options){var _this=this;return api_ApiApiFp(this.configuration).destroyStorage(id,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this supermarket.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.destroySupermarket=function(id,options){var _this=this;return api_ApiApiFp(this.configuration).destroySupermarket(id,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this supermarket category.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.destroySupermarketCategory=function(id,options){var _this=this;return api_ApiApiFp(this.configuration).destroySupermarketCategory(id,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this supermarket category relation.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.destroySupermarketCategoryRelation=function(id,options){var _this=this;return api_ApiApiFp(this.configuration).destroySupermarketCategoryRelation(id,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this sync.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.destroySync=function(id,options){var _this=this;return api_ApiApiFp(this.configuration).destroySync(id,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this unit.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.destroyUnit=function(id,options){var _this=this;return api_ApiApiFp(this.configuration).destroyUnit(id,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this user file.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.destroyUserFile=function(id,options){var _this=this;return api_ApiApiFp(this.configuration).destroyUserFile(id,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} user A unique value identifying this user preference.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.destroyUserPreference=function(user,options){var _this=this;return api_ApiApiFp(this.configuration).destroyUserPreference(user,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this view log.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.destroyViewLog=function(id,options){var _this=this;return api_ApiApiFp(this.configuration).destroyViewLog(id,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this recipe.
     * @param {any} [image]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.imageRecipe=function(id,image,options){var _this=this;return api_ApiApiFp(this.configuration).imageRecipe(id,image,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.listBookmarkletImports=function(options){var _this=this;return api_ApiApiFp(this.configuration).listBookmarkletImports(options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.listCookLogs=function(options){var _this=this;return api_ApiApiFp(this.configuration).listCookLogs(options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} [query] Query string matched against food name.
     * @param {number} [root] Return first level children of food with ID [int].  Integer 0 will return root foods.
     * @param {number} [tree] Return all self and children of food with ID [int].
     * @param {number} [page] A page number within the paginated result set.
     * @param {number} [pageSize] Number of results to return per page.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.listFoods=function(query,root,tree,page,pageSize,options){var _this=this;return api_ApiApiFp(this.configuration).listFoods(query,root,tree,page,pageSize,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.listImportLogs=function(options){var _this=this;return api_ApiApiFp(this.configuration).listImportLogs(options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.listIngredients=function(options){var _this=this;return api_ApiApiFp(this.configuration).listIngredients(options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} [query] Query string matched against keyword name.
     * @param {number} [root] Return first level children of keyword with ID [int].  Integer 0 will return root keywords.
     * @param {number} [tree] Return all self and children of keyword with ID [int].
     * @param {number} [page] A page number within the paginated result set.
     * @param {number} [pageSize] Number of results to return per page.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.listKeywords=function(query,root,tree,page,pageSize,options){var _this=this;return api_ApiApiFp(this.configuration).listKeywords(query,root,tree,page,pageSize,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     * optional parameters  - **from_date**: filter from (inclusive) a certain date onward - **to_date**: filter upward to (inclusive) certain date
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.listMealPlans=function(options){var _this=this;return api_ApiApiFp(this.configuration).listMealPlans(options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     * returns list of meal types created by the requesting user ordered by the order field.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.listMealTypes=function(options){var _this=this;return api_ApiApiFp(this.configuration).listMealTypes(options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.listRecipeBookEntrys=function(options){var _this=this;return api_ApiApiFp(this.configuration).listRecipeBookEntrys(options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.listRecipeBooks=function(options){var _this=this;return api_ApiApiFp(this.configuration).listRecipeBooks(options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} [query] Query string matched (fuzzy) against recipe name. In the future also fulltext search.
     * @param {string} [keywords] Id of keyword a recipe should have. For multiple repeat parameter.
     * @param {string} [foods] Id of food a recipe should have. For multiple repeat parameter.
     * @param {string} [books] Id of book a recipe should have. For multiple repeat parameter.
     * @param {string} [keywordsOr] If recipe should have all (AND) or any (OR) of the provided keywords.
     * @param {string} [foodsOr] If recipe should have all (AND) or any (OR) any of the provided foods.
     * @param {string} [booksOr] If recipe should be in all (AND) or any (OR) any of the provided books.
     * @param {string} [internal] true or false. If only internal recipes should be returned or not.
     * @param {string} [random] true or false. returns the results in randomized order.
     * @param {string} [_new] true or false. returns new results first in search results
     * @param {number} [page] A page number within the paginated result set.
     * @param {number} [pageSize] Number of results to return per page.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.listRecipes=function(query,keywords,foods,books,keywordsOr,foodsOr,booksOr,internal,random,_new,page,pageSize,options){var _this=this;return api_ApiApiFp(this.configuration).listRecipes(query,keywords,foods,books,keywordsOr,foodsOr,booksOr,internal,random,_new,page,pageSize,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.listShoppingListEntrys=function(options){var _this=this;return api_ApiApiFp(this.configuration).listShoppingListEntrys(options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.listShoppingListRecipes=function(options){var _this=this;return api_ApiApiFp(this.configuration).listShoppingListRecipes(options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.listShoppingLists=function(options){var _this=this;return api_ApiApiFp(this.configuration).listShoppingLists(options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.listSteps=function(options){var _this=this;return api_ApiApiFp(this.configuration).listSteps(options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.listStorages=function(options){var _this=this;return api_ApiApiFp(this.configuration).listStorages(options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {number} [page] A page number within the paginated result set.
     * @param {number} [pageSize] Number of results to return per page.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.listSupermarketCategoryRelations=function(page,pageSize,options){var _this=this;return api_ApiApiFp(this.configuration).listSupermarketCategoryRelations(page,pageSize,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.listSupermarketCategorys=function(options){var _this=this;return api_ApiApiFp(this.configuration).listSupermarketCategorys(options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.listSupermarkets=function(options){var _this=this;return api_ApiApiFp(this.configuration).listSupermarkets(options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.listSyncLogs=function(options){var _this=this;return api_ApiApiFp(this.configuration).listSyncLogs(options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.listSyncs=function(options){var _this=this;return api_ApiApiFp(this.configuration).listSyncs(options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.listUnits=function(options){var _this=this;return api_ApiApiFp(this.configuration).listUnits(options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.listUserFiles=function(options){var _this=this;return api_ApiApiFp(this.configuration).listUserFiles(options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.listUserPreferences=function(options){var _this=this;return api_ApiApiFp(this.configuration).listUserPreferences(options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     * optional parameters  - **filter_list**: array of user id\'s to get names for
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.listUsers=function(options){var _this=this;return api_ApiApiFp(this.configuration).listUsers(options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.listViewLogs=function(options){var _this=this;return api_ApiApiFp(this.configuration).listViewLogs(options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this food.
     * @param {string} target
     * @param {Food} [food]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.mergeFood=function(id,target,food,options){var _this=this;return api_ApiApiFp(this.configuration).mergeFood(id,target,food,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this keyword.
     * @param {string} target
     * @param {Keyword} [keyword]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.mergeKeyword=function(id,target,keyword,options){var _this=this;return api_ApiApiFp(this.configuration).mergeKeyword(id,target,keyword,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this food.
     * @param {string} parent
     * @param {Food} [food]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.moveFood=function(id,parent,food,options){var _this=this;return api_ApiApiFp(this.configuration).moveFood(id,parent,food,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this keyword.
     * @param {string} parent
     * @param {Keyword} [keyword]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.moveKeyword=function(id,parent,keyword,options){var _this=this;return api_ApiApiFp(this.configuration).moveKeyword(id,parent,keyword,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this bookmarklet import.
     * @param {BookmarkletImport} [bookmarkletImport]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.partialUpdateBookmarkletImport=function(id,bookmarkletImport,options){var _this=this;return api_ApiApiFp(this.configuration).partialUpdateBookmarkletImport(id,bookmarkletImport,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this cook log.
     * @param {CookLog} [cookLog]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.partialUpdateCookLog=function(id,cookLog,options){var _this=this;return api_ApiApiFp(this.configuration).partialUpdateCookLog(id,cookLog,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this food.
     * @param {Food} [food]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.partialUpdateFood=function(id,food,options){var _this=this;return api_ApiApiFp(this.configuration).partialUpdateFood(id,food,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this import log.
     * @param {ImportLog} [importLog]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.partialUpdateImportLog=function(id,importLog,options){var _this=this;return api_ApiApiFp(this.configuration).partialUpdateImportLog(id,importLog,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this ingredient.
     * @param {Ingredient} [ingredient]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.partialUpdateIngredient=function(id,ingredient,options){var _this=this;return api_ApiApiFp(this.configuration).partialUpdateIngredient(id,ingredient,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this keyword.
     * @param {Keyword} [keyword]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.partialUpdateKeyword=function(id,keyword,options){var _this=this;return api_ApiApiFp(this.configuration).partialUpdateKeyword(id,keyword,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this meal plan.
     * @param {MealPlan} [mealPlan]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.partialUpdateMealPlan=function(id,mealPlan,options){var _this=this;return api_ApiApiFp(this.configuration).partialUpdateMealPlan(id,mealPlan,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     * returns list of meal types created by the requesting user ordered by the order field.
     * @param {string} id A unique integer value identifying this meal type.
     * @param {MealType} [mealType]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.partialUpdateMealType=function(id,mealType,options){var _this=this;return api_ApiApiFp(this.configuration).partialUpdateMealType(id,mealType,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this recipe.
     * @param {Recipe} [recipe]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.partialUpdateRecipe=function(id,recipe,options){var _this=this;return api_ApiApiFp(this.configuration).partialUpdateRecipe(id,recipe,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this recipe book.
     * @param {RecipeBook} [recipeBook]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.partialUpdateRecipeBook=function(id,recipeBook,options){var _this=this;return api_ApiApiFp(this.configuration).partialUpdateRecipeBook(id,recipeBook,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this recipe book entry.
     * @param {RecipeBookEntry} [recipeBookEntry]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.partialUpdateRecipeBookEntry=function(id,recipeBookEntry,options){var _this=this;return api_ApiApiFp(this.configuration).partialUpdateRecipeBookEntry(id,recipeBookEntry,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this shopping list.
     * @param {ShoppingList} [shoppingList]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.partialUpdateShoppingList=function(id,shoppingList,options){var _this=this;return api_ApiApiFp(this.configuration).partialUpdateShoppingList(id,shoppingList,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this shopping list entry.
     * @param {ShoppingListEntry} [shoppingListEntry]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.partialUpdateShoppingListEntry=function(id,shoppingListEntry,options){var _this=this;return api_ApiApiFp(this.configuration).partialUpdateShoppingListEntry(id,shoppingListEntry,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this shopping list recipe.
     * @param {ShoppingListRecipe} [shoppingListRecipe]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.partialUpdateShoppingListRecipe=function(id,shoppingListRecipe,options){var _this=this;return api_ApiApiFp(this.configuration).partialUpdateShoppingListRecipe(id,shoppingListRecipe,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this step.
     * @param {Step} [step]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.partialUpdateStep=function(id,step,options){var _this=this;return api_ApiApiFp(this.configuration).partialUpdateStep(id,step,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this storage.
     * @param {Storage} [storage]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.partialUpdateStorage=function(id,storage,options){var _this=this;return api_ApiApiFp(this.configuration).partialUpdateStorage(id,storage,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this supermarket.
     * @param {Supermarket} [supermarket]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.partialUpdateSupermarket=function(id,supermarket,options){var _this=this;return api_ApiApiFp(this.configuration).partialUpdateSupermarket(id,supermarket,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this supermarket category.
     * @param {SupermarketCategory} [supermarketCategory]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.partialUpdateSupermarketCategory=function(id,supermarketCategory,options){var _this=this;return api_ApiApiFp(this.configuration).partialUpdateSupermarketCategory(id,supermarketCategory,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this supermarket category relation.
     * @param {SupermarketCategoryRelation} [supermarketCategoryRelation]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.partialUpdateSupermarketCategoryRelation=function(id,supermarketCategoryRelation,options){var _this=this;return api_ApiApiFp(this.configuration).partialUpdateSupermarketCategoryRelation(id,supermarketCategoryRelation,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this sync.
     * @param {Sync} [sync]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.partialUpdateSync=function(id,sync,options){var _this=this;return api_ApiApiFp(this.configuration).partialUpdateSync(id,sync,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this unit.
     * @param {Unit} [unit]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.partialUpdateUnit=function(id,unit,options){var _this=this;return api_ApiApiFp(this.configuration).partialUpdateUnit(id,unit,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this user file.
     * @param {string} name
     * @param {any} [file]
     * @param {number} [fileSizeKb]
     * @param {number} [id2]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.partialUpdateUserFile=function(id,name,file,fileSizeKb,id2,options){var _this=this;return api_ApiApiFp(this.configuration).partialUpdateUserFile(id,name,file,fileSizeKb,id2,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} user A unique value identifying this user preference.
     * @param {UserPreference} [userPreference]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.partialUpdateUserPreference=function(user,userPreference,options){var _this=this;return api_ApiApiFp(this.configuration).partialUpdateUserPreference(user,userPreference,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this view log.
     * @param {ViewLog} [viewLog]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.partialUpdateViewLog=function(id,viewLog,options){var _this=this;return api_ApiApiFp(this.configuration).partialUpdateViewLog(id,viewLog,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this bookmarklet import.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.retrieveBookmarkletImport=function(id,options){var _this=this;return api_ApiApiFp(this.configuration).retrieveBookmarkletImport(id,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this cook log.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.retrieveCookLog=function(id,options){var _this=this;return api_ApiApiFp(this.configuration).retrieveCookLog(id,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this food.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.retrieveFood=function(id,options){var _this=this;return api_ApiApiFp(this.configuration).retrieveFood(id,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this import log.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.retrieveImportLog=function(id,options){var _this=this;return api_ApiApiFp(this.configuration).retrieveImportLog(id,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this ingredient.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.retrieveIngredient=function(id,options){var _this=this;return api_ApiApiFp(this.configuration).retrieveIngredient(id,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this keyword.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.retrieveKeyword=function(id,options){var _this=this;return api_ApiApiFp(this.configuration).retrieveKeyword(id,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this meal plan.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.retrieveMealPlan=function(id,options){var _this=this;return api_ApiApiFp(this.configuration).retrieveMealPlan(id,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     * returns list of meal types created by the requesting user ordered by the order field.
     * @param {string} id A unique integer value identifying this meal type.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.retrieveMealType=function(id,options){var _this=this;return api_ApiApiFp(this.configuration).retrieveMealType(id,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this recipe.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.retrieveRecipe=function(id,options){var _this=this;return api_ApiApiFp(this.configuration).retrieveRecipe(id,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this recipe book.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.retrieveRecipeBook=function(id,options){var _this=this;return api_ApiApiFp(this.configuration).retrieveRecipeBook(id,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this recipe book entry.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.retrieveRecipeBookEntry=function(id,options){var _this=this;return api_ApiApiFp(this.configuration).retrieveRecipeBookEntry(id,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this shopping list.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.retrieveShoppingList=function(id,options){var _this=this;return api_ApiApiFp(this.configuration).retrieveShoppingList(id,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this shopping list entry.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.retrieveShoppingListEntry=function(id,options){var _this=this;return api_ApiApiFp(this.configuration).retrieveShoppingListEntry(id,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this shopping list recipe.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.retrieveShoppingListRecipe=function(id,options){var _this=this;return api_ApiApiFp(this.configuration).retrieveShoppingListRecipe(id,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this step.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.retrieveStep=function(id,options){var _this=this;return api_ApiApiFp(this.configuration).retrieveStep(id,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this storage.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.retrieveStorage=function(id,options){var _this=this;return api_ApiApiFp(this.configuration).retrieveStorage(id,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this supermarket.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.retrieveSupermarket=function(id,options){var _this=this;return api_ApiApiFp(this.configuration).retrieveSupermarket(id,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this supermarket category.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.retrieveSupermarketCategory=function(id,options){var _this=this;return api_ApiApiFp(this.configuration).retrieveSupermarketCategory(id,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this supermarket category relation.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.retrieveSupermarketCategoryRelation=function(id,options){var _this=this;return api_ApiApiFp(this.configuration).retrieveSupermarketCategoryRelation(id,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this sync.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.retrieveSync=function(id,options){var _this=this;return api_ApiApiFp(this.configuration).retrieveSync(id,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this sync log.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.retrieveSyncLog=function(id,options){var _this=this;return api_ApiApiFp(this.configuration).retrieveSyncLog(id,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this unit.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.retrieveUnit=function(id,options){var _this=this;return api_ApiApiFp(this.configuration).retrieveUnit(id,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this user.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.retrieveUser=function(id,options){var _this=this;return api_ApiApiFp(this.configuration).retrieveUser(id,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this user file.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.retrieveUserFile=function(id,options){var _this=this;return api_ApiApiFp(this.configuration).retrieveUserFile(id,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} user A unique value identifying this user preference.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.retrieveUserPreference=function(user,options){var _this=this;return api_ApiApiFp(this.configuration).retrieveUserPreference(user,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this view log.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.retrieveViewLog=function(id,options){var _this=this;return api_ApiApiFp(this.configuration).retrieveViewLog(id,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this bookmarklet import.
     * @param {BookmarkletImport} [bookmarkletImport]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.updateBookmarkletImport=function(id,bookmarkletImport,options){var _this=this;return api_ApiApiFp(this.configuration).updateBookmarkletImport(id,bookmarkletImport,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this cook log.
     * @param {CookLog} [cookLog]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.updateCookLog=function(id,cookLog,options){var _this=this;return api_ApiApiFp(this.configuration).updateCookLog(id,cookLog,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this food.
     * @param {Food} [food]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.updateFood=function(id,food,options){var _this=this;return api_ApiApiFp(this.configuration).updateFood(id,food,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this import log.
     * @param {ImportLog} [importLog]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.updateImportLog=function(id,importLog,options){var _this=this;return api_ApiApiFp(this.configuration).updateImportLog(id,importLog,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this ingredient.
     * @param {Ingredient} [ingredient]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.updateIngredient=function(id,ingredient,options){var _this=this;return api_ApiApiFp(this.configuration).updateIngredient(id,ingredient,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this keyword.
     * @param {Keyword} [keyword]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.updateKeyword=function(id,keyword,options){var _this=this;return api_ApiApiFp(this.configuration).updateKeyword(id,keyword,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this meal plan.
     * @param {MealPlan} [mealPlan]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.updateMealPlan=function(id,mealPlan,options){var _this=this;return api_ApiApiFp(this.configuration).updateMealPlan(id,mealPlan,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     * returns list of meal types created by the requesting user ordered by the order field.
     * @param {string} id A unique integer value identifying this meal type.
     * @param {MealType} [mealType]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.updateMealType=function(id,mealType,options){var _this=this;return api_ApiApiFp(this.configuration).updateMealType(id,mealType,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this recipe.
     * @param {Recipe} [recipe]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.updateRecipe=function(id,recipe,options){var _this=this;return api_ApiApiFp(this.configuration).updateRecipe(id,recipe,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this recipe book.
     * @param {RecipeBook} [recipeBook]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.updateRecipeBook=function(id,recipeBook,options){var _this=this;return api_ApiApiFp(this.configuration).updateRecipeBook(id,recipeBook,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this recipe book entry.
     * @param {RecipeBookEntry} [recipeBookEntry]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.updateRecipeBookEntry=function(id,recipeBookEntry,options){var _this=this;return api_ApiApiFp(this.configuration).updateRecipeBookEntry(id,recipeBookEntry,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this shopping list.
     * @param {ShoppingList} [shoppingList]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.updateShoppingList=function(id,shoppingList,options){var _this=this;return api_ApiApiFp(this.configuration).updateShoppingList(id,shoppingList,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this shopping list entry.
     * @param {ShoppingListEntry} [shoppingListEntry]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.updateShoppingListEntry=function(id,shoppingListEntry,options){var _this=this;return api_ApiApiFp(this.configuration).updateShoppingListEntry(id,shoppingListEntry,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this shopping list recipe.
     * @param {ShoppingListRecipe} [shoppingListRecipe]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.updateShoppingListRecipe=function(id,shoppingListRecipe,options){var _this=this;return api_ApiApiFp(this.configuration).updateShoppingListRecipe(id,shoppingListRecipe,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this step.
     * @param {Step} [step]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.updateStep=function(id,step,options){var _this=this;return api_ApiApiFp(this.configuration).updateStep(id,step,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this storage.
     * @param {Storage} [storage]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.updateStorage=function(id,storage,options){var _this=this;return api_ApiApiFp(this.configuration).updateStorage(id,storage,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this supermarket.
     * @param {Supermarket} [supermarket]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.updateSupermarket=function(id,supermarket,options){var _this=this;return api_ApiApiFp(this.configuration).updateSupermarket(id,supermarket,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this supermarket category.
     * @param {SupermarketCategory} [supermarketCategory]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.updateSupermarketCategory=function(id,supermarketCategory,options){var _this=this;return api_ApiApiFp(this.configuration).updateSupermarketCategory(id,supermarketCategory,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this supermarket category relation.
     * @param {SupermarketCategoryRelation} [supermarketCategoryRelation]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.updateSupermarketCategoryRelation=function(id,supermarketCategoryRelation,options){var _this=this;return api_ApiApiFp(this.configuration).updateSupermarketCategoryRelation(id,supermarketCategoryRelation,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this sync.
     * @param {Sync} [sync]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.updateSync=function(id,sync,options){var _this=this;return api_ApiApiFp(this.configuration).updateSync(id,sync,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this unit.
     * @param {Unit} [unit]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.updateUnit=function(id,unit,options){var _this=this;return api_ApiApiFp(this.configuration).updateUnit(id,unit,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this user file.
     * @param {string} name
     * @param {any} [file]
     * @param {number} [fileSizeKb]
     * @param {number} [id2]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.updateUserFile=function(id,name,file,fileSizeKb,id2,options){var _this=this;return api_ApiApiFp(this.configuration).updateUserFile(id,name,file,fileSizeKb,id2,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} user A unique value identifying this user preference.
     * @param {UserPreference} [userPreference]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.updateUserPreference=function(user,userPreference,options){var _this=this;return api_ApiApiFp(this.configuration).updateUserPreference(user,userPreference,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
     *
     * @param {string} id A unique integer value identifying this view log.
     * @param {ViewLog} [viewLog]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.updateViewLog=function(id,viewLog,options){var _this=this;return api_ApiApiFp(this.configuration).updateViewLog(id,viewLog,options).then(function(request){return request(_this.axios,_this.basePath);});};return ApiApi;}(base_BaseAPI);

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

/***/ 5:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__("fd4d");


/***/ }),

/***/ "6ce2":
/***/ (function(module) {

module.exports = JSON.parse("{\"Import\":\"Importieren\",\"import_running\":\"Import läuft, bitte warten!\",\"Import_finished\":\"Import fertig\",\"View_Recipes\":\"Rezepte Ansehen\",\"Information\":\"Information\",\"all_fields_optional\":\"Alle Felder sind optional und können leer gelassen werden.\",\"convert_internal\":\"Zu internem Rezept wandeln\",\"Log_Recipe_Cooking\":\"Kochen protokollieren\",\"External_Recipe_Image\":\"Externes Rezept Bild\",\"Add_to_Book\":\"Zu Buch hinzufügen\",\"Add_to_Shopping\":\"Zu Einkaufsliste hinzufügen\",\"Add_to_Plan\":\"Zu Plan hinzufügen\",\"Step_start_time\":\"Schritt Startzeit\",\"Select_Book\":\"Buch wählen\",\"Recipe_Image\":\"Rezept Bild\",\"Log_Cooking\":\"Kochen protokollieren\",\"Proteins\":\"Proteine\",\"Fats\":\"Fette\",\"Carbohydrates\":\"Kohlenhydrate\",\"Calories\":\"Kalorien\",\"Nutrition\":\"Nährwerte\",\"Keywords\":\"Stichwörter\",\"Books\":\"Bücher\",\"show_only_internal\":\"Nur interne Rezepte anzeigen\",\"Ingredients\":\"Zutaten\",\"min\":\"Min\",\"Servings\":\"Portionen\",\"Waiting\":\"Wartezeit\",\"Preparation\":\"Vorbereitung\",\"Edit\":\"Bearbeiten\",\"Open\":\"Öffnen\",\"Save\":\"Speichern\",\"Step\":\"Schritt\",\"Search\":\"Suchen\",\"Print\":\"Drucken\",\"New_Recipe\":\"Neues Rezept\",\"Url_Import\":\"URL Import\",\"Reset_Search\":\"Suche zurücksetzen\",\"or\":\"oder\",\"and\":\"und\",\"Recently_Viewed\":\"Kürzlich angesehen\",\"External\":\"Extern\",\"Settings\":\"Einstellungen\",\"Meal_Plan\":\"Speiseplan\",\"Date\":\"Datum\",\"Share\":\"Teilen\",\"Export\":\"Exportieren\",\"Rating\":\"Bewertung\",\"Close\":\"Schließen\",\"Add\":\"Hinzufügen\",\"Copy\":\"Kopieren\",\"New\":\"Neu\",\"Categories\":\"Kategorien\",\"Category\":\"Kategorie\",\"Selected\":\"Ausgewählt\",\"Supermarket\":\"Supermarkt\",\"Files\":\"Dateien\",\"Size\":\"Größe\",\"success_fetching_resource\":\"Ressource erfolgreich abgerufen!\",\"Download\":\"Herunterladen\",\"Success\":\"Erfolgreich\",\"err_fetching_resource\":\"Ein Fehler trat während dem Abrufen einer Ressource auf!\",\"err_creating_resource\":\"Ein Fehler trat während dem Erstellen einer Ressource auf!\",\"err_updating_resource\":\"Ein Fehler trat während dem Aktualisieren einer Ressource auf!\",\"success_creating_resource\":\"Ressource erfolgreich erstellt!\",\"success_updating_resource\":\"Ressource erfolgreich aktualisiert!\",\"File\":\"Datei\",\"Delete\":\"Löschen\",\"err_deleting_resource\":\"Ein Fehler trat während dem Löschen einer Ressource auf!\",\"Cancel\":\"Abbrechen\",\"success_deleting_resource\":\"Ressource erfolgreich gelöscht!\",\"Load_More\":\"Mehr laden\",\"Ok\":\"Öffnen\"}");

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

/***/ "dfc6":
/***/ (function(module) {

module.exports = JSON.parse("{\"err_fetching_resource\":\"\",\"err_creating_resource\":\"\",\"err_updating_resource\":\"\",\"err_deleting_resource\":\"\",\"success_fetching_resource\":\"\",\"success_creating_resource\":\"\",\"success_updating_resource\":\"\",\"success_deleting_resource\":\"\",\"import_running\":\"\",\"all_fields_optional\":\"\",\"convert_internal\":\"\",\"show_only_internal\":\"\",\"Log_Recipe_Cooking\":\"\",\"External_Recipe_Image\":\"\",\"Add_to_Book\":\"\",\"Add_to_Shopping\":\"\",\"Add_to_Plan\":\"\",\"Step_start_time\":\"\",\"Meal_Plan\":\"\",\"Select_Book\":\"\",\"Recipe_Image\":\"\",\"Import_finished\":\"\",\"View_Recipes\":\"\",\"Log_Cooking\":\"\",\"New_Recipe\":\"\",\"Url_Import\":\"\",\"Reset_Search\":\"\",\"Recently_Viewed\":\"\",\"Load_More\":\"\",\"Keywords\":\"\",\"Books\":\"\",\"Proteins\":\"\",\"Fats\":\"\",\"Carbohydrates\":\"\",\"Calories\":\"\",\"Nutrition\":\"\",\"Date\":\"\",\"Share\":\"\",\"Export\":\"\",\"Copy\":\"\",\"Rating\":\"\",\"Close\":\"\",\"Link\":\"\",\"Add\":\"\",\"New\":\"\",\"Success\":\"\",\"Ingredients\":\"\",\"Supermarket\":\"\",\"Categories\":\"\",\"Category\":\"\",\"Selected\":\"\",\"min\":\"\",\"Servings\":\"\",\"Waiting\":\"\",\"Preparation\":\"\",\"External\":\"\",\"Size\":\"\",\"Files\":\"\",\"File\":\"\",\"Edit\":\"\",\"Cancel\":\"\",\"Delete\":\"\",\"Open\":\"\",\"Ok\":\"\",\"Save\":\"\",\"Step\":\"\",\"Search\":\"\",\"Import\":\"\",\"Print\":\"\",\"Settings\":\"\",\"or\":\"\",\"and\":\"\",\"Information\":\"\",\"Download\":\"\"}");

/***/ }),

/***/ "edd4":
/***/ (function(module) {

module.exports = JSON.parse("{\"err_fetching_resource\":\"There was an error fetching a resource!\",\"err_creating_resource\":\"There was an error creating a resource!\",\"err_updating_resource\":\"There was an error updating a resource!\",\"err_deleting_resource\":\"There was an error deleting a resource!\",\"success_fetching_resource\":\"Successfully fetched a resource!\",\"success_creating_resource\":\"Successfully created a resource!\",\"success_updating_resource\":\"Successfully updated a resource!\",\"success_deleting_resource\":\"Successfully deleted a resource!\",\"import_running\":\"Import running, please wait!\",\"all_fields_optional\":\"All fields are optional and can be left empty.\",\"convert_internal\":\"Convert to internal recipe\",\"show_only_internal\":\"Show only internal recipes\",\"show_split_screen\":\"Show split view\",\"Log_Recipe_Cooking\":\"Log Recipe Cooking\",\"External_Recipe_Image\":\"External Recipe Image\",\"Add_to_Book\":\"Add to Book\",\"Add_to_Shopping\":\"Add to Shopping\",\"Add_to_Plan\":\"Add to Plan\",\"Step_start_time\":\"Step start time\",\"Sort_by_new\":\"Sort by new\",\"Recipes_per_page\":\"Recipes per Page\",\"Meal_Plan\":\"Meal Plan\",\"Select_Book\":\"Select Book\",\"Recipe_Image\":\"Recipe Image\",\"Import_finished\":\"Import finished\",\"View_Recipes\":\"View Recipes\",\"Log_Cooking\":\"Log Cooking\",\"New_Recipe\":\"New Recipe\",\"Url_Import\":\"Url Import\",\"Reset_Search\":\"Reset Search\",\"Recently_Viewed\":\"Recently Viewed\",\"Load_More\":\"Load More\",\"New_Keyword\":\"New Keyword\",\"Delete_Keyword\":\"Delete Keyword\",\"Edit_Keyword\":\"Edit Keyword\",\"Move_Keyword\":\"Move Keyword\",\"Merge_Keyword\":\"Merge Keyword\",\"Hide_Keywords\":\"Hide Keywords\",\"Hide_Recipes\":\"Hide Recipes\",\"Keywords\":\"Keywords\",\"Books\":\"Books\",\"Proteins\":\"Proteins\",\"Fats\":\"Fats\",\"Carbohydrates\":\"Carbohydrates\",\"Calories\":\"Calories\",\"Nutrition\":\"Nutrition\",\"Date\":\"Date\",\"Share\":\"Share\",\"Export\":\"Export\",\"Copy\":\"Copy\",\"Rating\":\"Rating\",\"Close\":\"Close\",\"Cancel\":\"Cancel\",\"Link\":\"Link\",\"Add\":\"Add\",\"New\":\"New\",\"Success\":\"Success\",\"Ingredients\":\"Ingredients\",\"Supermarket\":\"Supermarket\",\"Categories\":\"Categories\",\"Category\":\"Category\",\"Selected\":\"Selected\",\"min\":\"min\",\"Servings\":\"Servings\",\"Waiting\":\"Waiting\",\"Preparation\":\"Preparation\",\"External\":\"External\",\"Size\":\"Size\",\"Files\":\"Files\",\"File\":\"File\",\"Edit\":\"Edit\",\"Delete\":\"Delete\",\"Open\":\"Open\",\"Ok\":\"Open\",\"Save\":\"Save\",\"Step\":\"Step\",\"Search\":\"Search\",\"Import\":\"Import\",\"Print\":\"Print\",\"Settings\":\"Settings\",\"or\":\"or\",\"and\":\"and\",\"Information\":\"Information\",\"Advanced Search Settings\":\"Advanced Search Settings\",\"View\":\"View\",\"Recipes\":\"Recipes\",\"Move\":\"Move\",\"Merge\":\"Merge\",\"Parent\":\"Parent\",\"delete_confimation\":\"Are you sure that you want to delete {kw} and all of it's children?\",\"move_confirmation\":\"Move {child} to parent {parent}\",\"merge_confirmation\":\"Replace {source} with {target}\",\"move_selection\":\"Select a parent to move {child} to.\",\"merge_selection\":\"Replace all occurences of {source} with the selected {type}.\",\"Download\":\"Download\",\"Root\":\"Root\",\"Ignore_Shopping\":\"Ignore Shopping\",\"Shopping_Category\":\"Shopping Category\",\"Edit_Food\":\"Edit Food\"}");

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

/***/ "fd4d":
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

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"3096e903-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/apps/UserFileView/UserFileView.vue?vue&type=template&id=f6263e7c&
var UserFileViewvue_type_template_id_f6263e7c_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{attrs:{"id":"app"}},[_c('div',{staticClass:"row"},[_c('div',{staticClass:"col col-md-12"},[_c('h3',[_vm._v(_vm._s(_vm.$t('Files'))+" "),_c('span',{staticClass:"float-right"},[_c('file-editor',{on:{"change":function($event){return _vm.loadInitial()}}})],1)])])]),_c('div',{staticClass:"row",staticStyle:{"margin-top":"2vh"}},[_c('div',{staticClass:"col col-md-12"},[_c('b-progress',{attrs:{"max":_vm.max_file_size_mb}},[_c('b-progress-bar',{attrs:{"value":_vm.current_file_size_mb}},[_c('span',[_c('strong',{staticClass:"text-dark "},[_vm._v(_vm._s(_vm.current_file_size_mb.toFixed(2))+" / "+_vm._s(_vm.max_file_size_mb)+" MB")])])])],1)],1)]),_c('div',{staticClass:"row",staticStyle:{"margin-top":"2vh"}},[_c('div',{staticClass:"col col-md-12"},[_c('table',{staticClass:"table"},[_c('thead',[_c('tr',[_c('th',[_vm._v(_vm._s(_vm.$t('Name')))]),_c('th',[_vm._v(_vm._s(_vm.$t('Size'))+" (MB)")]),_c('th',[_vm._v(_vm._s(_vm.$t('Download')))]),_c('th',[_vm._v(_vm._s(_vm.$t('Edit')))])])]),_vm._l((_vm.files),function(f){return _c('tr',{key:f.id},[_c('td',[_vm._v(_vm._s(f.name))]),_c('td',[_vm._v(_vm._s(f.file_size_kb / 1000))]),_c('td',[_c('a',{attrs:{"href":f.file,"target":"_blank","rel":"noreferrer nofollow"}},[_vm._v(_vm._s(_vm.$t('Download')))])]),_c('td',[_c('file-editor',{attrs:{"file_id":f.id},on:{"change":function($event){return _vm.loadInitial()}}})],1)])})],2)])])])}
var staticRenderFns = []


// CONCATENATED MODULE: ./src/apps/UserFileView/UserFileView.vue?vue&type=template&id=f6263e7c&

// EXTERNAL MODULE: ./node_modules/bootstrap-vue/esm/index.js + 253 modules
var esm = __webpack_require__("5f5b");

// EXTERNAL MODULE: ./node_modules/bootstrap-vue/dist/bootstrap-vue.css
var bootstrap_vue = __webpack_require__("2dd8");

// EXTERNAL MODULE: ./src/utils/utils.js + 1 modules
var utils = __webpack_require__("fa7d");

// EXTERNAL MODULE: ./src/utils/openapi/api.ts + 2 modules
var api = __webpack_require__("2b2d");

// EXTERNAL MODULE: ./node_modules/axios/index.js
var axios = __webpack_require__("bc3a");
var axios_default = /*#__PURE__*/__webpack_require__.n(axios);

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"3096e903-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/FileEditor.vue?vue&type=template&id=ed49261e&
var FileEditorvue_type_template_id_ed49261e_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[_c('b-button',{directives:[{name:"b-modal",rawName:"v-b-modal",value:('modal-file-editor'+_vm.file_id),expression:"'modal-file-editor'+file_id"}],class:{'btn-success': (_vm.file_id === undefined)}},[(this.file_id)?[_vm._v(_vm._s(_vm.$t('Edit')))]:[_vm._v(_vm._s(_vm.$t('New')))]],2),_c('b-modal',{attrs:{"id":'modal-file-editor'+_vm.file_id,"title":_vm.$t('File')},on:{"ok":function($event){return _vm.modalOk()}},scopedSlots:_vm._u([{key:"modal-footer",fn:function(){return [_c('b-button',{attrs:{"size":"sm","variant":"success"},on:{"click":function($event){return _vm.modalOk()}}},[_vm._v(" "+_vm._s(_vm.$t('Ok'))+" ")]),_c('b-button',{attrs:{"size":"sm","variant":"secondary"},on:{"click":function($event){return _vm.$bvModal.hide('modal-file-editor'+_vm.file_id)}}},[_vm._v(" "+_vm._s(_vm.$t('Cancel'))+" ")]),_c('b-button',{attrs:{"size":"sm","variant":"danger"},on:{"click":function($event){return _vm.deleteFile()}}},[_vm._v(" "+_vm._s(_vm.$t('Delete'))+" ")])]},proxy:true}])},[(_vm.file!==undefined)?[_vm._v(" "+_vm._s(_vm.$t('Name'))+" "),_c('b-input',{model:{value:(_vm.file.name),callback:function ($$v) {_vm.$set(_vm.file, "name", $$v)},expression:"file.name"}}),_c('br'),_vm._v(" "+_vm._s(_vm.$t('File'))+" "),_c('b-form-file',{model:{value:(_vm.file.file),callback:function ($$v) {_vm.$set(_vm.file, "file", $$v)},expression:"file.file"}})]:_vm._e(),_c('br'),_c('br')],2)],1)}
var FileEditorvue_type_template_id_ed49261e_staticRenderFns = []


// CONCATENATED MODULE: ./src/components/FileEditor.vue?vue&type=template&id=ed49261e&

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.number.constructor.js
var es_number_constructor = __webpack_require__("a9e3");

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.object.to-string.js
var es_object_to_string = __webpack_require__("d3b7");

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.regexp.to-string.js
var es_regexp_to_string = __webpack_require__("25f0");

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.function.name.js
var es_function_name = __webpack_require__("b0c0");

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/FileEditor.vue?vue&type=script&lang=js&




//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


/* harmony default export */ var FileEditorvue_type_script_lang_js_ = ({
  name: "FileEditor",
  data: function data() {
    return {
      file: undefined
    };
  },
  props: {
    file_id: Number
  },
  mounted: function mounted() {
    if (this.file_id !== undefined) {
      this.loadFile(this.file_id.toString());
    } else {
      this.file = {
        name: '',
        file: undefined
      };
    }
  },
  methods: {
    loadFile: function loadFile(id) {
      var _this = this;

      var apiClient = new api["a" /* ApiApiFactory */]();
      apiClient.retrieveUserFile(id).then(function (result) {
        _this.file = result.data;
      });
    },
    modalOk: function modalOk() {
      if (this.file_id === undefined) {
        console.log('CREATING');
        this.createFile();
      } else {
        console.log('UPDATING');
        this.updateFile();
      }
    },
    updateFile: function updateFile() {
      var _this2 = this;

      var apiClient = new api["a" /* ApiApiFactory */]();
      var passedFile = undefined;

      if (!(typeof this.file.file === 'string' || this.file.file instanceof String)) {
        // only update file if it was changed
        passedFile = this.file.file;
      }

      apiClient.updateUserFile(this.file.id, this.file.name, passedFile).then(function (request) {
        Object(utils["f" /* makeToast */])(_this2.$t('Success'), _this2.$t('success_updating_resource'), 'success');

        _this2.$emit('change');
      }).catch(function (err) {
        Object(utils["f" /* makeToast */])(_this2.$t('Error'), _this2.$t('err_updating_resource') + '\n' + err.response.data, 'danger');
        console.log(err.request, err.response);
      });
    },
    createFile: function createFile() {
      var _this3 = this;

      var apiClient = new api["a" /* ApiApiFactory */]();
      apiClient.createUserFile(this.file.name, this.file.file).then(function (request) {
        Object(utils["f" /* makeToast */])(_this3.$t('Success'), _this3.$t('success_creating_resource'), 'success');

        _this3.$emit('change');

        _this3.file = {
          name: '',
          file: undefined
        };
      }).catch(function (err) {
        Object(utils["f" /* makeToast */])(_this3.$t('Error'), _this3.$t('err_creating_resource') + '\n' + err.response.data, 'danger');
        console.log(err.request, err.response);
      });
    },
    deleteFile: function deleteFile() {
      var _this4 = this;

      var apiClient = new api["a" /* ApiApiFactory */]();
      apiClient.destroyUserFile(this.file.id).then(function (results) {
        Object(utils["f" /* makeToast */])(_this4.$t('Success'), _this4.$t('success_deleting_resource'), 'success');

        _this4.$emit('change');
      }).catch(function (err) {
        Object(utils["f" /* makeToast */])(_this4.$t('Error'), _this4.$t('err_deleting_resource') + '\n' + err.response.data, 'danger');
        console.log(err.request, err.response);
      });
    }
  }
});
// CONCATENATED MODULE: ./src/components/FileEditor.vue?vue&type=script&lang=js&
 /* harmony default export */ var components_FileEditorvue_type_script_lang_js_ = (FileEditorvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-loader/lib/runtime/componentNormalizer.js
var componentNormalizer = __webpack_require__("2877");

// CONCATENATED MODULE: ./src/components/FileEditor.vue





/* normalize component */

var component = Object(componentNormalizer["a" /* default */])(
  components_FileEditorvue_type_script_lang_js_,
  FileEditorvue_type_template_id_ed49261e_render,
  FileEditorvue_type_template_id_ed49261e_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ var FileEditor = (component.exports);
// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/apps/UserFileView/UserFileView.vue?vue&type=script&lang=js&
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//





vue_esm["default"].use(esm["a" /* BootstrapVue */]); // import draggable from 'vuedraggable'


 // import Multiselect from "vue-multiselect";

axios_default.a.defaults.xsrfHeaderName = 'X-CSRFToken';
axios_default.a.defaults.xsrfCookieName = 'csrftoken';
/* harmony default export */ var UserFileViewvue_type_script_lang_js_ = ({
  name: 'UserFileView',
  mixins: [utils["b" /* ResolveUrlMixin */], utils["c" /* ToastMixin */]],
  components: {
    FileEditor: FileEditor
  },
  data: function data() {
    return {
      files: [],
      current_file_size_mb: window.CURRENT_FILE_SIZE_MB,
      max_file_size_mb: window.MAX_FILE_SIZE_MB
    };
  },
  mounted: function mounted() {
    this.$i18n.locale = window.CUSTOM_LOCALE;
    this.loadInitial();
  },
  methods: {
    loadInitial: function loadInitial() {
      var _this = this;

      var apiClient = new api["a" /* ApiApiFactory */]();
      apiClient.listUserFiles().then(function (results) {
        _this.files = results.data;
      });
    }
  }
});
// CONCATENATED MODULE: ./src/apps/UserFileView/UserFileView.vue?vue&type=script&lang=js&
 /* harmony default export */ var UserFileView_UserFileViewvue_type_script_lang_js_ = (UserFileViewvue_type_script_lang_js_); 
// CONCATENATED MODULE: ./src/apps/UserFileView/UserFileView.vue





/* normalize component */

var UserFileView_component = Object(componentNormalizer["a" /* default */])(
  UserFileView_UserFileViewvue_type_script_lang_js_,
  UserFileViewvue_type_template_id_f6263e7c_render,
  staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ var UserFileView = (UserFileView_component.exports);
// EXTERNAL MODULE: ./src/i18n.js
var i18n = __webpack_require__("9225");

// CONCATENATED MODULE: ./src/apps/UserFileView/main.js







vue_esm["default"].config.productionTip = false;
new vue_esm["default"]({
  i18n: i18n["a" /* default */],
  render: function render(h) {
    return h(UserFileView);
  }
}).$mount('#app');

/***/ })

/******/ });