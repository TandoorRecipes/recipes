import RecipeRating from  "./RecipeRating.vue"
import { mount, shallowMount } from "@vue/test-utils"
import Vue from 'vue';

describe  ("RecipeRating", ()=>{
         
    it("Rating greater 1", ()=> {       
        const obj = {
            rating: 1,       
          };
       const wrapper =  mount(RecipeRating, {        
            propsData: {
              recipe:obj
            }
       });      
        console.log(wrapper.html())
        expect (wrapper.html()).toContain("<i class=\"fas fa-star fa-xs text-primary\">");
    })

    it("Rating is  0", ()=> {       
        const obj = {
            rating: 0,       
          };
       const wrapper =  mount(RecipeRating, {        
            propsData: {
              recipe:obj
            }
       });            
        expect (wrapper.html().indexOf("<i class=\"fas fa-star fa-xs text-primary\">") > -1).toBe(false);
    })

    
    it("Rating is  negative", ()=> {       
        const obj = {
            rating: -1,       
          };
       const wrapper =  mount(RecipeRating, {        
            propsData: {
              recipe:obj
            }
       });              
        expect (wrapper.html().indexOf("<i class=\"fas fa-star fa-xs text-primary\">") > -1).toBe(false);
    })

})