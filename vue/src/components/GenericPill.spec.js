import GenericPill from './GenericPill.vue'
import { mount } from '@vue/test-utils'

describe  ("GenericPill", ()=>{
         
    it("test  Generic Pill blue", ()=> {       
        const pills = [1,2,3];
       const wrapper =  mount(GenericPill, {        
            propsData: {
                item_list: pills,
                label: 'Amox',
                color: 'blue'
            }
       });            
        expect (wrapper.html()).toContain('Amox');
    })
     
      
    it("test  Generic Pill green", ()=> {       
        const pills = [1,2,3,4];
       const wrapper =  mount(GenericPill, {        
            propsData: {
                item_list: pills,
                label: 'Zerta',
                color: 'green'
            }
       });            
        expect (wrapper.html()).toContain('green');
    })
     

})