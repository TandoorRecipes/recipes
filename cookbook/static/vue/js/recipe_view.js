(function(t){function e(e){for(var s,n,l=e[0],c=e[1],o=e[2],p=0,u=[];p<l.length;p++)n=l[p],Object.prototype.hasOwnProperty.call(a,n)&&a[n]&&u.push(a[n][0]),a[n]=0;for(s in c)Object.prototype.hasOwnProperty.call(c,s)&&(t[s]=c[s]);d&&d(e);while(u.length)u.shift()();return r.push.apply(r,o||[]),i()}function i(){for(var t,e=0;e<r.length;e++){for(var i=r[e],s=!0,l=1;l<i.length;l++){var c=i[l];0!==a[c]&&(s=!1)}s&&(r.splice(e--,1),t=n(n.s=i[0]))}return t}var s={},a={recipe_view:0},r=[];function n(e){if(s[e])return s[e].exports;var i=s[e]={i:e,l:!1,exports:{}};return t[e].call(i.exports,i,i.exports,n),i.l=!0,i.exports}n.m=t,n.c=s,n.d=function(t,e,i){n.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:i})},n.r=function(t){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"===typeof t&&t&&t.__esModule)return t;var i=Object.create(null);if(n.r(i),Object.defineProperty(i,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var s in t)n.d(i,s,function(e){return t[e]}.bind(null,s));return i},n.n=function(t){var e=t&&t.__esModule?function(){return t["default"]}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="";var l=window["webpackJsonp"]=window["webpackJsonp"]||[],c=l.push.bind(l);l.push=e,l=l.slice();for(var o=0;o<l.length;o++)e(l[o]);var d=c;r.push([0,"chunk-vendors"]),i()})({0:function(t,e,i){t.exports=i("0671")},"0671":function(t,e,i){"use strict";i.r(e);i("e260"),i("e6cf"),i("cca6"),i("a79d");var s=i("a026"),a=function(){var t=this,e=t.$createElement,i=t._self._c||e;return t.loading?t._e():i("div",{attrs:{id:"app"}},[i("div",{staticClass:"row"},[i("div",{staticClass:"col-12",staticStyle:{"text-align":"center"}},[i("h3",[t._v(t._s(t.recipe.name))])])]),i("div",{staticClass:"row"},[i("div",{staticClass:"col-12",staticStyle:{"text-align":"center"}},[i("i",[t._v(t._s(t.recipe.description))])])]),i("hr"),i("div",{staticClass:"row"},[i("div",{staticClass:"col col-md-3"},[i("table",[i("tr",[t._m(0),i("td",[i("span",{staticClass:"text-primary"},[i("b",[t._v(t._s(t._("Preparation")))])])])]),i("tr",[i("td",[t._v(" "+t._s(t.recipe.working_time)+" "+t._s(t._("min")))])])])]),i("div",{staticClass:"col  col-md-3"},[i("table",[i("tr",[t._m(1),i("td",[i("span",{staticClass:"text-primary"},[i("b",[t._v(t._s(t._("Waiting")))])])])]),i("tr",[i("td",[t._v(t._s(t.recipe.waiting_time)+" "+t._s(t._("min")))])])])]),i("div",{staticClass:"col col-md-4 col-10"},[i("table",[i("tr",[t._m(2),i("td",[i("input",{directives:[{name:"model",rawName:"v-model.number",value:t.servings,expression:"servings",modifiers:{number:!0}}],staticClass:"form-control form-control-lg",staticStyle:{"border-width":"0px",border:"none",padding:"0px","padding-left":"0.5vw","padding-right":"8px","max-width":"80px"},attrs:{dir:"rtl",value:"1",maxlength:"3",type:"number"},domProps:{value:t.servings},on:{input:function(e){e.target.composing||(t.servings=t._n(e.target.value))},blur:function(e){return t.$forceUpdate()}}})]),i("td",{staticStyle:{"padding-left":"0.5vw"}},[i("b",[t._v(t._s(t._("Servings")))])])])])]),i("div",{staticClass:"col col-md-2 col-2",staticStyle:{"text-align":"right","padding-right":"1vw"}},[i("recipe-context-menu",{attrs:{recipe:t.recipe}})],1)]),i("hr"),i("div",{staticClass:"row",staticStyle:{"margin-top":"2vh"}},[t.recipe&&t.ingredient_count>0?i("div",{staticClass:"col-md-6 order-md-1 col-sm-12 order-sm-2 col-12 order-2"},[i("div",{staticClass:"card border-primary"},[i("div",{staticClass:"card-body"},[i("div",{staticClass:"row"},[i("div",{staticClass:"col col-md-8"},[i("h4",{staticClass:"card-title"},[i("i",{staticClass:"fas fa-pepper-hot"}),t._v(" "+t._s(t._("Ingredients")))])])]),i("br"),i("div",{staticClass:"row"},[i("div",{staticClass:"col-md-12"},[i("table",{staticClass:"table table-sm"},[t._l(t.recipe.steps,(function(e){return[t._l(e.ingredients,(function(e){return[i("Ingredient",{key:e.id,attrs:{ingredient:e,servings:t.servings}})]}))]}))],2)])])])])]):t._e(),i("div",{staticClass:"col-12 order-1 col-sm-12 order-sm-1 col-md-6 order-md-2"},[i("div",{staticClass:"row"},[i("div",{staticClass:"col-12"},[null!==t.recipe.image?i("img",{staticClass:"img img-fluid rounded",staticStyle:{"max-height":"30vh"},attrs:{src:t.recipe.image,alt:t._("Recipe Image")}}):t._e()])]),i("div",{staticClass:"row",staticStyle:{"margin-top":"2vh"}},[i("div",{staticClass:"col-12"},[i("Nutrition",{attrs:{recipe:t.recipe,servings:t.servings}})],1)])])]),t.recipe.file_path.includes(".pdf")?i("div",[i("PdfViewer",{attrs:{recipe:t.recipe}})],1):t._e(),t.recipe.file_path.includes(".png")||t.recipe.file_path.includes(".jpg")||t.recipe.file_path.includes(".jpeg")?i("div",[i("ImageViewer",{attrs:{recipe:t.recipe}})],1):t._e(),t._l(t.recipe.steps,(function(e,s){return i("div",{key:e.id,staticStyle:{"margin-top":"1vh"}},[i("Step",{attrs:{recipe:t.recipe,step:e,servings:t.servings,index:s}})],1)}))],2)},r=[function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("td",{attrs:{rowspan:"2"}},[i("i",{staticClass:"fas fa-user-clock fa-2x text-primary"})])},function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("td",{attrs:{rowspan:"2"}},[i("i",{staticClass:"far fa-clock fa-2x text-primary"})])},function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("td",[i("i",{staticClass:"fas fa-pizza-slice fa-2x text-primary"})])}],n=i("b85c"),l=i("5f5b"),c=(i("2dd8"),i("bc3a")),o=i.n(c),d=(i("99af"),i("59e4"));function p(t,e,i){var s=Math.floor(t),a=1,r=s+1,n=1;if(t!==s)while(a<=e&&n<=e){var l=(s+r)/(a+n);if(t===l){a+n<=e?(a+=n,s+=r,n=e+1):a>n?n=e+1:a=e+1;break}t<l?(r=s+r,n=a+n):(s+=r,a+=n)}if(a>e&&(a=n,s=r),!i)return[0,s,a];var c=Math.floor(s/a);return[c,s-c*a,a]}var u={methods:{makeToast:function(t,e){var i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null;return f(t,e,i)}}};function f(t,e){var i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null,s=new d["a"];s.$bvToast.toast(e,{title:t,variant:i,toaster:"b-toaster-top-center",solid:!0})}var v={methods:{_:function(t){return _(t)}}};function _(t){return window.gettext(t)}var m={methods:{resolveDjangoUrl:function(t,e){return g(t,e)}}};function g(t,e){return window.Urls[t](e)}function h(t){return window.USER_PREF[t]}function b(t,e){if(h("user_fractions")){var i="",s=p.cont(t*e,9,!0);return s[0]>0&&(i+=s[0]),s[1]>0&&(i+=" <sup>".concat(s[1],"</sup>&frasl;<sub>").concat(s[2],"</sub>")),i}return C(t*e)}function C(t){var e=h("user_fractions")?h("user_fractions"):2;return+(Math.round(t+"e+".concat(e))+"e-".concat(e))}function w(t){return o.a.get(g("api:recipe-detail",t)).then((function(t){return t.data})).catch((function(t){console.log(t),f("Error","There was an error loading a resource!","danger")}))}var x=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",[i("hr"),"TEXT"===t.step.type?[t.recipe.steps.length>1?i("div",{staticClass:"row"},[i("div",{staticClass:"col col-md4"},[i("h5",{staticClass:"text-primary"},[t.step.name?[t._v(t._s(t.step.name))]:[t._v(t._s(t._("Step"))+" "+t._s(t.index+1))],0!==t.step.time?i("small",{staticClass:"text-muted",staticStyle:{"margin-left":"4px"}},[i("i",{staticClass:"fas fa-user-clock"}),t._v(" "+t._s(t.step.time)+" "+t._s(t._("min")))]):t._e()],2)]),i("div",{staticClass:"col col-md-8",staticStyle:{"text-align":"right"}},[i("b-button",{staticClass:"shadow-none",class:{"text-primary":t.details_visible,"text-success":!t.details_visible},staticStyle:{border:"none",background:"none"},on:{click:function(e){t.details_visible=!t.details_visible}}},[i("i",{staticClass:"far fa-check-circle"})])],1)]):t._e(),i("b-collapse",{attrs:{id:"collapse-1"},model:{value:t.details_visible,callback:function(e){t.details_visible=e},expression:"details_visible"}},[i("div",{staticClass:"row"},[t.step.ingredients.length>0&&t.recipe.steps.length>1?i("div",{staticClass:"col col-md-4"},[i("table",{staticClass:"table table-sm"},[t._l(t.step.ingredients,(function(e){return[i("Ingredient",{key:e.id,attrs:{ingredient:e,servings:t.servings}})]}))],2)]):t._e(),i("div",{staticClass:"col",class:{"col-md-8":t.recipe.steps.length>1,"col-md-12":t.recipe.steps.length<=1}},[i("compile-component",{attrs:{code:t.step.ingredients_markdown,servings:t.servings}})],1)])])]:t._e(),"TIME"===t.step.type?[i("div",{staticClass:"row"},[i("div",{staticClass:"col-10 offset-1",staticStyle:{"text-align":"center"}},[i("h4",{staticClass:"text-primary"},[t.step.name?[t._v(t._s(t.step.name))]:[t._v(t._s(t._("Step"))+" "+t._s(t.index+1))]],2),0!==t.step.time?i("span",{staticClass:"text-muted",staticStyle:{"margin-left":"4px"}},[i("i",{staticClass:"fa fa-stopwatch"}),t._v(" "+t._s(t.step.time)+" "+t._s(t._("min")))]):t._e()]),i("div",{staticClass:"col-1",staticStyle:{"text-align":"right"}},[i("b-button",{staticClass:"shadow-none",class:{"text-primary":t.details_visible,"text-success":!t.details_visible},staticStyle:{border:"none",background:"none"},on:{click:function(e){t.details_visible=!t.details_visible}}},[i("i",{staticClass:"far fa-check-circle"})])],1)]),i("b-collapse",{attrs:{id:"collapse-1"},model:{value:t.details_visible,callback:function(e){t.details_visible=e},expression:"details_visible"}},[""!==t.step.instruction?i("div",{staticClass:"row"},[i("div",{staticClass:"col col-md-12",staticStyle:{"text-align":"center"}},[i("compile-component",{attrs:{code:t.step.ingredients_markdown,servings:t.servings}})],1)]):t._e()])]:t._e()],2)},y=[],k=(i("a9e3"),function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("tr",[t._m(0),i("td",[0!==t.ingredient.amount?i("span",[t._v(t._s(t.calculateAmount(t.ingredient.amount)))]):t._e()]),i("td",[null!==t.ingredient.unit?i("span",[t._v(t._s(t.ingredient.unit.name))]):t._e()]),i("td",[null!==t.ingredient.food?i("span",[t._v(t._s(t.ingredient.food.name))]):t._e()]),i("td",[t.ingredient.note?i("div",[i("span",{directives:[{name:"b-popover",rawName:"v-b-popover.hover",value:t.ingredient.note,expression:"ingredient.note",modifiers:{hover:!0}}],staticClass:"d-print-none"},[i("i",{staticClass:"far fa-comment"})]),i("div",{staticClass:"d-none d-print-block"},[i("i",{staticClass:"far fa-comment-alt"}),t._v(" "+t._s(t.ingredient.note)+" ")])]):t._e()])])}),j=[function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("td",[i("input",{attrs:{type:"checkbox"}})])}],S={name:"Ingredient",props:{ingredient:Object,servings:{type:Number,default:1}},methods:{calculateAmount:function(t){return b(t,this.servings)}}},O=S,E=i("2877"),$=Object(E["a"])(O,k,j,!1,null,null,null),P=$.exports,I=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",[i(t.compiled,{tag:"component",attrs:{servings:t.servings,code:t.code}})],1)},N=[],A=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("span",[t._v(t._s(t.calculateAmount(t.number)))])},M=[],U={name:"ScalableNumber",props:{number:Number,factor:{type:Number,default:4}},methods:{calculateAmount:function(t){return b(t,this.factor)}}},R=U,T=Object(E["a"])(R,A,M,!1,null,null,null),V=T.exports,D={name:"CompileComponent",props:["code","servings"],data:function(){return{compiled:null}},mounted:function(){this.compiled=s["default"].component("compiled-component",{props:["servings","code"],components:{ScalableNumber:V},template:"<div>".concat(this.code,"</div>")})}},z=D,F=Object(E["a"])(z,I,N,!1,null,null,null),J=F.exports,L={name:"Step",mixins:[v],components:{Ingredient:P,CompileComponent:J},props:{step:Object,servings:Number,index:Number,recipe:Object},data:function(){return{details_visible:!0}},mounted:function(){},methods:{calculateAmount:function(t){return b(t,this.servings)}}},B=L,W=Object(E["a"])(B,x,y,!1,null,null,null),X=W.exports,q=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",[i("div",{staticClass:"dropdown"},[t._m(0),i("div",{staticClass:"dropdown-menu dropdown-menu-right",attrs:{"aria-labelledby":"dropdownMenuLink"}},[i("a",{staticClass:"dropdown-item",attrs:{href:t.resolveDjangoUrl("edit_recipe",t.recipe.id)}},[i("i",{staticClass:"fas fa-pencil-alt fa-fw"}),t._v(" "+t._s(t._("Edit")))]),i("button",{staticClass:"dropdown-item",attrs:{onclick:"$('#bookmarkModal').modal({'show':true})"}},[i("i",{staticClass:"fas fa-bookmark fa-fw"}),t._v(" "+t._s(t._("Add to Book"))+" ")]),i("a",{staticClass:"dropdown-item",attrs:{href:t.recipe.name}},[i("i",{staticClass:"fas fa-shopping-cart fa-fw"}),t._v(" "+t._s(t._("Add to Shopping"))+" ")]),i("a",{staticClass:"dropdown-item",attrs:{href:t.resolveDjangoUrl("new_meal_plan",t.recipe.id)}},[i("i",{staticClass:"fas fa-calendar fa-fw"}),t._v(" "+t._s(t._("Add to Plan")))]),i("button",{staticClass:"dropdown-item",attrs:{onclick:"window.print()"}},[i("i",{staticClass:"fas fa-print fa-fw"}),t._v(" "+t._s(t._("Print"))+" ")]),i("a",{staticClass:"dropdown-item",attrs:{href:t.resolveDjangoUrl("view_export",t.recipe.id),target:"_blank",rel:"noopener noreferrer"}},[i("i",{staticClass:"fas fa-file-export fa-fw"}),t._v(" "+t._s(t._("Export")))]),t.recipe.internal?i("a",{staticClass:"dropdown-item",attrs:{href:t.resolveDjangoUrl("new_share_link",t.recipe.id),target:"_blank",rel:"noopener noreferrer"}},[i("i",{staticClass:"fas fa-share-alt fa-fw"}),t._v(" "+t._s(t._("Share")))]):t._e()])])])},G=[function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("a",{staticClass:"btn shadow-none",attrs:{href:"#",role:"button",id:"dropdownMenuLink","data-toggle":"dropdown","aria-haspopup":"true","aria-expanded":"false"}},[i("i",{staticClass:"fas fa-ellipsis-v"})])}],H={name:"RecipeContextMenu",mixins:[m,v],props:{recipe:Object}},K=H,Q=Object(E["a"])(K,q,G,!1,null,null,null),Y=Q.exports,Z=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",[i("iframe",{staticStyle:{border:"none"},attrs:{src:t.pdfUrl,width:"100%",height:"700px"}})])},tt=[],et={name:"PdfViewer",mixins:[m],props:{recipe:Object},computed:{pdfUrl:function(){return"/static/pdfjs/viewer.html?file="+g("api_get_recipe_file",this.recipe.id)}}},it=et,st=Object(E["a"])(it,Z,tt,!1,null,null,null),at=st.exports,rt=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",[i("img",{attrs:{src:t.pdfUrl,width:"100%",height:"700px",alt:t._("External Recipe Image")}})])},nt=[],lt={name:"ImageViewer",mixins:[v],props:{recipe:Object},computed:{pdfUrl:function(){return g("api_get_recipe_file",this.recipe.id)}}},ct=lt,ot=Object(E["a"])(ct,rt,nt,!1,null,null,null),dt=ot.exports,pt=function(){var t=this,e=t.$createElement,i=t._self._c||e;return null!==t.recipe.nutrition?i("div",[i("div",{staticClass:"card border-success"},[i("div",{staticClass:"card-body"},[i("div",{staticClass:"row"},[i("div",{staticClass:"col-12"},[i("h4",{staticClass:"card-title"},[i("i",{staticClass:"fas fa-carrot"}),t._v(" "+t._s(t._("Nutrition")))])])]),i("div",{staticClass:"row"},[i("div",{staticClass:"col-6"},[i("i",{staticClass:"fas fa-fire fa-fw"}),t._v(" "+t._s(t._("Calories"))+" ")]),i("div",{staticClass:"col-6"},[t._v(" "+t._s(t.calculateAmount(t.recipe.nutrition.calories))+" kcal ")])]),i("div",{staticClass:"row"},[i("div",{staticClass:"col-6"},[i("i",{staticClass:"fas fa-bread-slice fa-fw"}),t._v(" "+t._s(t._("Carbohydrates"))+" ")]),i("div",{staticClass:"col-6"},[t._v(" "+t._s(t.calculateAmount(t.recipe.nutrition.carbohydrates))+" g ")])]),i("div",{staticClass:"row"},[i("div",{staticClass:"col-6"},[i("i",{staticClass:"fas fa-cheese fa-fw"}),t._v(" "+t._s(t._("Fats"))+" ")]),i("div",{staticClass:"col-6"},[t._v(" "+t._s(t.calculateAmount(t.recipe.nutrition.fats))+" g ")])]),i("div",{staticClass:"row"},[i("div",{staticClass:"col-6"},[i("i",{staticClass:"fas fa-drumstick-bite fa-fw"}),t._v(" "+t._s(t._("Proteins"))+" ")]),i("div",{staticClass:"col-6"},[t._v(" "+t._s(t.calculateAmount(t.recipe.nutrition.proteins))+" g ")])])])])]):t._e()},ut=[],ft={name:"Nutrition",mixins:[v],props:{recipe:Object,servings:Number},methods:{calculateAmount:function(t){return b(t,this.servings)}}},vt=ft,_t=Object(E["a"])(vt,pt,ut,!1,null,null,null),mt=_t.exports;s["default"].use(l["a"]);var gt={name:"RecipeView",mixins:[v,u],components:{PdfViewer:at,ImageViewer:dt,Ingredient:P,Step:X,RecipeContextMenu:Y,Nutrition:mt},data:function(){return{loading:!0,recipe_id:window.RECIPE_ID,recipe:void 0,ingredient_count:0,servings:1}},mounted:function(){this.loadRecipe(this.recipe_id)},methods:{loadRecipe:function(t){var e=this;w(t).then((function(t){e.recipe=t,e.loading=!1;var i,s=Object(n["a"])(e.recipe.steps);try{for(s.s();!(i=s.n()).done;){var a=i.value;e.ingredient_count+=a.ingredients.length,0!==a.time&&(e.has_times=!0)}}catch(r){s.e(r)}finally{s.f()}}))}}},ht=gt,bt=Object(E["a"])(ht,a,r,!1,null,null,null),Ct=bt.exports;s["default"].config.productionTip=!1,new s["default"]({render:function(t){return t(Ct)}}).$mount("#app")}});