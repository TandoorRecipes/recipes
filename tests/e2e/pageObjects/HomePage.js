const config=require("../../cucumber.conf.js")

class HomePage {

    constructor() {
        this.homePageUrl = config.tandoorURL
        this.signinSuccessMessageSelector = "//div[contains(@class, 'alert-success')]"
    }

    async getSigninSuccessMessage() {
        return (await page.locator(this.signinSuccessMessageSelector).innerText())
    }
}
module.exports = { HomePage }