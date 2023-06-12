const config=require("../../cucumber.conf.js")

class LoginPage{

    constructor(){
        this.loginPageUrl=config.tandoorURL+"accounts/login/";
        this.usernameInput="//input[@id='id_login']"
        this.passwordInput="//input[@id='id_password']"
        this.signinButton="//div[@id='div_id_password']/following-sibling::button[@class='btn btn-success']"
        this.loginFailMessage="//div[@class='alert alert-block alert-danger']//li"

    }

    async login(username, password) {
        await page.fill(this.usernameInput, username)
        await page.fill(this.passwordInput, password)
        await page.click(this.signinButton)
    }

    async getMessage() {
        return await page.innerText(this.loginFailMessage)
    }

    async goToLoginPage() {
        await page.goto(this.loginURL);
      }

}

module.exports = { LoginPage }