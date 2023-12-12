import BetaWarning from "./BetaWarning.vue"
import {mount} from "@vue/test-utils"

describe  ("BetaWarning", ()=>{

    it("test betaWarning", ()=> {       
        const wrapper = mount(BetaWarning)
       expect (wrapper.text).toContain("BETA")
    })
})