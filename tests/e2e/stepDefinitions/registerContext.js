const { Given, When, Then } = require("@cucumber/cucumber");
const { RegisterPage } = require("../pageObjects/RegisterPage.js");
const assert = require("assert");
const registerPage = new RegisterPage();

Given("user has navigated to the Setup page", async function () {
  await registerPage.goToRegisterPage();
  assert.equal(
    page.url(),
    await registerPage.setupURL,
    `Expected user to redirect to homepage but redirected to page with url ${page.url()}`
  );
});

When(
  "user logs in with username {string} ,password {string} and confirm password {string}",
  async function (username, password, cPassword) {
    await registerPage.submitRegisterData(username, password, cPassword);
  }
);

Then("user should see message {string}", async function (message) {
  let a = await registerPage.getErrorMessage(message);
  assert.deepEqual(
    a[0],
    a[1],
    `Expected to get error but got diffrent errors: ${a[0]}`
  );
});

Then("user should redirect to login page", async function () {
  assert.equal(
    page.url(),
    await registerPage.loginURL,
    `Expected user to redirect to login page but redirected to page with url ${page.url()}`
  );
});

Then("user should get sucess message {string}", async function (succesMsg) {
  let errors = await registerPage.getSuccessMsg();
  assert.equal(
    errors[0],
    succesMsg,
    `Expected to get suscess message but got : ${errors}`
  );
});
