require("dotenv").config();
const { format } = require("util");
const config = require("../../cucumber.conf.js");
class CreateSpacePage {
  constructor() {
    this.baseUrl = config.tandoorURL;
    this.searchURL = this.baseUrl + `search/`;
    this.spaceOverviewURL = this.baseUrl + `space-overview`;
    this.createSpaceBtn = `//input[@value="Create Space"]`;
    this.spaceNameInput = `#id_create-name`;
    this.succesMsg = `//div[@class="alert alert-success alert-dismissible fade show"]`;
    this.errorMsg = `//p[@id="error_1_id_create-name"]/strong`;
    this.optionMenu = `#navbarDropdownMenuLink`;
    this.spaceName = `//a[text()="%s"]`;
  }

  async createSpace(spaceName) {
    await page.fill(this.spaceNameInput, spaceName);
    await page.click(this.createSpaceBtn);
  }

  async goToOverviewPage() {
    await page.goto(this.spaceOverviewURL);
  }

  async submitRegisterData(username, password) {
    await page.fill(this.username, username);
    await page.fill(this.password, password);
    await page.fill(this.cPassword, password);
    await page.click(this.registerBtn);
  }

  async getErrorMessage() {
    return await page.innerText(this.errorMsg);
  }

  async getSuccessMsg() {
    return (await page.innerText(this.succesMsg))
      .trim()
      .split("\n")
      .filter((n) => n);
  }
  
  async getSpace(spaceName) {
    return await page.isVisible(format(this.spaceName, spaceName));
  }
}

module.exports = { CreateSpacePage };
