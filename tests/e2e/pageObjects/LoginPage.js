const { tandoorURL } = require("../../cucumber.conf.js");

class LoginPage {
  constructor() {
    this.loginPageUrl = tandoorURL + "accounts/login/";
    this.usernameInputSelector = "//input[@id='id_login']";
    this.passwordInputSelector = "//input[@id='id_password']";
    this.signinButtonSelector = "//div[@id='div_id_password']/following-sibling::button[contains(@class,'btn-success')]";
    this.loginFailMessageSelector = "//div[contains(@class,'alert-danger')]//li";
  }

  async login(username, password) {
    await page.locator(this.usernameInputSelector).fill(username);
    await page.locator(this.passwordInputSelector).fill(password);
    await page.locator(this.signinButtonSelector).click();
  }

  getMessage() {
    return page.locator(this.loginFailMessageSelector).innerText();
  }

  async goToLoginPage() {
    await page.goto(this.loginPageUrl);
  }
}

module.exports = { LoginPage }
