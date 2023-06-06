require("dotenv").config();
class RegisterPage {
  constructor() {
    this.baseUrl = process.env.URL;
    this.setupURL = this.baseUrl + "setup/";
    this.loginURL = this.baseUrl + "accounts/login/";
    this.username = `//input[@name="name"]`;
    this.password = `#id_password`;
    this.cPassword = `//input[@name="password_confirm"]`;
    this.registerBtn = `//button[@class="btn btn-success"]`;
    this.errorMsg = `//div[@id="div_id_password"]/div`;
    this.succesMsg = `//div[@class="alert alert-success alert-dismissible fade show"]`;
  }

  async goToRegisterPage() {
    await page.goto(this.setupURL);
  }

  async goToLoginPage() {
    await page.goto(this.loginURL);
  }

  async submitRegisterData(username, password, cPassword) {
    await page.fill(this.username, username);
    await page.fill(this.password, password);
    await page.fill(this.cPassword, cPassword);
    await page.click(this.registerBtn);
  }

  async getErrorMessage(errorMsg) {
    let error = (await page.innerText(this.errorMsg))
      .split("\n")
      .filter((n) => n);
    let featureError = await errorMsg.split(",");
    return [error, featureError];
  }

  async getSuccessMsg() {
    return (await page.innerText(this.succesMsg)).split("\n").filter((n) => n);
  }
}

module.exports = { RegisterPage };
