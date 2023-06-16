const { Given, When, Then } = require("@cucumber/cucumber");
const { LoginPage } = require("../pageObjects/LoginPage");
const { HomePage } = require("../pageObjects/HomePage.js");
const { RegisterPage } = require("../pageObjects/RegisterPage.js");
const { tandoorURL } = require("../../cucumber.conf.js");

const assert = require("assert");
const loginPage = new LoginPage();
const homePage = new HomePage();
const registerPage = new RegisterPage();

Given(
  "the superuser has signed up with the following details",
  async function (userTable) {
    await registerPage.goToRegisterPage();
    await registerPage.submitRegisterData(userTable);
  }
);

Given("the superuser has browsed to login page", async function () {
  await loginPage.goToLoginPage;
});

When(
  "the superuser logs in with username {string} and password {string}",
  async function (username, password) {
    await loginPage.login(username, password);
  }
);

Given(
  "the superuser has logged in with username {string} and password {string}",
  async function (username, password) {
    await loginPage.login(username, password);
  }
);

Then("the superuser should be navigated to the homepage", async function () {
  actualUrl = await page.url();
  assert.equal(
    tandoorURL,
    actualUrl,
    `Expected user to be navigated to home page but redirected to ${actualUrl}`
  );
});

Then(
  "the superuser should see the message {string}",
  async function (expectedMessage) {
    actualMessage = (await homePage.getSigninSuccessMessage()).split("\n");
    assert.equal(
      expectedMessage,
      actualMessage[0],
      `Expected error message to be ${expectedMessage} but received ${actualMessage}`
    );
  }
);

Then(
  "the superuser should see the error message {string}",
  async function (expectedMessage) {
    actualMessage = await loginPage.getMessage();
    assert.equal(
      expectedMessage,
      actualMessage,
      `Expected error message to be ${expectedMessage} but received ${actualMessage}`
    );
  }
);
