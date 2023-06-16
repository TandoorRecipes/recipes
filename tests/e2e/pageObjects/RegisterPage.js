const { tandoorURL } = require("../../cucumber.conf.js");

class RegisterPage {
  constructor() {
    this.baseUrl = tandoorURL;
    this.setupURL = this.baseUrl + "setup/";
    this.usernameSelector = '//input[@name="name"]';
    this.passwordSelector = '//input[@name="password"]';
    this.cPasswordSelector = '//input[@name="password_confirm"]';
    this.registerBtnSelector = '//button[contains(@class,"btn-success")]';
    this.errorMsgSelector = '//div[@id="div_id_password"]/div';
    this.succesMsgSelector = '//div[contains(@class,"alert-success")]';
  }

  async goToRegisterPage() {
    await page.goto(this.setupURL);
  }

  async submitRegisterData(userTable) {
    await page.locator(this.usernameSelector).fill(userTable.raw()[0][1]);
    await page.locator(this.passwordSelector).fill(userTable.raw()[1][1]);
    await page
      .locator(this.cPasswordSelector)
      .fill(
        userTable.raw()[2] ? userTable.raw()[2][1] : userTable.raw()[1][1]
      );
    await page.locator(this.registerBtnSelector).click();
  }

  async getErrorMessage() {
    return (await page.locator(this.errorMsgSelector).innerText())
      .split("\n")
      .filter((n) => n);
  }

  async getSuccessMsg() {
    return (await page.locator(this.succesMsgSelector).innerText())
      .split("\n")
      .filter((n) => n);
  }
}

module.exports = { RegisterPage }
