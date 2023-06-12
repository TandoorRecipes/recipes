const { Given, When, Then } = require("@cucumber/cucumber");
const { CreateSpacePage } = require("../pageObjects/CreateSpacePage.js");

const assert = require("assert");
const createSpacePage = new CreateSpacePage();

Then("user should see options to create space", async function () {
  assert.ok(
    await createSpacePage.createSpaceExixt(),
    `Expected to see create space button but could not find it`
  );
});

When("the user creates a space {string}", async function (spaceName) {
  await createSpacePage.createSpace(spaceName);
});

Then("the user redirects to search page", async function () {
  assert.equal(
    page.url(),
    createSpacePage.searchURL,
    `Expected to get redirected to "${
      createSpacePage.searchURL
    }" but got redirected to: "${page.url()}"`
  );
});

Then(
  "userspace {string} should be visible on option menu",
  async function (spaceName) {
    await createSpacePage.goToOverviewPage();
    await assert.ok(createSpacePage.getSpace(spaceName));
  }
);

Given("the user has browsed to the space overview page", async function () {
  await createSpacePage.goToOverviewPage();
  assert.equal(
    page.url(),
    createSpacePage.spaceOverviewURL,
    `Expected to get redirected to ${
      createSpacePage.spaceOverviewURL
    } but got redirected to: ${page.url()}`
  );
});

Then("the user should get error message {string}", async function (errorMessage) {
  let actualError = await createSpacePage.getErrorMessage();
  assert.deepEqual(
    actualError,
    errorMessage,
    `Expected to get "${errorMessage}" but got diffrent errors: "${actualError}"`
  );
});

Given("the user has created a space {string}", async function (spaceName) {
  await createSpacePage.createSpace(spaceName);
});
