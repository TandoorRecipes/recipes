(function(e){function t(t){for(var s,c,f=t[0],o=t[1],i=t[2],u=0,j=[];u<f.length;u++)c=f[u],Object.prototype.hasOwnProperty.call(a,c)&&a[c]&&j.push(a[c][0]),a[c]=0;for(s in o)Object.prototype.hasOwnProperty.call(o,s)&&(e[s]=o[s]);d&&d(t);while(j.length)j.shift()();return r.push.apply(r,i||[]),n()}function n(){for(var e,t=0;t<r.length;t++){for(var n=r[t],s=!0,f=1;f<n.length;f++){var o=n[f];0!==a[o]&&(s=!1)}s&&(r.splice(t--,1),e=c(c.s=n[0]))}return e}var s={},a={offline_view:0},r=[];function c(t){if(s[t])return s[t].exports;var n=s[t]={i:t,l:!1,exports:{}};return e[t].call(n.exports,n,n.exports,c),n.l=!0,n.exports}c.m=e,c.c=s,c.d=function(e,t,n){c.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},c.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},c.t=function(e,t){if(1&t&&(e=c(e)),8&t)return e;if(4&t&&"object"===typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(c.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var s in e)c.d(n,s,function(t){return e[t]}.bind(null,s));return n},c.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return c.d(t,"a",t),t},c.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},c.p="";var f=window["webpackJsonp"]=window["webpackJsonp"]||[],o=f.push.bind(f);f.push=t,f=f.slice();for(var i=0;i<f.length;i++)t(f[i]);var d=o;r.push([1,"chunk-vendors"]),n()})({1:function(e,t,n){e.exports=n("da67")},4678:function(e,t,n){var s={"./af":"2bfb","./af.js":"2bfb","./ar":"8e73","./ar-dz":"a356","./ar-dz.js":"a356","./ar-kw":"423e","./ar-kw.js":"423e","./ar-ly":"1cfd","./ar-ly.js":"1cfd","./ar-ma":"0a84","./ar-ma.js":"0a84","./ar-sa":"8230","./ar-sa.js":"8230","./ar-tn":"6d83","./ar-tn.js":"6d83","./ar.js":"8e73","./az":"485c","./az.js":"485c","./be":"1fc1","./be.js":"1fc1","./bg":"84aa","./bg.js":"84aa","./bm":"a7fa","./bm.js":"a7fa","./bn":"9043","./bn-bd":"9686","./bn-bd.js":"9686","./bn.js":"9043","./bo":"d26a","./bo.js":"d26a","./br":"6887","./br.js":"6887","./bs":"2554","./bs.js":"2554","./ca":"d716","./ca.js":"d716","./cs":"3c0d","./cs.js":"3c0d","./cv":"03ec","./cv.js":"03ec","./cy":"9797","./cy.js":"9797","./da":"0f14","./da.js":"0f14","./de":"b469","./de-at":"b3eb","./de-at.js":"b3eb","./de-ch":"bb71","./de-ch.js":"bb71","./de.js":"b469","./dv":"598a","./dv.js":"598a","./el":"8d47","./el.js":"8d47","./en-au":"0e6b","./en-au.js":"0e6b","./en-ca":"3886","./en-ca.js":"3886","./en-gb":"39a6","./en-gb.js":"39a6","./en-ie":"e1d3","./en-ie.js":"e1d3","./en-il":"7333","./en-il.js":"7333","./en-in":"ec2e","./en-in.js":"ec2e","./en-nz":"6f50","./en-nz.js":"6f50","./en-sg":"b7e9","./en-sg.js":"b7e9","./eo":"65db","./eo.js":"65db","./es":"898b","./es-do":"0a3c","./es-do.js":"0a3c","./es-mx":"b5b7","./es-mx.js":"b5b7","./es-us":"55c9","./es-us.js":"55c9","./es.js":"898b","./et":"ec18","./et.js":"ec18","./eu":"0ff2","./eu.js":"0ff2","./fa":"8df4","./fa.js":"8df4","./fi":"81e9","./fi.js":"81e9","./fil":"d69a","./fil.js":"d69a","./fo":"0721","./fo.js":"0721","./fr":"9f26","./fr-ca":"d9f8","./fr-ca.js":"d9f8","./fr-ch":"0e49","./fr-ch.js":"0e49","./fr.js":"9f26","./fy":"7118","./fy.js":"7118","./ga":"5120","./ga.js":"5120","./gd":"f6b4","./gd.js":"f6b4","./gl":"8840","./gl.js":"8840","./gom-deva":"aaf2","./gom-deva.js":"aaf2","./gom-latn":"0caa","./gom-latn.js":"0caa","./gu":"e0c5","./gu.js":"e0c5","./he":"c7aa","./he.js":"c7aa","./hi":"dc4d","./hi.js":"dc4d","./hr":"4ba9","./hr.js":"4ba9","./hu":"5b14","./hu.js":"5b14","./hy-am":"d6b6","./hy-am.js":"d6b6","./id":"5038","./id.js":"5038","./is":"0558","./is.js":"0558","./it":"6e98","./it-ch":"6f12","./it-ch.js":"6f12","./it.js":"6e98","./ja":"079e","./ja.js":"079e","./jv":"b540","./jv.js":"b540","./ka":"201b","./ka.js":"201b","./kk":"6d79","./kk.js":"6d79","./km":"e81d","./km.js":"e81d","./kn":"3e92","./kn.js":"3e92","./ko":"22f8","./ko.js":"22f8","./ku":"2421","./ku.js":"2421","./ky":"9609","./ky.js":"9609","./lb":"440c","./lb.js":"440c","./lo":"b29d","./lo.js":"b29d","./lt":"26f9","./lt.js":"26f9","./lv":"b97c","./lv.js":"b97c","./me":"293c","./me.js":"293c","./mi":"688b","./mi.js":"688b","./mk":"6909","./mk.js":"6909","./ml":"02fb","./ml.js":"02fb","./mn":"958b","./mn.js":"958b","./mr":"39bd","./mr.js":"39bd","./ms":"ebe4","./ms-my":"6403","./ms-my.js":"6403","./ms.js":"ebe4","./mt":"1b45","./mt.js":"1b45","./my":"8689","./my.js":"8689","./nb":"6ce3","./nb.js":"6ce3","./ne":"3a39","./ne.js":"3a39","./nl":"facd","./nl-be":"db29","./nl-be.js":"db29","./nl.js":"facd","./nn":"b84c","./nn.js":"b84c","./oc-lnc":"167b","./oc-lnc.js":"167b","./pa-in":"f3ff","./pa-in.js":"f3ff","./pl":"8d57","./pl.js":"8d57","./pt":"f260","./pt-br":"d2d4","./pt-br.js":"d2d4","./pt.js":"f260","./ro":"972c","./ro.js":"972c","./ru":"957c","./ru.js":"957c","./sd":"6784","./sd.js":"6784","./se":"ffff","./se.js":"ffff","./si":"eda5","./si.js":"eda5","./sk":"7be6","./sk.js":"7be6","./sl":"8155","./sl.js":"8155","./sq":"c8f3","./sq.js":"c8f3","./sr":"cf1e","./sr-cyrl":"13e9","./sr-cyrl.js":"13e9","./sr.js":"cf1e","./ss":"52bd","./ss.js":"52bd","./sv":"5fbd","./sv.js":"5fbd","./sw":"74dc","./sw.js":"74dc","./ta":"3de5","./ta.js":"3de5","./te":"5cbb","./te.js":"5cbb","./tet":"576c","./tet.js":"576c","./tg":"3b1b","./tg.js":"3b1b","./th":"10e8","./th.js":"10e8","./tk":"5aff","./tk.js":"5aff","./tl-ph":"0f38","./tl-ph.js":"0f38","./tlh":"cf755","./tlh.js":"cf755","./tr":"0e81","./tr.js":"0e81","./tzl":"cf51","./tzl.js":"cf51","./tzm":"c109","./tzm-latn":"b53d","./tzm-latn.js":"b53d","./tzm.js":"c109","./ug-cn":"6117","./ug-cn.js":"6117","./uk":"ada2","./uk.js":"ada2","./ur":"5294","./ur.js":"5294","./uz":"2e8c","./uz-latn":"010e","./uz-latn.js":"010e","./uz.js":"2e8c","./vi":"2921","./vi.js":"2921","./x-pseudo":"fd7e","./x-pseudo.js":"fd7e","./yo":"7f33","./yo.js":"7f33","./zh-cn":"5c3a","./zh-cn.js":"5c3a","./zh-hk":"49ab","./zh-hk.js":"49ab","./zh-mo":"3a6c","./zh-mo.js":"3a6c","./zh-tw":"90ea","./zh-tw.js":"90ea"};function a(e){var t=r(e);return n(t)}function r(e){if(!n.o(s,e)){var t=new Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}return s[e]}a.keys=function(){return Object.keys(s)},a.resolve=r,e.exports=a,a.id="4678"},da67:function(e,t,n){"use strict";n.r(t);n("e260"),n("e6cf"),n("cca6"),n("a79d");var s=n("a026"),a=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{attrs:{id:"app"}},[n("label",[e._v(" "+e._s(e._("Search"))+" "),n("input",{directives:[{name:"model",rawName:"v-model",value:e.filter,expression:"filter"}],staticClass:"form-control",attrs:{type:"text"},domProps:{value:e.filter},on:{input:function(t){t.target.composing||(e.filter=t.target.value)}}})]),n("div",{staticClass:"row"},e._l(e.filtered_recipes,(function(t){return n("div",{key:t.id,staticClass:"col-md-3"},[n("b-card",{attrs:{title:t.name,tag:"article"}},[n("b-card-text",[n("span",{staticClass:"text-muted"},[e._v(e._s(e.formatDateTime(t.updated_at)))]),e._v(" "+e._s(t.description)+" ")]),n("b-button",{attrs:{href:e.resolveDjangoUrl("view_recipe",t.id),variant:"primary"}},[e._v(e._s(e._("Open")))])],1)],1)})),0)])},r=[],c=(n("159b"),n("caad"),n("2532"),n("b0c0"),n("4de4"),n("d3b7"),n("ddb0"),n("466d"),n("ac1f"),n("5f5b")),f=(n("2dd8"),n("fa7d")),o=n("c1df"),i=n.n(o);s["default"].use(c["a"]),s["default"].prototype.moment=i.a;var d={name:"OfflineView",mixins:[f["b"],f["a"]],computed:{filtered_recipes:function(){var e=this,t={};return this.recipes.forEach((function(n){n.name.toLowerCase().includes(e.filter.toLowerCase())&&(n.id in t?n.updated_at>t[n.id].updated_at&&(t[n.id]=n):t[n.id]=n)})),t}},data:function(){return{recipes:[],filter:""}},mounted:function(){this.loadRecipe()},methods:{formatDateTime:function(e){return i.a.locale(window.navigator.language),i()(e).format("LLL")},loadRecipe:function(){var e=this;caches.open("api-recipe").then((function(t){t.keys().then((function(t){t.forEach((function(t){caches.match(t).then((function(t){t.json().then((function(t){e.recipes.push(t)}))}))}))}))}))}}},u=d,j=n("2877"),l=Object(j["a"])(u,a,r,!1,null,null,null),b=l.exports;s["default"].config.productionTip=!1,new s["default"]({render:function(e){return e(b)}}).$mount("#app")},fa7d:function(e,t,n){"use strict";n.d(t,"c",(function(){return r})),n.d(t,"f",(function(){return c})),n.d(t,"a",(function(){return f})),n.d(t,"e",(function(){return o})),n.d(t,"b",(function(){return i})),n.d(t,"g",(function(){return d})),n.d(t,"d",(function(){return j}));n("99af");var s=n("59e4");function a(e,t,n){var s=Math.floor(e),a=1,r=s+1,c=1;if(e!==s)while(a<=t&&c<=t){var f=(s+r)/(a+c);if(e===f){a+c<=t?(a+=c,s+=r,c=t+1):a>c?c=t+1:a=t+1;break}e<f?(r=s+r,c=a+c):(s+=r,a+=c)}if(a>t&&(a=c,s=r),!n)return[0,s,a];var o=Math.floor(s/a);return[o,s-o*a,a]}var r={methods:{makeToast:function(e,t){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null;return c(e,t,n)}}};function c(e,t){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null,a=new s["a"];a.$bvToast.toast(t,{title:e,variant:n,toaster:"b-toaster-top-center",solid:!0})}var f={methods:{_:function(e){return o(e)}}};function o(e){return window.gettext(e)}var i={methods:{resolveDjangoUrl:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;return d(e,t)}}};function d(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;return null!==t?window.Urls[e](t):window.Urls[e]()}function u(e){return window.USER_PREF[e]}function j(e,t){if(u("use_fractions")){var n="",s=a(e*t,9,!0);return s[0]>0&&(n+=s[0]),s[1]>0&&(n+=" <sup>".concat(s[1],"</sup>&frasl;<sub>").concat(s[2],"</sub>")),n}return l(e*t)}function l(e){var t=u("user_fractions")?u("user_fractions"):2;return+(Math.round(e+"e+".concat(t))+"e-".concat(t))}}});