const config = require("../../cucumber.conf.js");

class AccountNameEditPage {
  constructor() {
    this.baseUrl = config.tandoorURL;
    this.settingURL = this.baseUrl + "search/";
    this.spaceOverviewURL = this.baseUrl + "settings/";
    this.navBarMenuSelector = '//i[contains(@class,"fa-user-alt")]//ancestor::a';
    this.settingLinkSelector = '//a[@href="/settings/"]';
    this.accountLinkSelector = '//a[text()=" Account "]';
    this.firstNameSelector = "#__BVID__37";
    this.lastNameSelector = "#__BVID__39";
    this.succesMsgSelector = '//div[@class="toast-body"]';
    this.navBarNameSelector = '//a[contains(text()," %s ")]';
  }

  async goToSettingPage() {
    await page.click(this.navBarMenuSelector);
    await page.click(this.settingLinkSelector);
    await page.click(this.accountLinkSelector);
  }

  async fillUserData(firstname, lastname) {
    await page.fill(this.firstNameSelector, firstname);
    await page.fill(this.lastNameSelector, lastname);
    await page.locator(this.firstNameSelector).focus();
  }

  async getUserName() {
    await this.goToSettingPage();
    return page.locator(this.navBarMenuSelector).innerText();
  }

  getSuccessMsg() {
    return page.locator(this.succesMsgSelector).innerText();
  }
}

module.exports = { AccountNameEditPage };
