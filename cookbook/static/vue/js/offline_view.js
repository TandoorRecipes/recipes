(function(e){function t(t){for(var r,i,s=t[0],c=t[1],d=t[2],u=0,f=[];u<s.length;u++)i=s[u],Object.prototype.hasOwnProperty.call(o,i)&&o[i]&&f.push(o[i][0]),o[i]=0;for(r in c)Object.prototype.hasOwnProperty.call(c,r)&&(e[r]=c[r]);l&&l(t);while(f.length)f.shift()();return a.push.apply(a,d||[]),n()}function n(){for(var e,t=0;t<a.length;t++){for(var n=a[t],r=!0,s=1;s<n.length;s++){var c=n[s];0!==o[c]&&(r=!1)}r&&(a.splice(t--,1),e=i(i.s=n[0]))}return e}var r={},o={offline_view:0},a=[];function i(t){if(r[t])return r[t].exports;var n=r[t]={i:t,l:!1,exports:{}};return e[t].call(n.exports,n,n.exports,i),n.l=!0,n.exports}i.m=e,i.c=r,i.d=function(e,t,n){i.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},i.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},i.t=function(e,t){if(1&t&&(e=i(e)),8&t)return e;if(4&t&&"object"===typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(i.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)i.d(n,r,function(t){return e[t]}.bind(null,r));return n},i.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return i.d(t,"a",t),t},i.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},i.p="";var s=window["webpackJsonp"]=window["webpackJsonp"]||[],c=s.push.bind(s);s.push=t,s=s.slice();for(var d=0;d<s.length;d++)t(s[d]);var l=c;a.push([2,"chunk-vendors"]),n()})({2:function(e,t,n){e.exports=n("da67")},4678:function(e,t,n){var r={"./af":"2bfb","./af.js":"2bfb","./ar":"8e73","./ar-dz":"a356","./ar-dz.js":"a356","./ar-kw":"423e","./ar-kw.js":"423e","./ar-ly":"1cfd","./ar-ly.js":"1cfd","./ar-ma":"0a84","./ar-ma.js":"0a84","./ar-sa":"8230","./ar-sa.js":"8230","./ar-tn":"6d83","./ar-tn.js":"6d83","./ar.js":"8e73","./az":"485c","./az.js":"485c","./be":"1fc1","./be.js":"1fc1","./bg":"84aa","./bg.js":"84aa","./bm":"a7fa","./bm.js":"a7fa","./bn":"9043","./bn-bd":"9686","./bn-bd.js":"9686","./bn.js":"9043","./bo":"d26a","./bo.js":"d26a","./br":"6887","./br.js":"6887","./bs":"2554","./bs.js":"2554","./ca":"d716","./ca.js":"d716","./cs":"3c0d","./cs.js":"3c0d","./cv":"03ec","./cv.js":"03ec","./cy":"9797","./cy.js":"9797","./da":"0f14","./da.js":"0f14","./de":"b469","./de-at":"b3eb","./de-at.js":"b3eb","./de-ch":"bb71","./de-ch.js":"bb71","./de.js":"b469","./dv":"598a","./dv.js":"598a","./el":"8d47","./el.js":"8d47","./en-au":"0e6b","./en-au.js":"0e6b","./en-ca":"3886","./en-ca.js":"3886","./en-gb":"39a6","./en-gb.js":"39a6","./en-ie":"e1d3","./en-ie.js":"e1d3","./en-il":"7333","./en-il.js":"7333","./en-in":"ec2e","./en-in.js":"ec2e","./en-nz":"6f50","./en-nz.js":"6f50","./en-sg":"b7e9","./en-sg.js":"b7e9","./eo":"65db","./eo.js":"65db","./es":"898b","./es-do":"0a3c","./es-do.js":"0a3c","./es-mx":"b5b7","./es-mx.js":"b5b7","./es-us":"55c9","./es-us.js":"55c9","./es.js":"898b","./et":"ec18","./et.js":"ec18","./eu":"0ff2","./eu.js":"0ff2","./fa":"8df4","./fa.js":"8df4","./fi":"81e9","./fi.js":"81e9","./fil":"d69a","./fil.js":"d69a","./fo":"0721","./fo.js":"0721","./fr":"9f26","./fr-ca":"d9f8","./fr-ca.js":"d9f8","./fr-ch":"0e49","./fr-ch.js":"0e49","./fr.js":"9f26","./fy":"7118","./fy.js":"7118","./ga":"5120","./ga.js":"5120","./gd":"f6b4","./gd.js":"f6b4","./gl":"8840","./gl.js":"8840","./gom-deva":"aaf2","./gom-deva.js":"aaf2","./gom-latn":"0caa","./gom-latn.js":"0caa","./gu":"e0c5","./gu.js":"e0c5","./he":"c7aa","./he.js":"c7aa","./hi":"dc4d","./hi.js":"dc4d","./hr":"4ba9","./hr.js":"4ba9","./hu":"5b14","./hu.js":"5b14","./hy-am":"d6b6","./hy-am.js":"d6b6","./id":"5038","./id.js":"5038","./is":"0558","./is.js":"0558","./it":"6e98","./it-ch":"6f12","./it-ch.js":"6f12","./it.js":"6e98","./ja":"079e","./ja.js":"079e","./jv":"b540","./jv.js":"b540","./ka":"201b","./ka.js":"201b","./kk":"6d79","./kk.js":"6d79","./km":"e81d","./km.js":"e81d","./kn":"3e92","./kn.js":"3e92","./ko":"22f8","./ko.js":"22f8","./ku":"2421","./ku.js":"2421","./ky":"9609","./ky.js":"9609","./lb":"440c","./lb.js":"440c","./lo":"b29d","./lo.js":"b29d","./lt":"26f9","./lt.js":"26f9","./lv":"b97c","./lv.js":"b97c","./me":"293c","./me.js":"293c","./mi":"688b","./mi.js":"688b","./mk":"6909","./mk.js":"6909","./ml":"02fb","./ml.js":"02fb","./mn":"958b","./mn.js":"958b","./mr":"39bd","./mr.js":"39bd","./ms":"ebe4","./ms-my":"6403","./ms-my.js":"6403","./ms.js":"ebe4","./mt":"1b45","./mt.js":"1b45","./my":"8689","./my.js":"8689","./nb":"6ce3","./nb.js":"6ce3","./ne":"3a39","./ne.js":"3a39","./nl":"facd","./nl-be":"db29","./nl-be.js":"db29","./nl.js":"facd","./nn":"b84c","./nn.js":"b84c","./oc-lnc":"167b","./oc-lnc.js":"167b","./pa-in":"f3ff","./pa-in.js":"f3ff","./pl":"8d57","./pl.js":"8d57","./pt":"f260","./pt-br":"d2d4","./pt-br.js":"d2d4","./pt.js":"f260","./ro":"972c","./ro.js":"972c","./ru":"957c","./ru.js":"957c","./sd":"6784","./sd.js":"6784","./se":"ffff","./se.js":"ffff","./si":"eda5","./si.js":"eda5","./sk":"7be6","./sk.js":"7be6","./sl":"8155","./sl.js":"8155","./sq":"c8f3","./sq.js":"c8f3","./sr":"cf1e","./sr-cyrl":"13e9","./sr-cyrl.js":"13e9","./sr.js":"cf1e","./ss":"52bd","./ss.js":"52bd","./sv":"5fbd","./sv.js":"5fbd","./sw":"74dc","./sw.js":"74dc","./ta":"3de5","./ta.js":"3de5","./te":"5cbb","./te.js":"5cbb","./tet":"576c","./tet.js":"576c","./tg":"3b1b","./tg.js":"3b1b","./th":"10e8","./th.js":"10e8","./tk":"5aff","./tk.js":"5aff","./tl-ph":"0f38","./tl-ph.js":"0f38","./tlh":"cf755","./tlh.js":"cf755","./tr":"0e81","./tr.js":"0e81","./tzl":"cf51","./tzl.js":"cf51","./tzm":"c109","./tzm-latn":"b53d","./tzm-latn.js":"b53d","./tzm.js":"c109","./ug-cn":"6117","./ug-cn.js":"6117","./uk":"ada2","./uk.js":"ada2","./ur":"5294","./ur.js":"5294","./uz":"2e8c","./uz-latn":"010e","./uz-latn.js":"010e","./uz.js":"2e8c","./vi":"2921","./vi.js":"2921","./x-pseudo":"fd7e","./x-pseudo.js":"fd7e","./yo":"7f33","./yo.js":"7f33","./zh-cn":"5c3a","./zh-cn.js":"5c3a","./zh-hk":"49ab","./zh-hk.js":"49ab","./zh-mo":"3a6c","./zh-mo.js":"3a6c","./zh-tw":"90ea","./zh-tw.js":"90ea"};function o(e){var t=a(e);return n(t)}function a(e){if(!n.o(r,e)){var t=new Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}return r[e]}o.keys=function(){return Object.keys(r)},o.resolve=a,e.exports=o,o.id="4678"},"49f8":function(e,t,n){var r={"./de.json":"6ce2","./en.json":"edd4","./nl.json":"a625","./sv.json":"4c5b"};function o(e){var t=a(e);return n(t)}function a(e){if(!n.o(r,e)){var t=new Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}return r[e]}o.keys=function(){return Object.keys(r)},o.resolve=a,e.exports=o,o.id="49f8"},"4c5b":function(e){e.exports=JSON.parse('{"import_running":"Import pågår, var god vänta!","all_fields_optional":"Alla rutor är valfria och kan lämnas tomma.","convert_internal":"Konvertera till internt recept","Log_Recipe_Cooking":"Logga tillagningen av receptet","External_Recipe_Image":"Externt receptbild","Add_to_Book":"Lägg till i kokbok","Add_to_Shopping":"Lägg till i handelslista","Add_to_Plan":"Lägg till i matsedel","Step_start_time":"Steg starttid","Select_Book":"Välj kokbok","Recipe_Image":"Receptbild","Import_finished":"Importering klar","View_Recipes":"Visa recept","Log_Cooking":"Logga tillagning","Proteins":"Protein","Fats":"Fett","Carbohydrates":"Kolhydrater","Calories":"Kalorier","Nutrition":"Näringsinnehåll","Date":"Datum","Share":"Dela","Export":"Exportera","Rating":"Betyg","Close":"Stäng","Add":"Lägg till","Ingredients":"Ingredienser","min":"min","Servings":"Portioner","Waiting":"Väntan","Preparation":"Förberedelse","Edit":"Redigera","Open":"Öppna","Save":"Spara","Step":"Steg","Search":"Sök","Import":"Importera","Print":"Skriv ut","Information":"Information"}')},"6ce2":function(e){e.exports=JSON.parse('{"Import":"Import","import_running":"Import läuft, bitte warten!","Import_finished":"Import fertig","View_Recipes":"Rezepte Ansehen","Information":"Information","all_fields_optional":"Alle Felder sind optional und können leer gelassen werden.","convert_internal":"Zu internem Rezept wandeln","Log_Recipe_Cooking":"Kochen protokollieren","External_Recipe_Image":"Externes Rezept Bild","Add_to_Book":"Zu Buch hinzufügen","Add_to_Shopping":"Zu Einkaufsliste hinzufügen","Add_to_Plan":"Zu Plan hinzufügen","Step_start_time":"Schritt Startzeit","Select_Book":"Buch wählen","Recipe_Image":"Rezept Bild","Log_Cooking":"Kochen protokollieren","Proteins":"Proteine","Fats":"Fette","Carbohydrates":"Kohlenhydrate","Calories":"Kalorien","Nutrition":"Nährwerte","Keywords":"Stichwörter","Books":"Bücher","show_only_internal":"Nur interne Rezepte anzeigen","Ingredients":"Zutaten","min":"Min","Servings":"Portionen","Waiting":"Wartezeit","Preparation":"Zubereitung","Edit":"Bearbeiten","Open":"Öffnen","Save":"Speichern","Step":"Schritt","Search":"Suchen","Print":"Drucken","New_Recipe":"Neues Rezept","Url_Import":"URL Import","Reset_Search":"Suche zurücksetzen","or":"oder","and":"und","Recently_Viewed":"Kürzlich angesehen","External":"Extern","Settings":"Einstellungen","Meal_Plan":"Speiseplan","Date":"Datum","Share":"Teilen","Export":"Exportieren","Rating":"Bewertung","Close":"Schließen","Add":"Hinzufügen"}')},9225:function(e,t,n){"use strict";n("159b"),n("d3b7"),n("ddb0"),n("ac1f"),n("466d");var r=n("a026"),o=n("a925");function a(){var e=n("49f8"),t={};return e.keys().forEach((function(n){var r=n.match(/([A-Za-z0-9-_]+)\./i);if(r&&r.length>1){var o=r[1];t[o]=e(n)}})),t}r["default"].use(o["a"]),t["a"]=new o["a"]({locale:Object({NODE_ENV:"production",BASE_URL:""}).VUE_APP_I18N_LOCALE||"en",fallbackLocale:Object({NODE_ENV:"production",BASE_URL:""}).VUE_APP_I18N_FALLBACK_LOCALE||"en",messages:a()})},a625:function(e){e.exports=JSON.parse('{"import_running":"Er wordt geïmporteerd, even geduld!","all_fields_optional":"Alle velden zijn optioneel en kunnen leeg gelaten worden.","convert_internal":"Zet om naar intern recept","Log_Recipe_Cooking":"Log Bereiding","External_Recipe_Image":"Externe Afbeelding Recept","Add_to_Book":"Voeg toe aan Boek","Add_to_Shopping":"Voeg toe aan Boodschappenlijst","Add_to_Plan":"Voeg toe aan Plan","Step_start_time":"Starttijd stap","Select_Book":"Selecteer Boek","Recipe_Image":"Afbeelding Recept","Import_finished":"Importeren gereed","View_Recipes":"Bekijk Recepten","Log_Cooking":"Log Bereiding","Proteins":"Eiwitten","Fats":"Vetten","Carbohydrates":"Koolhydraten","Calories":"Calorieën","Nutrition":"Voedingswaarde","Date":"Datum","Share":"Deel","Export":"Exporteren","Rating":"Beoordeling","Close":"Sluiten","Add":"Voeg toe","Ingredients":"Ingrediënten","min":"min","Servings":"Porties","Waiting":"Wachten","Preparation":"Bereiding","Edit":"Bewerken","Open":"Open","Save":"Opslaan","Step":"Stap","Search":"Zoeken","Import":"Importeer","Print":"Afdrukken","Information":"Informatie","Keywords":"Etiketten","Books":"Boeken","show_only_internal":"Toon alleen interne recepten","New_Recipe":"Nieuw Recept","Url_Import":"Importeer URL","Reset_Search":"Zoeken resetten","or":"of","and":"en","Recently_Viewed":"Recent bekeken","External":"Externe","Settings":"Instellingen","Meal_Plan":"Maaltijdplan","New":"Nieuw","Supermarket":"Supermarkt","Categories":"Categorieën","Category":"Categorie","Selected":"Geselecteerd"}')},da67:function(e,t,n){"use strict";n.r(t);n("e260"),n("e6cf"),n("cca6"),n("a79d");var r=n("a026"),o=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{attrs:{id:"app"}},[n("label",[e._v(" "+e._s(e.$t("Search"))+" "),n("input",{directives:[{name:"model",rawName:"v-model",value:e.filter,expression:"filter"}],staticClass:"form-control",attrs:{type:"text"},domProps:{value:e.filter},on:{input:function(t){t.target.composing||(e.filter=t.target.value)}}})]),n("div",{staticClass:"row"},e._l(e.filtered_recipes,(function(t){return n("div",{key:t.id,staticClass:"col-md-3"},[n("b-card",{attrs:{title:t.name,tag:"article"}},[n("b-card-text",[n("span",{staticClass:"text-muted"},[e._v(e._s(e.formatDateTime(t.updated_at)))]),e._v(" "+e._s(t.description)+" ")]),n("b-button",{attrs:{href:e.resolveDjangoUrl("view_recipe",t.id),variant:"primary"}},[e._v(e._s(e.$t("Open")))])],1)],1)})),0)])},a=[],i=(n("159b"),n("caad"),n("2532"),n("b0c0"),n("4de4"),n("d3b7"),n("ddb0"),n("ac1f"),n("466d"),n("5f5b")),s=(n("2dd8"),n("fa7d")),c=n("c1df"),d=n.n(c);r["default"].use(i["a"]),r["default"].prototype.moment=d.a;var l={name:"OfflineView",mixins:[s["b"]],computed:{filtered_recipes:function(){var e=this,t={};return this.recipes.forEach((function(n){n.name.toLowerCase().includes(e.filter.toLowerCase())&&(n.id in t?n.updated_at>t[n.id].updated_at&&(t[n.id]=n):t[n.id]=n)})),t}},data:function(){return{recipes:[],filter:""}},mounted:function(){this.loadRecipe()},methods:{formatDateTime:function(e){return d.a.locale(window.navigator.language),d()(e).format("LLL")},loadRecipe:function(){var e=this;caches.open("api-recipe").then((function(t){t.keys().then((function(t){t.forEach((function(t){caches.match(t).then((function(t){t.json().then((function(t){e.recipes.push(t)}))}))}))}))}))}}},u=l,f=n("2877"),p=Object(f["a"])(u,o,a,!1,null,null,null),g=p.exports,_=n("9225");r["default"].config.productionTip=!1,new r["default"]({i18n:_["a"],render:function(e){return e(g)}}).$mount("#app")},edd4:function(e){e.exports=JSON.parse('{"err_fetching_resource":"There was an error fetching a resource!","err_creating_resource":"There was an error creating a resource!","err_updating_resource":"There was an error updating a resource!","err_deleting_resource":"There was an error deleting a resource!","success_fetching_resource":"Successfully fetched a resource!","success_creating_resource":"Successfully created a resource!","success_updating_resource":"Successfully updated a resource!","success_deleting_resource":"Successfully deleted a resource!","import_running":"Import running, please wait!","all_fields_optional":"All fields are optional and can be left empty.","convert_internal":"Convert to internal recipe","show_only_internal":"Show only internal recipes","show_split_screen":"Show split view","Log_Recipe_Cooking":"Log Recipe Cooking","External_Recipe_Image":"External Recipe Image","Add_to_Book":"Add to Book","Add_to_Shopping":"Add to Shopping","Add_to_Plan":"Add to Plan","Step_start_time":"Step start time","Meal_Plan":"Meal Plan","Select_Book":"Select Book","Recipe_Image":"Recipe Image","Import_finished":"Import finished","View_Recipes":"View Recipes","Log_Cooking":"Log Cooking","New_Recipe":"New Recipe","Url_Import":"Url Import","Reset_Search":"Reset Search","Recently_Viewed":"Recently Viewed","Load_More":"Load More","New_Keyword":"New Keyword","Delete_Keyword":"Delete Keyword","Edit_Keyword":"Edit Keyword","Move_Keyword":"Move Keyword","Merge_Keyword":"Merge Keyword","Hide_Keywords":"Hide Keywords","Hide_Recipes":"Hide Recipes","Keywords":"Keywords","Books":"Books","Proteins":"Proteins","Fats":"Fats","Carbohydrates":"Carbohydrates","Calories":"Calories","Nutrition":"Nutrition","Date":"Date","Share":"Share","Export":"Export","Rating":"Rating","Close":"Close","Cancel":"Cancel","Add":"Add","New":"New","Success":"Success","Ingredients":"Ingredients","Supermarket":"Supermarket","Categories":"Categories","Category":"Category","Selected":"Selected","min":"min","Servings":"Servings","Waiting":"Waiting","Preparation":"Preparation","External":"External","Size":"Size","Files":"Files","File":"File","Edit":"Edit","Delete":"Delete","Open":"Open","Ok":"Open","Save":"Save","Step":"Step","Search":"Search","Import":"Import","Print":"Print","Settings":"Settings","or":"or","and":"and","Information":"Information","View":"View","Recipes":"Recipes","Move":"Move","Merge":"Merge","Parent":"Parent","delete_confimation":"Are you sure that you want to delete {kw} and all of it\'s children?","move_confirmation":"Move {child} to parent {parent}","merge_confirmation":"Replace {source} with {target}","move_selection":"Select a parent to move {child} to.","merge_selection":"Replace all occurences of {source} with the selected {type}.","Advanced Search Settings":"Advanced Search Settings","Download":"Download","Root":"Root"}')},fa7d:function(e,t,n){"use strict";n.d(t,"c",(function(){return i})),n.d(t,"f",(function(){return s})),n.d(t,"a",(function(){return c})),n.d(t,"e",(function(){return d})),n.d(t,"b",(function(){return l})),n.d(t,"g",(function(){return u})),n.d(t,"d",(function(){return p}));var r=n("53ca"),o=(n("99af"),n("59e4"));function a(e,t,n){var r=Math.floor(e),o=1,a=r+1,i=1;if(e!==r)while(o<=t&&i<=t){var s=(r+a)/(o+i);if(e===s){o+i<=t?(o+=i,r+=a,i=t+1):o>i?i=t+1:o=t+1;break}e<s?(a=r+a,i=o+i):(r+=a,o+=i)}if(o>t&&(o=i,r=a),!n)return[0,r,o];var c=Math.floor(r/o);return[c,r-c*o,o]}var i={methods:{makeToast:function(e,t){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null;return s(e,t,n)}}};function s(e,t){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null,r=new o["a"];r.$bvToast.toast(t,{title:e,variant:n,toaster:"b-toaster-top-center",solid:!0})}var c={methods:{_:function(e){return d(e)}}};function d(e){return window.gettext(e)}var l={methods:{resolveDjangoUrl:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;return u(e,t)}}};function u(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;if(null==t)return window.Urls[e]();if("object"!=Object(r["a"])(t))return window.Urls[e](t);if("object"==Object(r["a"])(t)){if(1===t.length)return window.Urls[e](t);if(2===t.length)return window.Urls[e](t[0],t[1]);if(3===t.length)return window.Urls[e](t[0],t[1],t[2])}}function f(e){return window.USER_PREF[e]}function p(e,t){if(f("use_fractions")){var n="",r=a(e*t,9,!0);return r[0]>0&&(n+=r[0]),r[1]>0&&(n+=" <sup>".concat(r[1],"</sup>&frasl;<sub>").concat(r[2],"</sub>")),n}return g(e*t)}function g(e){var t=f("user_fractions")?f("user_fractions"):2;return+(Math.round(e+"e+".concat(t))+"e-".concat(t))}}});