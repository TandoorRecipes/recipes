const { Given, When, Then } = require("@cucumber/cucumber");
const {
  AccountNameEditPage,
} = require("../pageObjects/AccountNameEditPage.js");
const assert = require("assert");
const { expect } = require("@playwright/test");

const accountNameEditPage = new AccountNameEditPage();

Given("the superuser has navigated to account setting page", async function () {
  await accountNameEditPage.goToSettingPage();
  expect(page).toHaveURL(accountNameEditPage.spaceOverviewURL);
});

When(
  "the superuser edits his first name to {string} and lastname to {string}",
  async function (firstName, lastname) {
    await accountNameEditPage.fillUserData(firstName, lastname);
  }
);

Then(
  "the superuser name should be updated on toolbar to {string}",
  async function (expectedUserName) {
    const actualUserName = await accountNameEditPage.getUserName();
    assert.equal(
      actualUserName.trim(),
      expectedUserName.trim(),
      `Expected to get "${expectedUserName.trim()}" but got : "${actualUserName}"`
    );
  }
);
