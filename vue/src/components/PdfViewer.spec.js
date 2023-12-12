import PdfViewer from './Pdfviewer.vue'
import { mount } from '@vue/test-utils'

describe  ("PdfViewer", ()=>{
         
    it("test Pdfviewer", ()=> {       
        const obj = {
            id: 1,       
          };
       const wrapper =  mount(PdfViewer, {        
            propsData: {
              recipe:obj
            }
       });      
      
        expect (wrapper.html()).toContain("pdfjs/viewer.html?file=1");
    })
     

})