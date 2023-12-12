import LastCooked from './LastCooked.vue'
import { mount } from '@vue/test-utils'

describe  ("LastCooked", ()=>{
         
    it("test Last Cooked", ()=> {       
        const obj = {
            last_cooked: new Date(),       
          };
       const wrapper =  mount(LastCooked, {        
            propsData: {
              recipe:obj
            }
       });      
      
        expect (wrapper.html()).toContain(new Date().getDate());
    })
     

})