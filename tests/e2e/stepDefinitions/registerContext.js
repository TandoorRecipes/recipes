const { Given, When, Then } = require("@cucumber/cucumber");
const { RegisterPage } = require("../pageObjects/RegisterPage.js");
const { LoginPage } = require("../pageObjects/LoginPage.js");

const assert = require("assert");
const registerPage = new RegisterPage();
const loginPage = new LoginPage();


Given("the user has navigated to the setup page", async function () {
  await registerPage.goToRegisterPage();
  assert.equal(
    page.url(),
    await registerPage.setupURL,
    `Expected user to redirect to homepage but redirected to page with url ${page.url()}`
  );
});

When(
  "the user signs up with the following details",
  async function (userTable) {
    await registerPage.submitRegisterData(userTable);
  }
);

Then("the user should see message {string}", async function (message) {
  const actualErrorMessage = await registerPage.getErrorMessage(message);
  const expectedErrorMessage = await message.split(",");
  assert.deepEqual(
    actualErrorMessage,
    expectedErrorMessage,
    `Expected to get ${expectedErrorMessage} but got diffrent errors: ${actualErrorMessage}`
  );
});

Then("the user should redirect to sign in page", async function () {
  assert.equal(
    page.url(),
    await loginPage.loginPageUrl,
    `Expected user to redirect to login page but redirected to page with url ${page.url()}`
  );
});

Then("the user should get success message {string}", async function (succesMsg) {
  const actualMessage = await registerPage.getSuccessMsg();
  assert.equal(
    actualMessage[0],
    succesMsg,
    `Expected to get message "${succesMsg}" but got "${actualMessage}"`
  );
});
