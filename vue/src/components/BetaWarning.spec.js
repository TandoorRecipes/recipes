import BetaWarning from "./BetaWarning.vue"
import {mount} from "@vue/test-utils"

describe  ("BetaWarning", ()=>{

    it("Set up Correctly", ()=> {
        const component = {
            template:'{{$t(\'BETA\')}}'
        }
        const wrapper =  mount( component)           
        expect(wrapper.text()).toContain("BETA")
    })
})