import {DateTime} from "luxon";

export default {
    install: (app: any) => {
        // inject a globally available luxon DateTime
        app.config.globalProperties.$luxon = DateTime
    }
}