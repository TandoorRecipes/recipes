const { Given, When, Then } = require("@cucumber/cucumber");
const { CreateSpacePage } = require("../pageObjects/CreateSpacePage.js");

const assert = require("assert");
const createSpacePage = new CreateSpacePage();

Then("superuser should see options to create space", async function () {
  assert.ok(
    await createSpacePage.createSpaceExixt(),
    `Expected to see create space button but could not find it`
  );
});

When("the superuser creates a space {string}", async function (spaceName) {
  await createSpacePage.createSpace(spaceName);
});

When(
  "the superuser tries to create a space {string}",
  async function (spaceName) {
    await createSpacePage.createSpace(spaceName);
  }
);

Then("the superuser should redirect to search page", async function () {
  assert.equal(
    page.url(),
    createSpacePage.searchURL,
    `Expected to get redirected to "${
      createSpacePage.searchURL
    }" but got redirected to: "${page.url()}"`
  );
});

Then(
  "superuser's space {string} should be visible on option menu",
  async function (spaceName) {
    await createSpacePage.goToOverviewPage();
    await assert.ok(createSpacePage.getSpace(spaceName));
  }
);

Given(
  "the superuser has browsed to the space overview page",
  async function () {
    await createSpacePage.goToOverviewPage();
    assert.equal(
      page.url(),
      createSpacePage.spaceOverviewURL,
      `Expected to get redirected to ${
        createSpacePage.spaceOverviewURL
      } but got redirected to: ${page.url()}`
    );
  }
);

Then(
  "the superuser should get an error message {string}",
  async function (errorMessage) {
    const actualError = await createSpacePage.getErrorMessage();
    assert.deepEqual(
      actualError,
      errorMessage,
      `Expected to get "${errorMessage}" but got diffrent errors: "${actualError}"`
    );
  }
);

Given("the superuser has created a space {string}", async function (spaceName) {
  await createSpacePage.createSpace(spaceName);
});
