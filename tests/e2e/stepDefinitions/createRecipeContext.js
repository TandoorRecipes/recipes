const { Given, When, Then } = require('@cucumber/cucumber');
const { RecipePage } = require('../pageObjects/RecipePage')
const { CreateSpacePage } = require("../pageObjects/CreateSpacePage.js");

const assert = require('assert')
const recipePage = new RecipePage()
const createSpacePage = new CreateSpacePage();

Given('the superuser has created a space named {string}', async function (spaceName) {
  await createSpacePage.createSpace(spaceName)
});

When('the superuser creates new recipe {string} with following details:', async function (recipeName, recipeDetails) {
  await recipePage.createRecipe(recipeName)
  await recipePage.inputRecipeDetails(recipeDetails.rowsHash())

});

When('the superuser adds following step details', async function (stepDetails) {
  await recipePage.inputRecipeStepDetails(stepDetails.rowsHash())
});

When('the superuser adds following ingredients', async function (ingredientsData) {
  await recipePage.inputIngredients(ingredientsData.hashes())
});

When('the superuser {string} the recipe', async function (option) {
  await recipePage.clickSaveVieworDeleteButton(option)
});

Then('the superuser should be redirected to the {string} recipe page', async function (recipeName) {
  actualRecipeName = await recipePage.getRecipenName()
  assert.equal(
    recipeName,
    actualRecipeName,
    `Expected to get redirected to ${recipeName} recipe page but got redirected to ${actualRecipeName}`
  )
});