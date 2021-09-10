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
/******/ 		"supermarket_view": 0
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
/******/ 	deferredModules.push([4,"chunk-vendors"]);
/******/ 	// run deferred modules when ready
/******/ 	return checkDeferredModules();
/******/ })
/************************************************************************/
/******/ ({

/***/ "0825":
/***/ (function(module) {

module.exports = JSON.parse("{\"err_fetching_resource\":\"Si è verificato un errore nel recupero della risorsa!\",\"err_creating_resource\":\"Si è verificato un errore durante la creazione di una risorsa!\",\"err_updating_resource\":\"Si è verificato un errore nell'aggiornamento della risorsa!\",\"err_deleting_resource\":\"Si è verificato un errore nella cancellazione della risorsa!\",\"success_fetching_resource\":\"Risorsa recuperata con successo!\",\"success_creating_resource\":\"Risorsa creata con successo!\",\"success_updating_resource\":\"Risorsa aggiornata con successo!\",\"success_deleting_resource\":\"Risorsa eliminata con successo!\",\"import_running\":\"Importazione in corso, attendere prego!\",\"all_fields_optional\":\"Tutti i campi sono opzionali e possono essere lasciati vuoti.\",\"convert_internal\":\"Converti come ricetta interna\",\"show_only_internal\":\"Mostra solo ricette interne\",\"show_split_screen\":\"Mostra vista divisa\",\"Log_Recipe_Cooking\":\"Aggiungi a ricette cucinate\",\"External_Recipe_Image\":\"Immagine ricetta esterna\",\"Add_to_Shopping\":\"Aggiunti a lista della spesa\",\"Add_to_Plan\":\"Aggiungi a Piano\",\"Step_start_time\":\"Ora di inizio dello Step\",\"Sort_by_new\":\"Prima i nuovi\",\"Recipes_per_page\":\"Ricette per pagina\",\"Manage_Books\":\"Gestisci Libri\",\"Meal_Plan\":\"Piano alimentare\",\"Select_Book\":\"Seleziona Libro\",\"Recipe_Image\":\"Immagine ricetta\",\"Import_finished\":\"Importazione completata\",\"View_Recipes\":\"Mostra ricette\",\"Log_Cooking\":\"Registro ricette cucinate\",\"New_Recipe\":\"Nuova Ricetta\",\"Url_Import\":\"Importa da URL\",\"Reset_Search\":\"Ripristina Ricerca\",\"Recently_Viewed\":\"Visualizzati di recente\",\"Load_More\":\"Carica di più\",\"New_Keyword\":\"Nuova parola chiave\",\"Delete_Keyword\":\"Elimina parola chiave\",\"Edit_Keyword\":\"Modifica parola chiave\",\"Move_Keyword\":\"Sposta parola chiave\",\"Merge_Keyword\":\"Unisci parola chiave\",\"Hide_Keywords\":\"Nascondi parole chiave\",\"Hide_Recipes\":\"Nascondi Ricette\",\"Keywords\":\"Parole chiave\",\"Books\":\"Libri\",\"Proteins\":\"Proteine\",\"Fats\":\"Grassi\",\"Carbohydrates\":\"Carboidrati\",\"Calories\":\"Calorie\",\"Nutrition\":\"Nutrienti\",\"Date\":\"Data\",\"Share\":\"Condividi\",\"Export\":\"Esporta\",\"Copy\":\"Copia\",\"Rating\":\"Valutazione\",\"Close\":\"Chiudi\",\"Cancel\":\"Annulla\",\"Link\":\"Link\",\"Add\":\"Aggiungi\",\"New\":\"Nuovo\",\"Success\":\"Riuscito\",\"Failure\":\"Errore\",\"Ingredients\":\"Ingredienti\",\"Supermarket\":\"Supermercato\",\"Categories\":\"Categorie\",\"Category\":\"Categoria\",\"Selected\":\"Selezionato\",\"min\":\"min\",\"Servings\":\"Porzioni\",\"Waiting\":\"Attesa\",\"Preparation\":\"Preparazione\",\"External\":\"Esterna\",\"Size\":\"Dimensione\",\"Files\":\"File\",\"File\":\"File\",\"Edit\":\"Modifica\",\"Delete\":\"Elimina\",\"Open\":\"Apri\",\"Ok\":\"Apri\",\"Save\":\"Salva\",\"Step\":\"Step\",\"Search\":\"Cerca\",\"Import\":\"Importa\",\"Print\":\"Stampa\",\"Settings\":\"Impostazioni\",\"or\":\"o\",\"and\":\"e\",\"Information\":\"Informazioni\",\"Download\":\"Scarica\",\"Create\":\"Crea\",\"Advanced Search Settings\":\"Impostazioni avanzate di ricerca\",\"View\":\"Mostra\",\"Recipes\":\"Ricette\",\"Move\":\"Sposta\",\"Merge\":\"Unisci\",\"Parent\":\"Primario\",\"delete_confimation\":\"Sei sicuro di voler eliminare {kw} e tutti gli elementi dipendenti?\",\"move_confirmation\":\"Sposta {child} al primario {parent}\",\"merge_confirmation\":\"Sostituisci {source} con {target}\",\"move_selection\":\"Scegli un primario {type} dove spostare {source}.\",\"merge_selection\":\"Sostituisci tutte le voci di {source} con il {type} selezionato.\",\"Root\":\"Radice\",\"Ignore_Shopping\":\"Ignora lista della spesa\",\"delete_confirmation\":\"Sei sicuro di voler eliminare {source}?\"}");

/***/ }),

/***/ "2165":
/***/ (function(module) {

module.exports = JSON.parse("{\"err_fetching_resource\":\"\",\"err_creating_resource\":\"\",\"err_updating_resource\":\"\",\"err_deleting_resource\":\"\",\"success_fetching_resource\":\"\",\"success_creating_resource\":\"\",\"success_updating_resource\":\"\",\"success_deleting_resource\":\"\",\"import_running\":\"\",\"all_fields_optional\":\"\",\"convert_internal\":\"\",\"show_only_internal\":\"\",\"Log_Recipe_Cooking\":\"\",\"External_Recipe_Image\":\"\",\"Add_to_Shopping\":\"\",\"Add_to_Plan\":\"\",\"Step_start_time\":\"\",\"Sort_by_new\":\"\",\"Recipes_per_page\":\"\",\"Manage_Books\":\"\",\"Meal_Plan\":\"\",\"Select_Book\":\"\",\"Recipe_Image\":\"\",\"Import_finished\":\"\",\"View_Recipes\":\"\",\"Log_Cooking\":\"\",\"New_Recipe\":\"\",\"Url_Import\":\"\",\"Reset_Search\":\"\",\"Recently_Viewed\":\"\",\"Load_More\":\"\",\"Keywords\":\"\",\"Books\":\"\",\"Proteins\":\"\",\"Fats\":\"\",\"Carbohydrates\":\"\",\"Calories\":\"\",\"Nutrition\":\"\",\"Date\":\"\",\"Share\":\"\",\"Export\":\"\",\"Copy\":\"\",\"Rating\":\"\",\"Close\":\"\",\"Link\":\"\",\"Add\":\"\",\"New\":\"\",\"Success\":\"\",\"Failure\":\"\",\"Ingredients\":\"\",\"Supermarket\":\"\",\"Categories\":\"\",\"Category\":\"\",\"Selected\":\"\",\"min\":\"\",\"Servings\":\"\",\"Waiting\":\"\",\"Preparation\":\"\",\"External\":\"\",\"Size\":\"\",\"Files\":\"\",\"File\":\"\",\"Edit\":\"\",\"Cancel\":\"\",\"Delete\":\"\",\"Open\":\"\",\"Ok\":\"\",\"Save\":\"\",\"Step\":\"\",\"Search\":\"\",\"Import\":\"\",\"Print\":\"\",\"Settings\":\"\",\"or\":\"\",\"and\":\"\",\"Information\":\"\",\"Download\":\"\",\"Create\":\"\"}");

/***/ }),

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
         * optional parameters  - **recipe**: id of recipe - only return books for that recipe - **book**: id of book - only return recipes in that book
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
         * @param {number} [units] Id of unit a recipe should have.
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
         */listRecipes:function listRecipes(query,keywords,foods,units,books,keywordsOr,foodsOr,booksOr,internal,random,_new,page,pageSize,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){localVarPath="/api/recipe/";localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'GET'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};if(query!==undefined){localVarQueryParameter['query']=query;}if(keywords!==undefined){localVarQueryParameter['keywords']=keywords;}if(foods!==undefined){localVarQueryParameter['foods']=foods;}if(units!==undefined){localVarQueryParameter['units']=units;}if(books!==undefined){localVarQueryParameter['books']=books;}if(keywordsOr!==undefined){localVarQueryParameter['keywords_or']=keywordsOr;}if(foodsOr!==undefined){localVarQueryParameter['foods_or']=foodsOr;}if(booksOr!==undefined){localVarQueryParameter['books_or']=booksOr;}if(internal!==undefined){localVarQueryParameter['internal']=internal;}if(random!==undefined){localVarQueryParameter['random']=random;}if(_new!==undefined){localVarQueryParameter['new']=_new;}if(page!==undefined){localVarQueryParameter['page']=page;}if(pageSize!==undefined){localVarQueryParameter['page_size']=pageSize;}setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
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
         * @param {string} [query] Query string matched against unit name.
         * @param {number} [page] A page number within the paginated result set.
         * @param {number} [pageSize] Number of results to return per page.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listUnits:function listUnits(query,page,pageSize,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){localVarPath="/api/unit/";localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'GET'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};if(query!==undefined){localVarQueryParameter['query']=query;}if(page!==undefined){localVarQueryParameter['page']=page;}if(pageSize!==undefined){localVarQueryParameter['page_size']=pageSize;}setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
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
         * @param {string} id A unique integer value identifying this unit.
         * @param {string} target
         * @param {Unit} [unit]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */mergeUnit:function mergeUnit(id,target,unit,options){if(options===void 0){options={};}return Object(tslib_es6["b" /* __awaiter */])(_this,void 0,Promise,function(){var localVarPath,localVarUrlObj,baseOptions,localVarRequestOptions,localVarHeaderParameter,localVarQueryParameter,headersFromBaseOptions;return Object(tslib_es6["d" /* __generator */])(this,function(_a){// verify required parameter 'id' is not null or undefined
common_assertParamExists('mergeUnit','id',id);// verify required parameter 'target' is not null or undefined
common_assertParamExists('mergeUnit','target',target);localVarPath="/api/unit/{id}/merge/{target}/".replace("{"+"id"+"}",encodeURIComponent(String(id))).replace("{"+"target"+"}",encodeURIComponent(String(target)));localVarUrlObj=new URL(localVarPath,DUMMY_BASE_URL);if(configuration){baseOptions=configuration.baseOptions;}localVarRequestOptions=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({method:'PUT'},baseOptions),options);localVarHeaderParameter={};localVarQueryParameter={};localVarHeaderParameter['Content-Type']='application/json';setSearchParams(localVarUrlObj,localVarQueryParameter,options.query);headersFromBaseOptions=baseOptions&&baseOptions.headers?baseOptions.headers:{};localVarRequestOptions.headers=Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])(Object(tslib_es6["a" /* __assign */])({},localVarHeaderParameter),headersFromBaseOptions),options.headers);localVarRequestOptions.data=serializeDataIfNeeded(unit,localVarRequestOptions,configuration);return[2/*return*/,{url:toPathString(localVarUrlObj),options:localVarRequestOptions}];});});},/**
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
         * optional parameters  - **recipe**: id of recipe - only return books for that recipe - **book**: id of book - only return recipes in that book
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
         * @param {number} [units] Id of unit a recipe should have.
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
         */listRecipes:function listRecipes(query,keywords,foods,units,books,keywordsOr,foodsOr,booksOr,internal,random,_new,page,pageSize,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.listRecipes(query,keywords,foods,units,books,keywordsOr,foodsOr,booksOr,internal,random,_new,page,pageSize,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
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
         * @param {string} [query] Query string matched against unit name.
         * @param {number} [page] A page number within the paginated result set.
         * @param {number} [pageSize] Number of results to return per page.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listUnits:function listUnits(query,page,pageSize,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.listUnits(query,page,pageSize,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
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
         * @param {string} id A unique integer value identifying this unit.
         * @param {string} target
         * @param {Unit} [unit]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */mergeUnit:function mergeUnit(id,target,unit,options){return Object(tslib_es6["b" /* __awaiter */])(this,void 0,Promise,function(){var localVarAxiosArgs;return Object(tslib_es6["d" /* __generator */])(this,function(_a){switch(_a.label){case 0:return[4/*yield*/,localVarAxiosParamCreator.mergeUnit(id,target,unit,options)];case 1:localVarAxiosArgs=_a.sent();return[2/*return*/,common_createRequestFunction(localVarAxiosArgs,axios_default.a,base_BASE_PATH,configuration)];}});});},/**
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
         * optional parameters  - **recipe**: id of recipe - only return books for that recipe - **book**: id of book - only return recipes in that book
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
         * @param {number} [units] Id of unit a recipe should have.
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
         */listRecipes:function listRecipes(query,keywords,foods,units,books,keywordsOr,foodsOr,booksOr,internal,random,_new,page,pageSize,options){return localVarFp.listRecipes(query,keywords,foods,units,books,keywordsOr,foodsOr,booksOr,internal,random,_new,page,pageSize,options).then(function(request){return request(axios,basePath);});},/**
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
         * @param {string} [query] Query string matched against unit name.
         * @param {number} [page] A page number within the paginated result set.
         * @param {number} [pageSize] Number of results to return per page.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */listUnits:function listUnits(query,page,pageSize,options){return localVarFp.listUnits(query,page,pageSize,options).then(function(request){return request(axios,basePath);});},/**
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
         * @param {string} id A unique integer value identifying this unit.
         * @param {string} target
         * @param {Unit} [unit]
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */mergeUnit:function mergeUnit(id,target,unit,options){return localVarFp.mergeUnit(id,target,unit,options).then(function(request){return request(axios,basePath);});},/**
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
     * optional parameters  - **recipe**: id of recipe - only return books for that recipe - **book**: id of book - only return recipes in that book
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
     * @param {number} [units] Id of unit a recipe should have.
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
     */ApiApi.prototype.listRecipes=function(query,keywords,foods,units,books,keywordsOr,foodsOr,booksOr,internal,random,_new,page,pageSize,options){var _this=this;return api_ApiApiFp(this.configuration).listRecipes(query,keywords,foods,units,books,keywordsOr,foodsOr,booksOr,internal,random,_new,page,pageSize,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
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
     * @param {string} [query] Query string matched against unit name.
     * @param {number} [page] A page number within the paginated result set.
     * @param {number} [pageSize] Number of results to return per page.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.listUnits=function(query,page,pageSize,options){var _this=this;return api_ApiApiFp(this.configuration).listUnits(query,page,pageSize,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
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
     * @param {string} id A unique integer value identifying this unit.
     * @param {string} target
     * @param {Unit} [unit]
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof ApiApi
     */ApiApi.prototype.mergeUnit=function(id,target,unit,options){var _this=this;return api_ApiApiFp(this.configuration).mergeUnit(id,target,unit,options).then(function(request){return request(_this.axios,_this.basePath);});};/**
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

/***/ 4:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__("45a8");


/***/ }),

/***/ "45a8":
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

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"df6ae08c-vue-loader-template"}!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/apps/SupermarketView/SupermarketView.vue?vue&type=template&id=c7d3e1f8&
var SupermarketViewvue_type_template_id_c7d3e1f8_render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{attrs:{"id":"app"}},[_c('div',{staticClass:"row"},[_c('div',{staticClass:"col col-md-12"},[_c('h2',[_vm._v(_vm._s(_vm.$t('Supermarket')))]),_c('multiselect',{attrs:{"track-by":"id","label":"name","options":_vm.supermarkets},on:{"input":_vm.selectedSupermarketChanged},model:{value:(_vm.selected_supermarket),callback:function ($$v) {_vm.selected_supermarket=$$v},expression:"selected_supermarket"}}),_c('b-button',{directives:[{name:"b-modal",rawName:"v-b-modal.modal-supermarket",modifiers:{"modal-supermarket":true}}],staticClass:"btn btn-primary btn-block",staticStyle:{"margin-top":"1vh"}},[_vm._v(" "+_vm._s(_vm.$t('Edit'))+" ")]),_c('b-button',{directives:[{name:"b-modal",rawName:"v-b-modal.modal-supermarket",modifiers:{"modal-supermarket":true}}],staticClass:"btn btn-success btn-block",on:{"click":function($event){_vm.selected_supermarket = {new:true, name:''}}}},[_vm._v(_vm._s(_vm.$t('New'))+" ")])],1)]),_c('hr'),_c('div',{staticClass:"row"},[_c('div',{staticClass:"col col-md-6"},[_c('h4',[_vm._v(_vm._s(_vm.$t('Categories'))+" "),_c('button',{directives:[{name:"b-modal",rawName:"v-b-modal.modal-category",modifiers:{"modal-category":true}}],staticClass:"btn btn-success btn-sm",on:{"click":function($event){_vm.selected_category = {new:true, name:''}}}},[_vm._v(_vm._s(_vm.$t('New'))+" ")])]),_c('draggable',{attrs:{"list":_vm.selectable_categories,"group":"supermarket_categories","empty-insert-threshold":10}},_vm._l((_vm.selectable_categories),function(c){return _c('div',{key:c.id},[_c('button',{staticClass:"btn btn-block btn-sm btn-primary",staticStyle:{"margin-top":"0.5vh"}},[_vm._v(_vm._s(c.name))])])}),0)],1),_c('div',{staticClass:"col col-md-6"},[_c('h4',[_vm._v(_vm._s(_vm.$t('Selected'))+" "+_vm._s(_vm.$t('Categories')))]),_c('draggable',{attrs:{"list":_vm.supermarket_categories,"group":"supermarket_categories","empty-insert-threshold":10},on:{"change":_vm.selectedCategoriesChanged}},_vm._l((_vm.supermarket_categories),function(c){return _c('div',{key:c.id},[_c('button',{staticClass:"btn btn-block btn-sm btn-primary",staticStyle:{"margin-top":"0.5vh"}},[_vm._v(_vm._s(c.name))])])}),0)],1)]),_c('b-modal',{attrs:{"id":"modal-supermarket","title":_vm.$t('Supermarket')},on:{"ok":function($event){return _vm.supermarketModalOk()}}},[(_vm.selected_supermarket !== undefined)?_c('label',[_vm._v(" "+_vm._s(_vm.$t('Name'))+" "),_c('b-input',{model:{value:(_vm.selected_supermarket.name),callback:function ($$v) {_vm.$set(_vm.selected_supermarket, "name", $$v)},expression:"selected_supermarket.name"}})],1):_vm._e()]),_c('b-modal',{attrs:{"id":"modal-category","title":_vm.$t('Category')},on:{"ok":function($event){return _vm.categoryModalOk()}}},[(_vm.selected_category !== undefined)?_c('label',[_vm._v(" "+_vm._s(_vm.$t('Name'))+" "),_c('b-input',{model:{value:(_vm.selected_category.name),callback:function ($$v) {_vm.$set(_vm.selected_category, "name", $$v)},expression:"selected_category.name"}})],1):_vm._e()])],1)}
var staticRenderFns = []


// CONCATENATED MODULE: ./src/apps/SupermarketView/SupermarketView.vue?vue&type=template&id=c7d3e1f8&

// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/esm/createForOfIteratorHelper.js
var createForOfIteratorHelper = __webpack_require__("b85c");

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.array.filter.js
var es_array_filter = __webpack_require__("4de4");

// EXTERNAL MODULE: ./node_modules/core-js/modules/web.dom-collections.for-each.js
var web_dom_collections_for_each = __webpack_require__("159b");

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.function.name.js
var es_function_name = __webpack_require__("b0c0");

// EXTERNAL MODULE: ./node_modules/bootstrap-vue/esm/index.js + 253 modules
var esm = __webpack_require__("5f5b");

// EXTERNAL MODULE: ./node_modules/bootstrap-vue/dist/bootstrap-vue.css
var bootstrap_vue = __webpack_require__("2dd8");

// EXTERNAL MODULE: ./src/utils/utils.js + 1 modules
var utils = __webpack_require__("fa7d");

// EXTERNAL MODULE: ./src/utils/openapi/api.ts + 2 modules
var api = __webpack_require__("2b2d");

// EXTERNAL MODULE: ./node_modules/vuedraggable/dist/vuedraggable.umd.js
var vuedraggable_umd = __webpack_require__("b76a");
var vuedraggable_umd_default = /*#__PURE__*/__webpack_require__.n(vuedraggable_umd);

// EXTERNAL MODULE: ./node_modules/axios/index.js
var axios = __webpack_require__("bc3a");
var axios_default = /*#__PURE__*/__webpack_require__.n(axios);

// EXTERNAL MODULE: ./node_modules/vue-multiselect/dist/vue-multiselect.min.js
var vue_multiselect_min = __webpack_require__("8e5f");
var vue_multiselect_min_default = /*#__PURE__*/__webpack_require__.n(vue_multiselect_min);

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/apps/SupermarketView/SupermarketView.vue?vue&type=script&lang=js&




//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//





vue_esm["default"].use(esm["a" /* BootstrapVue */]);



axios_default.a.defaults.xsrfHeaderName = 'X-CSRFToken';
axios_default.a.defaults.xsrfCookieName = 'csrftoken';
/* harmony default export */ var SupermarketViewvue_type_script_lang_js_ = ({
  name: 'SupermarketView',
  mixins: [utils["d" /* ResolveUrlMixin */], utils["f" /* ToastMixin */]],
  components: {
    Multiselect: vue_multiselect_min_default.a,
    draggable: vuedraggable_umd_default.a
  },
  data: function data() {
    return {
      supermarkets: [],
      categories: [],
      selected_supermarket: {},
      selected_category: {},
      selectable_categories: [],
      supermarket_categories: []
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
      apiClient.listSupermarkets().then(function (results) {
        _this.supermarkets = results.data;
      });
      apiClient.listSupermarketCategorys().then(function (results) {
        _this.categories = results.data;
        _this.selectable_categories = _this.categories;
      });
    },
    selectedCategoriesChanged: function selectedCategoriesChanged(data) {
      var _this2 = this;

      var apiClient = new api["a" /* ApiApiFactory */]();

      if ('removed' in data) {
        var relation = this.selected_supermarket.category_to_supermarket.filter(function (el) {
          return el.category.id === data.removed.element.id;
        })[0];
        apiClient.destroySupermarketCategoryRelation(relation.id);
      }

      if ('added' in data) {
        apiClient.createSupermarketCategoryRelation({
          category: data.added.element,
          supermarket: this.selected_supermarket.id,
          order: 0
        }).then(function (results) {
          _this2.selected_supermarket.category_to_supermarket.push(results.data);
        });
      }

      if ('moved' in data || 'added' in data) {
        this.supermarket_categories.forEach(function (element, index) {
          var relation = _this2.selected_supermarket.category_to_supermarket.filter(function (el) {
            return el.category.id === element.id;
          })[0];

          console.log(relation);
          apiClient.partialUpdateSupermarketCategoryRelation(relation.id, {
            order: index
          });
        });
      }
    },
    selectedSupermarketChanged: function selectedSupermarketChanged(supermarket, id) {
      var _this3 = this;

      this.supermarket_categories = [];
      this.selectable_categories = this.categories;

      var _iterator = Object(createForOfIteratorHelper["a" /* default */])(supermarket.category_to_supermarket),
          _step;

      try {
        var _loop = function _loop() {
          var i = _step.value;

          _this3.supermarket_categories.push(i.category);

          _this3.selectable_categories = _this3.selectable_categories.filter(function (el) {
            return el.id !== i.category.id;
          });
        };

        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          _loop();
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    },
    supermarketModalOk: function supermarketModalOk() {
      var _this4 = this;

      var apiClient = new api["a" /* ApiApiFactory */]();

      if (this.selected_supermarket.new) {
        apiClient.createSupermarket({
          name: this.selected_supermarket.name
        }).then(function (results) {
          _this4.selected_supermarket = undefined;

          _this4.loadInitial();
        });
      } else {
        apiClient.partialUpdateSupermarket(this.selected_supermarket.id, {
          name: this.selected_supermarket.name
        });
      }
    },
    categoryModalOk: function categoryModalOk() {
      var _this5 = this;

      var apiClient = new api["a" /* ApiApiFactory */]();

      if (this.selected_category.new) {
        apiClient.createSupermarketCategory({
          name: this.selected_category.name
        }).then(function (results) {
          _this5.selected_category = {};

          _this5.loadInitial();
        });
      } else {
        apiClient.partialUpdateSupermarketCategory(this.selected_category.id, {
          name: this.selected_category.name
        });
      }
    }
  }
});
// CONCATENATED MODULE: ./src/apps/SupermarketView/SupermarketView.vue?vue&type=script&lang=js&
 /* harmony default export */ var SupermarketView_SupermarketViewvue_type_script_lang_js_ = (SupermarketViewvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-loader/lib/runtime/componentNormalizer.js
var componentNormalizer = __webpack_require__("2877");

// CONCATENATED MODULE: ./src/apps/SupermarketView/SupermarketView.vue





/* normalize component */

var component = Object(componentNormalizer["a" /* default */])(
  SupermarketView_SupermarketViewvue_type_script_lang_js_,
  SupermarketViewvue_type_template_id_c7d3e1f8_render,
  staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ var SupermarketView = (component.exports);
// EXTERNAL MODULE: ./src/i18n.js
var i18n = __webpack_require__("9225");

// CONCATENATED MODULE: ./src/apps/SupermarketView/main.js







vue_esm["default"].config.productionTip = false;
new vue_esm["default"]({
  i18n: i18n["a" /* default */],
  render: function render(h) {
    return h(SupermarketView);
  }
}).$mount('#app');

/***/ }),

/***/ "49f8":
/***/ (function(module, exports, __webpack_require__) {

var map = {
	"./de.json": "6ce2",
	"./en.json": "edd4",
	"./fr.json": "f693",
	"./hy.json": "dfc6",
	"./it.json": "0825",
	"./nl.json": "a625",
	"./sv.json": "4c5b",
	"./zh_Hans.json": "dc43",
	"./zh_Hant.json": "2165"
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

/***/ "6369":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return Models; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Actions; });
/* harmony import */ var _home_smilerz_recipes_vue_node_modules_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("d4ec");
/* harmony import */ var _home_smilerz_recipes_vue_node_modules_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("ade3");
/* harmony import */ var _i18n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("9225");



/*
* Utility CLASS to define model configurations
* */
 // TODO this needs rethought and simplified
// maybe a function that returns a single dictionary based on action?

var Models = function Models() {
  Object(_home_smilerz_recipes_vue_node_modules_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"])(this, Models);
};

Object(_home_smilerz_recipes_vue_node_modules_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"])(Models, "TREE", {
  'list': {
    'params': ['query', 'root', 'tree', 'page', 'pageSize'],
    'config': {
      'root': {
        'default': {
          'function': 'CONDITIONAL',
          'check': 'query',
          'operator': 'not_exist',
          'true': 0,
          'false': undefined
        }
      },
      'tree': {
        'default': undefined
      }
    }
  },
  'delete': {
    "form": {
      'instruction': {
        'form_field': true,
        'type': 'instruction',
        'function': 'translate',
        'phrase': "del_confimation_tree",
        'params': [{
          'token': 'source',
          'from': 'item1',
          'attribute': "name"
        }]
      }
    }
  },
  'move': {
    'form': {
      'target': {
        'form_field': true,
        'type': 'lookup',
        'field': 'target',
        'list': 'self',
        'sticky_options': [{
          'id': 0,
          'name': _i18n__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"].t('tree_root')
        }]
      }
    }
  }
});

Object(_home_smilerz_recipes_vue_node_modules_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"])(Models, "FOOD", {
  'name': _i18n__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"].t('Food'),
  // *OPTIONAL* : parameters will be built model -> model_type -> default
  'apiName': 'Food',
  // *REQUIRED* : the name that is used in api.ts for this model
  'model_type': Models.TREE,
  // *OPTIONAL* : model specific params for api, if not present will attempt modeltype_create then default_create
  'badges': {
    'linked_recipe': true
  },
  // REQUIRED: unordered array of fields that can be set during create
  'create': {
    // if not defined partialUpdate will use the same parameters, prepending 'id'
    'params': [['name', 'description', 'recipe', 'ignore_shopping', 'supermarket_category']],
    'form': {
      'name': {
        'form_field': true,
        'type': 'text',
        'field': 'name',
        'label': _i18n__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"].t('Name'),
        'placeholder': ''
      },
      'description': {
        'form_field': true,
        'type': 'text',
        'field': 'description',
        'label': _i18n__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"].t('Description'),
        'placeholder': ''
      },
      'recipe': {
        'form_field': true,
        'type': 'lookup',
        'field': 'recipe',
        'list': 'RECIPE',
        'label': _i18n__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"].t('Recipe')
      },
      'shopping': {
        'form_field': true,
        'type': 'checkbox',
        'field': 'ignore_shopping',
        'label': _i18n__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"].t('Ignore_Shopping')
      },
      'shopping_category': {
        'form_field': true,
        'type': 'lookup',
        'field': 'supermarket_category',
        'list': 'SHOPPING_CATEGORY',
        'label': _i18n__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"].t('Shopping_Category'),
        'allow_create': true
      }
    }
  }
});

Object(_home_smilerz_recipes_vue_node_modules_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"])(Models, "KEYWORD", {
  'name': _i18n__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"].t('Keyword'),
  // *OPTIONAL: parameters will be built model -> model_type -> default
  'apiName': 'Keyword',
  'model_type': Models.TREE,
  'badges': {
    'icon': true
  },
  'create': {
    // if not defined partialUpdate will use the same parameters, prepending 'id'
    'params': [['name', 'description', 'icon']],
    'form': {
      'name': {
        'form_field': true,
        'type': 'text',
        'field': 'name',
        'label': _i18n__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"].t('Name'),
        'placeholder': ''
      },
      'description': {
        'form_field': true,
        'type': 'text',
        'field': 'description',
        'label': _i18n__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"].t('Description'),
        'placeholder': ''
      },
      'icon': {
        'form_field': true,
        'type': 'emoji',
        'field': 'icon',
        'label': _i18n__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"].t('Icon')
      }
    }
  }
});

Object(_home_smilerz_recipes_vue_node_modules_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"])(Models, "UNIT", {
  'name': _i18n__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"].t('Unit'),
  'apiName': 'Unit',
  'create': {
    'params': [['name', 'description']],
    'form': {
      'name': {
        'form_field': true,
        'type': 'text',
        'field': 'name',
        'label': _i18n__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"].t('Name'),
        'placeholder': ''
      },
      'description': {
        'form_field': true,
        'type': 'text',
        'field': 'description',
        'label': _i18n__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"].t('Description'),
        'placeholder': ''
      }
    }
  },
  'move': false
});

Object(_home_smilerz_recipes_vue_node_modules_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"])(Models, "SHOPPING_LIST", {});

Object(_home_smilerz_recipes_vue_node_modules_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"])(Models, "RECIPE_BOOK", {
  'name': _i18n__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"].t('Recipe_Book'),
  'apiName': 'RecipeBook'
});

Object(_home_smilerz_recipes_vue_node_modules_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"])(Models, "SHOPPING_CATEGORY", {
  'name': _i18n__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"].t('Shopping_Category'),
  'apiName': 'SupermarketCategory',
  'create': {
    'params': [['name', 'description']],
    'form': {
      'name': {
        'form_field': true,
        'type': 'text',
        'field': 'name',
        'label': _i18n__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"].t('Name'),
        'placeholder': ''
      },
      'description': {
        'form_field': true,
        'type': 'text',
        'field': 'description',
        'label': _i18n__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"].t('Description'),
        'placeholder': ''
      }
    }
  }
});

Object(_home_smilerz_recipes_vue_node_modules_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"])(Models, "RECIPE", {
  'name': _i18n__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"].t('Recipe'),
  'apiName': 'Recipe',
  'list': {
    'params': ['query', 'keywords', 'foods', 'units', 'books', 'keywordsOr', 'foodsOr', 'booksOr', 'internal', 'random', '_new', 'page', 'pageSize', 'options'],
    'config': {
      'foods': {
        'type': 'string'
      },
      'keywords': {
        'type': 'string'
      },
      'books': {
        'type': 'string'
      }
    }
  }
});

var Actions = function Actions() {
  Object(_home_smilerz_recipes_vue_node_modules_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"])(this, Actions);
};

Object(_home_smilerz_recipes_vue_node_modules_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"])(Actions, "CREATE", {
  "function": "create",
  'form': {
    'title': {
      'function': 'translate',
      'phrase': 'create_title',
      'params': [{
        'token': 'type',
        'from': 'model',
        'attribute': 'name'
      }]
    },
    'ok_label': _i18n__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"].t('Save')
  }
});

Object(_home_smilerz_recipes_vue_node_modules_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"])(Actions, "UPDATE", {
  "function": "partialUpdate",
  // special case for update only - updated assumes create form is sufficient, but a different title is required.
  "form_title": {
    'function': 'translate',
    'phrase': 'edit_title',
    'params': [{
      'token': 'type',
      'from': 'model',
      'attribute': 'name'
    }]
  }
});

Object(_home_smilerz_recipes_vue_node_modules_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"])(Actions, "DELETE", {
  "function": "destroy",
  'params': ['id'],
  'form': {
    'title': {
      'function': 'translate',
      'phrase': 'delete_title',
      'params': [{
        'token': 'type',
        'from': 'model',
        'attribute': 'name'
      }]
    },
    'ok_label': _i18n__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"].t('Delete'),
    'instruction': {
      'form_field': true,
      'type': 'instruction',
      'label': {
        'function': 'translate',
        'phrase': "delete_confirmation",
        'params': [{
          'token': 'source',
          'from': 'item1',
          'attribute': "name"
        }]
      }
    }
  }
});

Object(_home_smilerz_recipes_vue_node_modules_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"])(Actions, "FETCH", {
  "function": "retrieve",
  'params': ['id']
});

Object(_home_smilerz_recipes_vue_node_modules_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"])(Actions, "LIST", {
  "function": "list",
  "suffix": "s",
  "params": ['query', 'page', 'pageSize'],
  "config": {
    'query': {
      'default': undefined
    },
    'page': {
      'default': 1
    },
    'pageSize': {
      'default': 25
    }
  }
});

Object(_home_smilerz_recipes_vue_node_modules_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"])(Actions, "MERGE", {
  "function": "merge",
  'params': ['source', 'target'],
  "config": {
    'source': {
      'type': 'string'
    },
    'target': {
      'type': 'string'
    }
  },
  'form': {
    'title': {
      'function': 'translate',
      'phrase': 'merge_title',
      'params': [{
        'token': 'type',
        'from': 'model',
        'attribute': 'name'
      }]
    },
    'ok_label': _i18n__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"].t('Merge'),
    'instruction': {
      'form_field': true,
      'type': 'instruction',
      'label': {
        'function': 'translate',
        'phrase': "merge_selection",
        'params': [{
          'token': 'source',
          'from': 'item1',
          'attribute': "name"
        }, {
          'token': 'type',
          'from': 'model',
          'attribute': "name"
        }]
      }
    },
    'target': {
      'form_field': true,
      'type': 'lookup',
      'field': 'target',
      'list': 'self'
    }
  }
});

Object(_home_smilerz_recipes_vue_node_modules_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"])(Actions, "MOVE", {
  "function": "move",
  'params': ['source', 'target'],
  "config": {
    'source': {
      'type': 'string'
    },
    'target': {
      'type': 'string'
    }
  },
  'form': {
    'title': {
      'function': 'translate',
      'phrase': 'move_title',
      'params': [{
        'token': 'type',
        'from': 'model',
        'attribute': 'name'
      }]
    },
    'ok_label': _i18n__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"].t('Move'),
    'instruction': {
      'form_field': true,
      'type': 'instruction',
      'label': {
        'function': 'translate',
        'phrase': "move_selection",
        'params': [{
          'token': 'source',
          'from': 'item1',
          'attribute': "name"
        }, {
          'token': 'type',
          'from': 'model',
          'attribute': "name"
        }]
      }
    },
    'target': {
      'form_field': true,
      'type': 'lookup',
      'field': 'target',
      'list': 'self'
    }
  }
});

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

module.exports = JSON.parse("{\"import_running\":\"Er wordt geïmporteerd, even geduld!\",\"all_fields_optional\":\"Alle velden zijn optioneel en kunnen leeg gelaten worden.\",\"convert_internal\":\"Zet om naar intern recept\",\"Log_Recipe_Cooking\":\"Log Bereiding\",\"External_Recipe_Image\":\"Externe Afbeelding Recept\",\"Add_to_Book\":\"Voeg toe aan Boek\",\"Add_to_Shopping\":\"Voeg toe aan Boodschappenlijst\",\"Add_to_Plan\":\"Voeg toe aan Plan\",\"Step_start_time\":\"Starttijd stap\",\"Select_Book\":\"Selecteer Boek\",\"Recipe_Image\":\"Afbeelding Recept\",\"Import_finished\":\"Importeren gereed\",\"View_Recipes\":\"Bekijk Recepten\",\"Log_Cooking\":\"Log Bereiding\",\"Proteins\":\"Eiwitten\",\"Fats\":\"Vetten\",\"Carbohydrates\":\"Koolhydraten\",\"Calories\":\"Calorieën\",\"Nutrition\":\"Voedingswaarde\",\"Date\":\"Datum\",\"Share\":\"Deel\",\"Export\":\"Exporteren\",\"Rating\":\"Beoordeling\",\"Close\":\"Sluiten\",\"Add\":\"Voeg toe\",\"Ingredients\":\"Ingrediënten\",\"min\":\"min\",\"Servings\":\"Porties\",\"Waiting\":\"Wachten\",\"Preparation\":\"Bereiding\",\"Edit\":\"Bewerken\",\"Open\":\"Open\",\"Save\":\"Opslaan\",\"Step\":\"Stap\",\"Search\":\"Zoeken\",\"Import\":\"Importeer\",\"Print\":\"Afdrukken\",\"Information\":\"Informatie\",\"Keywords\":\"Etiketten\",\"Books\":\"Boeken\",\"show_only_internal\":\"Toon alleen interne recepten\",\"New_Recipe\":\"Nieuw Recept\",\"Url_Import\":\"Importeer URL\",\"Reset_Search\":\"Zoeken resetten\",\"or\":\"of\",\"and\":\"en\",\"Recently_Viewed\":\"Recent bekeken\",\"External\":\"Externe\",\"Settings\":\"Instellingen\",\"Meal_Plan\":\"Maaltijdplan\",\"New\":\"Nieuw\",\"Supermarket\":\"Supermarkt\",\"Categories\":\"Categorieën\",\"Category\":\"Categorie\",\"Selected\":\"Geselecteerd\",\"Copy\":\"Kopie\",\"Link\":\"Link\",\"Sort_by_new\":\"Sorteer op nieuw\",\"Recipes_per_page\":\"Recepten per pagina\",\"Files\":\"Bestanden\",\"Size\":\"Grootte\",\"File\":\"Bestand\",\"err_fetching_resource\":\"Bij het ophalen van een hulpbron is een foutmelding opgetreden!\",\"err_creating_resource\":\"Bij het maken van een hulpbron is een foutmelding opgetreden!\",\"err_updating_resource\":\"Bij het updaten van een hulpbron is een foutmelding opgetreden!\",\"success_fetching_resource\":\"Hulpbron is succesvol opgehaald!\",\"success_creating_resource\":\"Hulpbron succesvol aangemaakt!\",\"success_updating_resource\":\"Hulpbron succesvol geüpdatet!\",\"Success\":\"Succes\",\"Download\":\"Download\",\"err_deleting_resource\":\"Bij het verwijderen van een hulpbron is een foutmelding opgetreden!\",\"success_deleting_resource\":\"Hulpbron succesvol verwijderd!\",\"Cancel\":\"Annuleer\",\"Delete\":\"Verwijder\",\"Ok\":\"Open\",\"Load_More\":\"Laad meer\",\"Manage_Books\":\"Beheer Boeken\",\"Create\":\"Maak\",\"Failure\":\"Storing\",\"View\":\"Bekijk\",\"Recipes\":\"Recepten\",\"Move\":\"Verplaats\",\"Parent\":\"Ouder\",\"move_confirmation\":\"Verplaats {child} naar ouder {parent}\",\"merge_confirmation\":\"Vervang {source} with {target}\",\"move_selection\":\"Selecteer een ouder om {child} naar te verplaatsen.\",\"merge_selection\":\"Vervang alle voorvallen van {source} door het type {type}.\",\"Root\":\"Bron\",\"show_split_screen\":\"Toon gesplitste weergave\",\"New_Keyword\":\"Nieuw Etiket\",\"Delete_Keyword\":\"Verwijder Etiket\",\"Edit_Keyword\":\"Bewerk Etiket\",\"Move_Keyword\":\"Verplaats Etiket\",\"Hide_Keywords\":\"Verberg Etiketten\",\"Hide_Recipes\":\"Verberg Recepten\",\"Advanced Search Settings\":\"Geavanceerde zoekinstellingen\",\"Merge\":\"Voeg samen\",\"delete_confimation\":\"Weet je zeker dat je {kw} en zijn kinderen wil verwijderen?\",\"Merge_Keyword\":\"Voeg Etiket samen\"}");

/***/ }),

/***/ "dc43":
/***/ (function(module) {

module.exports = JSON.parse("{\"err_fetching_resource\":\"\",\"err_creating_resource\":\"\",\"err_updating_resource\":\"\",\"err_deleting_resource\":\"\",\"success_fetching_resource\":\"\",\"success_creating_resource\":\"\",\"success_updating_resource\":\"\",\"success_deleting_resource\":\"\",\"import_running\":\"\",\"all_fields_optional\":\"\",\"convert_internal\":\"\",\"show_only_internal\":\"\",\"Log_Recipe_Cooking\":\"\",\"External_Recipe_Image\":\"外部菜谱图像\",\"Add_to_Shopping\":\"添加到购物\",\"Add_to_Plan\":\"添加到计划\",\"Step_start_time\":\"\",\"Sort_by_new\":\"\",\"Recipes_per_page\":\"\",\"Manage_Books\":\"管理书籍\",\"Meal_Plan\":\"\",\"Select_Book\":\"\",\"Recipe_Image\":\"菜谱图像\",\"Import_finished\":\"导入完成\",\"View_Recipes\":\"\",\"Log_Cooking\":\"\",\"New_Recipe\":\"新菜谱\",\"Url_Import\":\"导入网址\",\"Reset_Search\":\"重置搜索\",\"Recently_Viewed\":\"最近浏览\",\"Load_More\":\"加载更多\",\"Keywords\":\"关键字\",\"Books\":\"书籍\",\"Proteins\":\"蛋白质\",\"Fats\":\"脂肪\",\"Carbohydrates\":\"碳水化合物\",\"Calories\":\"卡路里\",\"Nutrition\":\"营养\",\"Date\":\"日期\",\"Share\":\"分享\",\"Export\":\"导出\",\"Copy\":\"拷贝\",\"Rating\":\"评分\",\"Close\":\"关闭\",\"Link\":\"链接\",\"Add\":\"添加\",\"New\":\"新\",\"Success\":\"成功\",\"Failure\":\"失败\",\"Ingredients\":\"材料\",\"Supermarket\":\"超级市场\",\"Categories\":\"分类\",\"Category\":\"分类\",\"Selected\":\"选定\",\"min\":\"\",\"Servings\":\"份量\",\"Waiting\":\"等待\",\"Preparation\":\"准备\",\"External\":\"外部\",\"Size\":\"大小\",\"Files\":\"文件\",\"File\":\"文件\",\"Edit\":\"编辑\",\"Cancel\":\"取消\",\"Delete\":\"删除\",\"Open\":\"打开\",\"Ok\":\"打开\",\"Save\":\"储存\",\"Step\":\"步骤\",\"Search\":\"搜索\",\"Import\":\"导入\",\"Print\":\"打印\",\"Settings\":\"设置\",\"or\":\"或\",\"and\":\"与\",\"Information\":\"更多资讯\",\"Download\":\"下载\",\"Create\":\"创立\"}");

/***/ }),

/***/ "dfc6":
/***/ (function(module) {

module.exports = JSON.parse("{\"err_fetching_resource\":\"\",\"err_creating_resource\":\"\",\"err_updating_resource\":\"\",\"err_deleting_resource\":\"\",\"success_fetching_resource\":\"\",\"success_creating_resource\":\"\",\"success_updating_resource\":\"\",\"success_deleting_resource\":\"\",\"import_running\":\"\",\"all_fields_optional\":\"\",\"convert_internal\":\"\",\"show_only_internal\":\"\",\"Log_Recipe_Cooking\":\"\",\"External_Recipe_Image\":\"\",\"Add_to_Book\":\"\",\"Add_to_Shopping\":\"\",\"Add_to_Plan\":\"\",\"Step_start_time\":\"\",\"Meal_Plan\":\"\",\"Select_Book\":\"\",\"Recipe_Image\":\"\",\"Import_finished\":\"\",\"View_Recipes\":\"\",\"Log_Cooking\":\"\",\"New_Recipe\":\"\",\"Url_Import\":\"\",\"Reset_Search\":\"\",\"Recently_Viewed\":\"\",\"Load_More\":\"\",\"Keywords\":\"\",\"Books\":\"\",\"Proteins\":\"\",\"Fats\":\"\",\"Carbohydrates\":\"\",\"Calories\":\"\",\"Nutrition\":\"\",\"Date\":\"\",\"Share\":\"\",\"Export\":\"\",\"Copy\":\"\",\"Rating\":\"\",\"Close\":\"\",\"Link\":\"\",\"Add\":\"\",\"New\":\"\",\"Success\":\"\",\"Ingredients\":\"\",\"Supermarket\":\"\",\"Categories\":\"\",\"Category\":\"\",\"Selected\":\"\",\"min\":\"\",\"Servings\":\"\",\"Waiting\":\"\",\"Preparation\":\"\",\"External\":\"\",\"Size\":\"\",\"Files\":\"\",\"File\":\"\",\"Edit\":\"\",\"Cancel\":\"\",\"Delete\":\"\",\"Open\":\"\",\"Ok\":\"\",\"Save\":\"\",\"Step\":\"\",\"Search\":\"\",\"Import\":\"\",\"Print\":\"\",\"Settings\":\"\",\"or\":\"\",\"and\":\"\",\"Information\":\"\",\"Download\":\"\"}");

/***/ }),

/***/ "edd4":
/***/ (function(module) {

module.exports = JSON.parse("{\"err_fetching_resource\":\"There was an error fetching a resource!\",\"err_creating_resource\":\"There was an error creating a resource!\",\"err_updating_resource\":\"There was an error updating a resource!\",\"err_deleting_resource\":\"There was an error deleting a resource!\",\"success_fetching_resource\":\"Successfully fetched a resource!\",\"success_creating_resource\":\"Successfully created a resource!\",\"success_updating_resource\":\"Successfully updated a resource!\",\"success_deleting_resource\":\"Successfully deleted a resource!\",\"import_running\":\"Import running, please wait!\",\"all_fields_optional\":\"All fields are optional and can be left empty.\",\"convert_internal\":\"Convert to internal recipe\",\"show_only_internal\":\"Show only internal recipes\",\"show_split_screen\":\"Show split view\",\"Log_Recipe_Cooking\":\"Log Recipe Cooking\",\"External_Recipe_Image\":\"External Recipe Image\",\"Add_to_Shopping\":\"Add to Shopping\",\"Add_to_Plan\":\"Add to Plan\",\"Step_start_time\":\"Step start time\",\"Sort_by_new\":\"Sort by new\",\"Recipes_per_page\":\"Recipes per Page\",\"Manage_Books\":\"Manage Books\",\"Meal_Plan\":\"Meal Plan\",\"Select_Book\":\"Select Book\",\"Recipe_Image\":\"Recipe Image\",\"Import_finished\":\"Import finished\",\"View_Recipes\":\"View Recipes\",\"Log_Cooking\":\"Log Cooking\",\"New_Recipe\":\"New Recipe\",\"Url_Import\":\"Url Import\",\"Reset_Search\":\"Reset Search\",\"Recently_Viewed\":\"Recently Viewed\",\"Load_More\":\"Load More\",\"New_Keyword\":\"New Keyword\",\"Delete_Keyword\":\"Delete Keyword\",\"Edit_Keyword\":\"Edit Keyword\",\"Move_Keyword\":\"Move Keyword\",\"Merge_Keyword\":\"Merge Keyword\",\"Hide_Keywords\":\"Hide Keywords\",\"Hide_Recipes\":\"Hide Recipes\",\"Keywords\":\"Keywords\",\"Books\":\"Books\",\"Proteins\":\"Proteins\",\"Fats\":\"Fats\",\"Carbohydrates\":\"Carbohydrates\",\"Calories\":\"Calories\",\"Nutrition\":\"Nutrition\",\"Date\":\"Date\",\"Share\":\"Share\",\"Export\":\"Export\",\"Copy\":\"Copy\",\"Rating\":\"Rating\",\"Close\":\"Close\",\"Cancel\":\"Cancel\",\"Link\":\"Link\",\"Add\":\"Add\",\"New\":\"New\",\"Success\":\"Success\",\"Failure\":\"Failure\",\"Ingredients\":\"Ingredients\",\"Supermarket\":\"Supermarket\",\"Categories\":\"Categories\",\"Category\":\"Category\",\"Selected\":\"Selected\",\"min\":\"min\",\"Servings\":\"Servings\",\"Waiting\":\"Waiting\",\"Preparation\":\"Preparation\",\"External\":\"External\",\"Size\":\"Size\",\"Files\":\"Files\",\"File\":\"File\",\"Edit\":\"Edit\",\"Delete\":\"Delete\",\"Open\":\"Open\",\"Ok\":\"Open\",\"Save\":\"Save\",\"Step\":\"Step\",\"Search\":\"Search\",\"Import\":\"Import\",\"Print\":\"Print\",\"Settings\":\"Settings\",\"or\":\"or\",\"and\":\"and\",\"Information\":\"Information\",\"Download\":\"Download\",\"Create\":\"Create\",\"Advanced Search Settings\":\"Advanced Search Settings\",\"View\":\"View\",\"Recipes\":\"Recipes\",\"Move\":\"Move\",\"Merge\":\"Merge\",\"Parent\":\"Parent\",\"delete_confirmation\":\"Are you sure that you want to delete {source}?\",\"move_confirmation\":\"Move {child} to parent {parent}\",\"merge_confirmation\":\"Replace {source} with {target}\",\"move_selection\":\"Select a parent {type} to move {source} to.\",\"merge_selection\":\"Replace all occurrences of {source} with the selected {type}.\",\"Root\":\"Root\",\"Ignore_Shopping\":\"Ignore Shopping\",\"Shopping_Category\":\"Shopping Category\",\"Edit_Food\":\"Edit Food\",\"Move_Food\":\"Move Food\",\"New_Food\":\"New Food\",\"Hide_Food\":\"Hide Food\",\"Delete_Food\":\"Delete Food\",\"No_ID\":\"ID not found, cannot delete.\",\"Meal_Plan_Days\":\"Future meal plans\",\"merge_title\":\"Merge {type}\",\"move_title\":\"Move {type}\",\"Food\":\"Food\",\"Recipe_Book\":\"Recipe Book\",\"del_confirmation_tree\":\"Are you sure that you want to delete {source} and all of it's children?\",\"delete_title\":\"Delete {type}\",\"create_title\":\"New {type}\",\"edit_title\":\"Edit {type}\",\"Name\":\"Name\",\"Description\":\"Description\",\"Recipe\":\"Recipe\",\"tree_root\":\"Root of Tree\",\"Icon\":\"Icon\",\"Unit\":\"Unit\",\"No_Results\":\"No Results\",\"New_Unit\":\"New Unit\",\"Create_New_Shopping Category\":\"Create New Shopping Category\",\"Create_New_Food\":\"Add New Food\",\"Create_New_Keyword\":\"Add New Keyword\",\"Create_New_Unit\":\"Add New Unit\"}");

/***/ }),

/***/ "f693":
/***/ (function(module) {

module.exports = JSON.parse("{\"err_fetching_resource\":\"Il y a eu une erreur pour récupérer une ressource !\",\"err_creating_resource\":\"Il y a eu une erreur pour créer une ressource !\",\"err_updating_resource\":\"Il y a eu une erreur pour mettre à jour une ressource !\",\"err_deleting_resource\":\"Il y a eu une erreur pour supprimer une ressource !\",\"success_fetching_resource\":\"Ressource correctement récupérée !\",\"success_creating_resource\":\"Ressource correctement créée !\",\"success_updating_resource\":\"Ressource correctement mise à jour !\",\"success_deleting_resource\":\"Ressource correctement supprimée !\",\"import_running\":\"Importation en cours, veuillez patienter !\",\"all_fields_optional\":\"Tous les champs sont optionnels et peuvent être laissés vides.\",\"convert_internal\":\"Convertir en recette interne\",\"show_only_internal\":\"Montrer uniquement les recettes internes\",\"Log_Recipe_Cooking\":\"Marquer la recette comme cuisinée\",\"External_Recipe_Image\":\"Image externe de recette\",\"Add_to_Shopping\":\"Ajouter à la liste de courses\",\"Add_to_Plan\":\"Ajouter au menu\",\"Step_start_time\":\"Heure de départ de l'étape\",\"Sort_by_new\":\"Trier par nouveautés\",\"Recipes_per_page\":\"Nombre de recettes par page\",\"Manage_Books\":\"Gérer les favoris\",\"Meal_Plan\":\"Menu de la semaine\",\"Select_Book\":\"Sélectionnez livre\",\"Recipe_Image\":\"Image de la recette\",\"Import_finished\":\"Importation finie\",\"View_Recipes\":\"Voir les recettes\",\"Log_Cooking\":\"Marquer comme cuisiné\",\"New_Recipe\":\"Nouvelle recette\",\"Url_Import\":\"Importation de l'url\",\"Reset_Search\":\"Réinitialiser la recherche\",\"Recently_Viewed\":\"Vu récemment\",\"Load_More\":\"Charger plus\",\"Keywords\":\"Mots-clés\",\"Books\":\"Livres\",\"Proteins\":\"Protéines\",\"Fats\":\"Matières grasses\",\"Carbohydrates\":\"Glucides\",\"Calories\":\"Calories\",\"Nutrition\":\"Informations nutritionnelles\",\"Date\":\"Date\",\"Share\":\"Partager\",\"Export\":\"Exporter\",\"Copy\":\"Copier\",\"Rating\":\"Note\",\"Close\":\"Fermer\",\"Link\":\"Lien\",\"Add\":\"Ajouter\",\"New\":\"Nouveau\",\"Success\":\"Réussite\",\"Failure\":\"Échec\",\"Ingredients\":\"Ingrédients\",\"Supermarket\":\"Supermarché\",\"Categories\":\"Catégories\",\"Category\":\"Catégorie\",\"Selected\":\"Sélectionné\",\"min\":\"min\",\"Servings\":\"Portions\",\"Waiting\":\"Attente\",\"Preparation\":\"Préparation\",\"External\":\"Externe\",\"Size\":\"Taille\",\"Files\":\"Fichiers\",\"File\":\"Fichier\",\"Edit\":\"Modifier\",\"Cancel\":\"Annuler\",\"Delete\":\"Supprimer\",\"Open\":\"Ouvrir\",\"Ok\":\"Ouvrir\",\"Save\":\"Sauvegarder\",\"Step\":\"Étape\",\"Search\":\"Rechercher\",\"Import\":\"Importer\",\"Print\":\"Imprimer\",\"Settings\":\"Paramètres\",\"or\":\"ou\",\"and\":\"et\",\"Information\":\"Information\",\"Download\":\"Télécharger\",\"Create\":\"Créer\",\"show_split_screen\":\"Voir la vue séparée\",\"New_Keyword\":\"Nouveau mot-clé\",\"Delete_Keyword\":\"Supprimer mot-clé\",\"Move_Keyword\":\"Déplacer mot-clé\",\"Merge_Keyword\":\"Fusionner mots-clés\",\"Hide_Recipes\":\"Cacher recettes\",\"Advanced Search Settings\":\"Paramètres de recherche avancée\",\"View\":\"Voir\",\"Recipes\":\"Recettes\",\"Move\":\"Déplacer\",\"Merge\":\"Fusionner\",\"Parent\":\"Parent\",\"move_confirmation\":\"Déplacer {child} vers le parent {parent}\",\"merge_confirmation\":\"Remplacer {source} par {target}\",\"Root\":\"Racine\",\"delete_confirmation\":\"Êtes-vous sûr de vouloir supprimer {source} ?\",\"Shopping_Category\":\"Catégorie de courses\",\"Ignore_Shopping\":\"Ignorer les courses\",\"Edit_Food\":\"Modifier aliment\",\"Move_Food\":\"Déplacer aliment\",\"New_Food\":\"Nouvel aliment\",\"Hide_Food\":\"Cacher l'aliment\",\"Delete_Food\":\"Supprimer l'aliment\",\"No_ID\":\"ID introuvable, il n'a pas pu être supprimé.\",\"Meal_Plan_Days\":\"Futurs menus\",\"merge_title\":\"Fusionner {type}\",\"Food\":\"Aliment\",\"Recipe_Book\":\"Livre de recettes\",\"delete_title\":\"Supprimer {type}\",\"create_title\":\"Nouveau {type}\",\"edit_title\":\"Modifier {type}\",\"Name\":\"Nom\",\"Description\":\"Description\",\"Recipe\":\"Recette\",\"tree_root\":\"Racine de l'arbre\",\"Edit_Keyword\":\"Modifier mot-clé\",\"Hide_Keywords\":\"Cacher mots-clés\",\"move_selection\":\"Sélectionner un parent {type} pour y déplacer {source}.\",\"merge_selection\":\"Remplace toutes les occurrences de {source} par {type}.\",\"move_title\":\"Déplacer {type}\",\"del_confirmation_tree\":\"Êtes-vous sûr de vouloir supprimer {source} et tous ses enfants ?\"}");

/***/ }),

/***/ "fa7d":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

// EXPORTS
__webpack_require__.d(__webpack_exports__, "f", function() { return /* binding */ ToastMixin; });
__webpack_require__.d(__webpack_exports__, "j", function() { return /* binding */ _makeToast; });
__webpack_require__.d(__webpack_exports__, "e", function() { return /* binding */ utils_StandardToasts; });
__webpack_require__.d(__webpack_exports__, "c", function() { return /* binding */ GettextMixin; });
__webpack_require__.d(__webpack_exports__, "h", function() { return /* binding */ djangoGettext; });
__webpack_require__.d(__webpack_exports__, "d", function() { return /* binding */ ResolveUrlMixin; });
__webpack_require__.d(__webpack_exports__, "k", function() { return /* binding */ _resolveDjangoUrl; });
__webpack_require__.d(__webpack_exports__, "g", function() { return /* binding */ calculateAmount; });
__webpack_require__.d(__webpack_exports__, "a", function() { return /* binding */ ApiMixin; });
__webpack_require__.d(__webpack_exports__, "i", function() { return /* binding */ getForm; });
__webpack_require__.d(__webpack_exports__, "b", function() { return /* binding */ CardMixin; });

// UNUSED EXPORTS: getUserPreference, roundDecimals

// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/esm/createForOfIteratorHelper.js
var createForOfIteratorHelper = __webpack_require__("b85c");

// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/esm/objectSpread2.js
var objectSpread2 = __webpack_require__("5530");

// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/esm/toConsumableArray.js + 3 modules
var toConsumableArray = __webpack_require__("2909");

// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/esm/slicedToArray.js + 3 modules
var slicedToArray = __webpack_require__("3835");

// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/esm/typeof.js
var esm_typeof = __webpack_require__("53ca");

// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/esm/classCallCheck.js
var classCallCheck = __webpack_require__("d4ec");

// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/esm/createClass.js
var createClass = __webpack_require__("bee2");

// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/esm/defineProperty.js
var defineProperty = __webpack_require__("ade3");

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.array.concat.js
var es_array_concat = __webpack_require__("99af");

// EXTERNAL MODULE: ./node_modules/core-js/modules/web.dom-collections.for-each.js
var web_dom_collections_for_each = __webpack_require__("159b");

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.object.entries.js
var es_object_entries = __webpack_require__("4fad");

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.array.includes.js
var es_array_includes = __webpack_require__("caad");

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.string.includes.js
var es_string_includes = __webpack_require__("2532");

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.function.name.js
var es_function_name = __webpack_require__("b0c0");

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.object.keys.js
var es_object_keys = __webpack_require__("b64b");

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.array.filter.js
var es_array_filter = __webpack_require__("4de4");

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.array.find.js
var es_array_find = __webpack_require__("7db0");

// EXTERNAL MODULE: ./node_modules/bootstrap-vue/esm/components/toast/toast.js
var toast_toast = __webpack_require__("59e4");

// EXTERNAL MODULE: ./src/i18n.js
var i18n = __webpack_require__("9225");

// CONCATENATED MODULE: ./src/utils/fractions.js
/* frac.js (C) 2012-present SheetJS -- http://sheetjs.com */

/* https://www.npmjs.com/package/frac Apache license*/
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
// EXTERNAL MODULE: ./src/utils/openapi/api.ts + 2 modules
var api = __webpack_require__("2b2d");

// EXTERNAL MODULE: ./node_modules/axios/index.js
var axios = __webpack_require__("bc3a");
var axios_default = /*#__PURE__*/__webpack_require__.n(axios);

// EXTERNAL MODULE: ./src/utils/models.js
var models = __webpack_require__("6369");

// EXTERNAL MODULE: ./node_modules/vue/dist/vue.esm.js
var vue_esm = __webpack_require__("a026");

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
  var toaster = new toast_toast["a" /* BToast */]();
  toaster.$bvToast.toast(message, {
    title: title,
    variant: variant,
    toaster: 'b-toaster-top-center',
    solid: true
  });
}


var utils_StandardToasts = /*#__PURE__*/function () {
  function StandardToasts() {
    Object(classCallCheck["a" /* default */])(this, StandardToasts);
  }

  Object(createClass["a" /* default */])(StandardToasts, null, [{
    key: "makeStandardToast",
    value: function makeStandardToast(toast) {
      switch (toast) {
        case StandardToasts.SUCCESS_CREATE:
          _makeToast(i18n["a" /* default */].tc('Success'), i18n["a" /* default */].tc('success_creating_resource'), 'success');

          break;

        case StandardToasts.SUCCESS_FETCH:
          _makeToast(i18n["a" /* default */].tc('Success'), i18n["a" /* default */].tc('success_fetching_resource'), 'success');

          break;

        case StandardToasts.SUCCESS_UPDATE:
          _makeToast(i18n["a" /* default */].tc('Success'), i18n["a" /* default */].tc('success_updating_resource'), 'success');

          break;

        case StandardToasts.SUCCESS_DELETE:
          _makeToast(i18n["a" /* default */].tc('Success'), i18n["a" /* default */].tc('success_deleting_resource'), 'success');

          break;

        case StandardToasts.FAIL_CREATE:
          _makeToast(i18n["a" /* default */].tc('Failure'), i18n["a" /* default */].tc('err_creating_resource'), 'danger');

          break;

        case StandardToasts.FAIL_FETCH:
          _makeToast(i18n["a" /* default */].tc('Failure'), i18n["a" /* default */].tc('err_fetching_resource'), 'danger');

          break;

        case StandardToasts.FAIL_UPDATE:
          _makeToast(i18n["a" /* default */].tc('Failure'), i18n["a" /* default */].tc('err_updating_resource'), 'danger');

          break;

        case StandardToasts.FAIL_DELETE:
          _makeToast(i18n["a" /* default */].tc('Failure'), i18n["a" /* default */].tc('err_deleting_resource'), 'danger');

          break;
      }
    }
  }]);

  return StandardToasts;
}();
/*
* Utility functions to use djangos gettext
* */

Object(defineProperty["a" /* default */])(utils_StandardToasts, "SUCCESS_CREATE", 'SUCCESS_CREATE');

Object(defineProperty["a" /* default */])(utils_StandardToasts, "SUCCESS_FETCH", 'SUCCESS_FETCH');

Object(defineProperty["a" /* default */])(utils_StandardToasts, "SUCCESS_UPDATE", 'SUCCESS_UPDATE');

Object(defineProperty["a" /* default */])(utils_StandardToasts, "SUCCESS_DELETE", 'SUCCESS_DELETE');

Object(defineProperty["a" /* default */])(utils_StandardToasts, "FAIL_CREATE", 'FAIL_CREATE');

Object(defineProperty["a" /* default */])(utils_StandardToasts, "FAIL_FETCH", 'FAIL_FETCH');

Object(defineProperty["a" /* default */])(utils_StandardToasts, "FAIL_UPDATE", 'FAIL_UPDATE');

Object(defineProperty["a" /* default */])(utils_StandardToasts, "FAIL_DELETE", 'FAIL_DELETE');

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
    var fraction = frac(amount * factor, 10, true);

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
/*
* Utility functions to use OpenAPIs generically
* */

 // TODO: is it possible to only import inside the Mixin?


axios_default.a.defaults.xsrfCookieName = 'csrftoken';
axios_default.a.defaults.xsrfHeaderName = "X-CSRFTOKEN";

var ApiMixin = {
  data: function data() {
    return {
      Models: models["b" /* Models */],
      Actions: models["a" /* Actions */]
    };
  },
  methods: {
    genericAPI: function genericAPI(model, action, options) {
      var _setup$config, _setup$params;

      var setup = getConfig(model, action);
      var func = setup.function;
      var config = (_setup$config = setup === null || setup === void 0 ? void 0 : setup.config) !== null && _setup$config !== void 0 ? _setup$config : {};
      var params = (_setup$params = setup === null || setup === void 0 ? void 0 : setup.params) !== null && _setup$params !== void 0 ? _setup$params : [];
      var parameters = [];
      var this_value = undefined;
      params.forEach(function (item, index) {
        if (Array.isArray(item)) {
          this_value = {}; // if the value is an array, convert it to a dictionary of key:value
          // filtered based on OPTIONS passed
          // maybe map/reduce is better?

          for (var _i = 0, _Object$entries = Object.entries(options); _i < _Object$entries.length; _i++) {
            var _Object$entries$_i = Object(slicedToArray["a" /* default */])(_Object$entries[_i], 2),
                k = _Object$entries$_i[0],
                v = _Object$entries$_i[1];

            if (item.includes(k)) {
              this_value[k] = formatParam(config === null || config === void 0 ? void 0 : config[k], v);
            }
          }
        } else {
          var _options$item;

          this_value = formatParam(config === null || config === void 0 ? void 0 : config[item], (_options$item = options === null || options === void 0 ? void 0 : options[item]) !== null && _options$item !== void 0 ? _options$item : undefined);
        } // if no value is found so far, get the default if it exists


        if (this_value === undefined) {
          this_value = getDefault(config === null || config === void 0 ? void 0 : config[item], options);
        }

        parameters.push(this_value);
      });
      var apiClient = new api["a" /* ApiApiFactory */]();
      return apiClient[func].apply(apiClient, parameters);
    }
  }
}; // /*
// * local functions for ApiMixin
// * */

function formatParam(config, value) {
  if (config) {
    for (var _i2 = 0, _Object$entries2 = Object.entries(config); _i2 < _Object$entries2.length; _i2++) {
      var _Object$entries2$_i = Object(slicedToArray["a" /* default */])(_Object$entries2[_i2], 2),
          k = _Object$entries2$_i[0],
          v = _Object$entries2$_i[1];

      switch (k) {
        case 'type':
          switch (v) {
            case 'string':
              if (value !== undefined) {
                value = String(value);
              }

              break;

            case 'integer':
              value = parseInt(value);
          }

          break;
      }
    }
  }

  return value;
}

function getDefault(config, options) {
  var _config$default, _options$value$check, _options$value$check2;

  var value = undefined;
  value = (_config$default = config === null || config === void 0 ? void 0 : config.default) !== null && _config$default !== void 0 ? _config$default : undefined;

  if (Object(esm_typeof["a" /* default */])(value) === 'object') {
    var condition = false;

    switch (value.function) {
      // CONDITIONAL case requires 4 keys:
      // - check: which other OPTIONS key to check against
      // - operator: what type of operation to perform
      // - true: what value to assign when true
      // - false: what value to assign when false
      case 'CONDITIONAL':
        switch (value.operator) {
          case 'not_exist':
            condition = ((_options$value$check = !(options !== null && options !== void 0 && options[value.check])) !== null && _options$value$check !== void 0 ? _options$value$check : undefined) || (options === null || options === void 0 ? void 0 : (_options$value$check2 = options[value.check]) === null || _options$value$check2 === void 0 ? void 0 : _options$value$check2.length) == 0;

            if (condition) {
              value = value.true;
            } else {
              value = value.false;
            }

            break;
        }

        break;
    }
  }

  return value;
}

function getConfig(model, action) {
  var _model$f, _model$model_type, _model$model_type2, _model$model_type2$f, _model$f2, _config$suffix, _config;

  var f = action.function; // if not defined partialUpdate will use params from create

  if (f === 'partialUpdate' && !(model !== null && model !== void 0 && (_model$f = model[f]) !== null && _model$f !== void 0 && _model$f.params)) {
    model[f] = {
      'params': ['id'].concat(Object(toConsumableArray["a" /* default */])(model.create.params))
    };
  }

  var config = {
    'name': model.name,
    'apiName': model.apiName
  }; // spread operator merges dictionaries - last item in list takes precedence

  config = Object(objectSpread2["a" /* default */])(Object(objectSpread2["a" /* default */])(Object(objectSpread2["a" /* default */])(Object(objectSpread2["a" /* default */])({}, config), action), (_model$model_type = model.model_type) === null || _model$model_type === void 0 ? void 0 : _model$model_type[f]), model === null || model === void 0 ? void 0 : model[f]); // nested dictionaries are not merged - so merge again on any nested keys

  config.config = Object(objectSpread2["a" /* default */])(Object(objectSpread2["a" /* default */])(Object(objectSpread2["a" /* default */])({}, action === null || action === void 0 ? void 0 : action.config), (_model$model_type2 = model.model_type) === null || _model$model_type2 === void 0 ? void 0 : (_model$model_type2$f = _model$model_type2[f]) === null || _model$model_type2$f === void 0 ? void 0 : _model$model_type2$f.config), model === null || model === void 0 ? void 0 : (_model$f2 = model[f]) === null || _model$f2 === void 0 ? void 0 : _model$f2.config);
  config['function'] = f + config.apiName + ((_config$suffix = (_config = config) === null || _config === void 0 ? void 0 : _config.suffix) !== null && _config$suffix !== void 0 ? _config$suffix : ''); // parens are required to force optional chaining to evaluate before concat

  return config;
} // /*
// * functions for Generic Modal Forms
// * */


function getForm(model, action, item1, item2) {
  var _model$model_type3, _model$model_type3$f, _model$f3;

  var f = action.function;

  var config = Object(objectSpread2["a" /* default */])(Object(objectSpread2["a" /* default */])(Object(objectSpread2["a" /* default */])({}, action === null || action === void 0 ? void 0 : action.form), (_model$model_type3 = model.model_type) === null || _model$model_type3 === void 0 ? void 0 : (_model$model_type3$f = _model$model_type3[f]) === null || _model$model_type3$f === void 0 ? void 0 : _model$model_type3$f.form), model === null || model === void 0 ? void 0 : (_model$f3 = model[f]) === null || _model$f3 === void 0 ? void 0 : _model$f3.form); // if not defined partialUpdate will use form from create 


  if (f === 'partialUpdate' && Object.keys(config).length == 0) {
    var _Actions$CREATE, _model$model_type4, _model$model_type4$cr, _model$create, _model$model_type5, _model$model_type5$f, _model$f4;

    config = Object(objectSpread2["a" /* default */])(Object(objectSpread2["a" /* default */])(Object(objectSpread2["a" /* default */])({}, (_Actions$CREATE = models["a" /* Actions */].CREATE) === null || _Actions$CREATE === void 0 ? void 0 : _Actions$CREATE.form), (_model$model_type4 = model.model_type) === null || _model$model_type4 === void 0 ? void 0 : (_model$model_type4$cr = _model$model_type4['create']) === null || _model$model_type4$cr === void 0 ? void 0 : _model$model_type4$cr.form), model === null || model === void 0 ? void 0 : (_model$create = model['create']) === null || _model$create === void 0 ? void 0 : _model$create.form);
    config['title'] = Object(objectSpread2["a" /* default */])(Object(objectSpread2["a" /* default */])(Object(objectSpread2["a" /* default */])({}, action === null || action === void 0 ? void 0 : action.form_title), (_model$model_type5 = model.model_type) === null || _model$model_type5 === void 0 ? void 0 : (_model$model_type5$f = _model$model_type5[f]) === null || _model$model_type5$f === void 0 ? void 0 : _model$model_type5$f.form_title), model === null || model === void 0 ? void 0 : (_model$f4 = model[f]) === null || _model$f4 === void 0 ? void 0 : _model$f4.form_title);
  }

  var form = {
    'fields': []
  };
  var value = '';

  for (var _i3 = 0, _Object$entries3 = Object.entries(config); _i3 < _Object$entries3.length; _i3++) {
    var _value;

    var _Object$entries3$_i = Object(slicedToArray["a" /* default */])(_Object$entries3[_i3], 2),
        k = _Object$entries3$_i[0],
        v = _Object$entries3$_i[1];

    if (v !== null && v !== void 0 && v.function) {
      switch (v.function) {
        case 'translate':
          value = formTranslate(v, model, item1, item2);
      }
    } else {
      value = v;
    }

    if ((_value = value) !== null && _value !== void 0 && _value.form_field) {
      var _item1$value$field, _value2, _value3, _value4;

      value['value'] = (_item1$value$field = item1 === null || item1 === void 0 ? void 0 : item1[(_value2 = value) === null || _value2 === void 0 ? void 0 : _value2.field]) !== null && _item1$value$field !== void 0 ? _item1$value$field : undefined;
      form.fields.push(Object(objectSpread2["a" /* default */])(Object(objectSpread2["a" /* default */])({}, value), {
        'label': formTranslate((_value3 = value) === null || _value3 === void 0 ? void 0 : _value3.label, model, item1, item2),
        'placeholder': formTranslate((_value4 = value) === null || _value4 === void 0 ? void 0 : _value4.placeholder, model, item1, item2)
      }));
    } else {
      form[k] = value;
    }
  }

  return form;
}

function formTranslate(translate, model, item1, item2) {
  if (Object(esm_typeof["a" /* default */])(translate) !== 'object') {
    return translate;
  }

  var phrase = translate.phrase;
  var options = {};
  var obj = undefined;
  translate === null || translate === void 0 ? void 0 : translate.params.forEach(function (x, index) {
    switch (x.from) {
      case 'item1':
        obj = item1;
        break;

      case 'item2':
        obj = item2;
        break;

      case 'model':
        obj = model;
    }

    options[x.token] = obj[x.attribute];
  });
  return i18n["a" /* default */].t(phrase, options);
} // /*
// * Utility functions to use manipulate nested components
// * */



var CardMixin = {
  methods: {
    findCard: function findCard(id, card_list) {
      var _card_list$length;

      var card_length = (_card_list$length = card_list === null || card_list === void 0 ? void 0 : card_list.length) !== null && _card_list$length !== void 0 ? _card_list$length : 0;

      if (card_length == 0) {
        return false;
      }

      var cards = card_list.filter(function (obj) {
        return obj.id == id;
      });

      if (cards.length == 1) {
        return cards[0];
      } else if (cards.length == 0) {
        var _iterator = Object(createForOfIteratorHelper["a" /* default */])(card_list.filter(function (x) {
          return x.show_children == true;
        })),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var c = _step.value;
            cards = this.findCard(id, c.children);

            if (cards) {
              return cards;
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      } else {
        console.log('something terrible happened');
      }
    },
    destroyCard: function destroyCard(id, card_list) {
      var _card$parent;

      var card = this.findCard(id, card_list);
      var p_id = (_card$parent = card === null || card === void 0 ? void 0 : card.parent) !== null && _card$parent !== void 0 ? _card$parent : undefined;

      if (p_id) {
        var parent = this.findCard(p_id, card_list);

        if (parent) {
          vue_esm["default"].set(parent, 'numchild', parent.numchild - 1);

          if (parent.show_children) {
            var idx = parent.children.indexOf(parent.children.find(function (x) {
              return x.id === id;
            }));
            vue_esm["default"].delete(parent.children, idx);
          }
        }
      }

      return card_list.filter(function (x) {
        return x.id != id;
      });
    },
    refreshCard: function refreshCard(obj, card_list) {
      var _target;

      var target = {};
      var idx = undefined;
      target = this.findCard(obj.id, card_list);

      if (target) {
        idx = card_list.indexOf(card_list.find(function (x) {
          return x.id === target.id;
        }));
        vue_esm["default"].set(card_list, idx, obj);
      }

      if ((_target = target) !== null && _target !== void 0 && _target.parent) {
        var parent = this.findCard(target.parent, card_list);

        if (parent) {
          if (parent.show_children) {
            idx = parent.children.indexOf(parent.children.find(function (x) {
              return x.id === target.id;
            }));
            vue_esm["default"].set(parent.children, idx, obj);
          }
        }
      }
    }
  }
};

/***/ })

/******/ });