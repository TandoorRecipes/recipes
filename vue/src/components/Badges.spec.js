import Badges from './Badges.vue'

import { mount, shallowMount } from "@vue/test-utils"

describe('Badges',() =>{


    it('test linkedRecipt',() =>{

        const obj = {
            type: 'linkedRecipe',       
          };
       const wrapper =  mount(RecipeRating, {        
            propsData: {
              item:obj,
              model:obj
            }
       });      
        console.log(wrapper.html())
       expect (wrapper.html()).toContain("LinkedRecipe");       
    })

    it('test Icon',() =>{

        const obj = {
            type: 'Icon',       
          };
       const wrapper =  mount(RecipeRating, {        
            propsData: {
              item:obj,
              model:obj
            }
       });      
        console.log(wrapper.html())
       expect (wrapper.html()).toContain("Icon");       
    })

    it('test OnHand',() =>{

        const obj = {
            type: 'OnHand',       
          };
       const wrapper =  mount(RecipeRating, {        
            propsData: {
              item:obj,
              model:obj
            }
       });      
        console.log(wrapper.html())
       expect (wrapper.html()).toContain("OnHand");       
    })
    it('test Shopping',() =>{

        const obj = {
            type: 'Shopping',       
          };
       const wrapper =  mount(RecipeRating, {        
            propsData: {
              item:obj,
              model:obj
            }
       });      
        console.log(wrapper.html())
       expect (wrapper.html()).toContain("Shopping");       
    })
})