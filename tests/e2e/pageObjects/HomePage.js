const { tandoorURL } =require("../../cucumber.conf.js")

class HomePage {

    constructor() {
        this.homePageUrl = tandoorURL
        this.signinSuccessMessageSelector = "//div[contains(@class, 'alert-success')]"
    }

    async getSigninSuccessMessage() {
        return (await page.locator(this.signinSuccessMessageSelector).innerText())
    }
}
module.exports = { HomePage }