const config=require("../../cucumber.conf.js")

class HomePage {
    constructor() {
        this.homePageUrl = config.tandoorURL
        this.signinSuccessMessage = "//div[@class='alert alert-success alert-dismissible fade show']"
    }

    async getSigninSuccessMessage() {
        return (await page.innerText(this.signinSuccessMessage))
    }
}
module.exports = { HomePage }