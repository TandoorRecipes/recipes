const { format } = require("util");

const { tandoorURL } = require("../../cucumber.conf.js");

class CreateSpacePage {

  constructor() {
    this.baseUrl = tandoorURL;
    this.searchURL = tandoorURL + 'search/';
    this.spaceOverviewURL = tandoorURL + 'space-overview';
    this.createSpaceBtnSelector = '//input[@value="Create Space"]';
    this.spaceNameInputSelector = '#id_create-name';
    this.succesMsgSelector = '//div[contains(@class,"alert-success")]';
    this.errorMsgSelector = '//p[@id="error_1_id_create-name"]/strong';
    this.optionMenuSelector = '#navbarDropdownMenuLink';
    this.spaceNameSelector = '//a[text()="%s"]';
  }

  async createSpace(spaceName) {
    await page.locator(this.spaceNameInputSelector).fill(spaceName);
    await page.locator(this.createSpaceBtnSelector).click();
  }

  async goToOverviewPage() {
    await page.goto(this.spaceOverviewURL);
  }

  async submitRegisterData(username, password) {
    await page.locator(this.usernameSelector).fill(username);
    await page.locator(this.passwordSelector).fill(password);
    await page.locator(this.cPasswordSelector).fill(password);
    await page.locator(this.registerBtnSelector).click();
  }

  getErrorMessage() {
    return page.locator(this.errorMsgSelector).innerText();
  }

  async getSuccessMsg() {
    return (await page.locator(this.succesMsgSelector).innerText())
      .trim()
      .split("\n")
      .filter((n) => n);
  }
  
  getSpace(spaceName) {
    return page.locator(format(this.spaceNameSelector, spaceName)).isVisible();
  }
}

module.exports = { CreateSpacePage }
