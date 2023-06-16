const { filesForUpload }= require("../../cucumber.conf.js")
const { format } = require('util')

class RecipePage {
    constructor() {
        this.createRecipeDropdown = "//i[@class='fas fa-fw fa-plus fa-lg']"
        this.createRecipeButton = "//div[@class='dropdown-menu dropdown-menu-center show']/a[@href='/new/recipe/']"
        this.recipeNameInputSelector = "#id_name"
        this.saveRecipeNameButtonSelector = "//button[@class='btn btn-success']"
        this.descriptionInputSelector = "//textarea[@id='id_description']"
        this.preparationTimeInputSelector = "#id_prep_time"
        this.waitingTimeInputSelector = "#id_wait_time"
        this.servingsInputSelector = "#id_servings"
        this.servingsTextInputSelector = "#id_servings_text"
        this.imageInputSelector = "//input[@id='id_file_upload']"
        this.stepNameInputSelector = "//div[@id='id_card_step_0']//div[@class='input-group']/input"
        this.stepInstructionInputSelector = "//div[@id='id_card_step_0']//textarea"
        this.timeAddButtonSelector = "//button[contains(text(),'Time')]"
        this.timeInputSelector = "//label[contains(text(),'Step time in minutes')]/following-sibling::input"
        this.ingredientsAddButtonSelector = "//button[@class='btn btn-success btn-block']"
        this.ingredientAmountInputSelector = "//input[@id='amount_0_%s']"
        this.ingredientUnitInputSelector = "//input[@id='unit_0_%s']"
        this.ingredientUnitSelectSelector = "//ul[@id='listbox-unit_0_%s']//span[contains(text(),'%s')]//ancestor::li"
        this.ingredientNameInputSelector = "#ingredient_0_%s"
        this.ingredientNameSelectSelector = "//ul[@id='listbox-ingredient_0_%s']//span[contains(text(),'%s')]//ancestor::li"
        this.saveViewOrDeleteButtonSelector = "//button[contains(text(), '%s')]"
        this.recipeHeadingSelector = "//div[@class='col-12']/h3"
    }

   getRecipenName() {
        return page.locator(this.recipeHeadingSelector).innerText()
    }

    async createRecipe(recipeName) {
        await page.locator(this.createRecipeDropdown).click()
        await page.locator(this.createRecipeButton).click()
        await page.locator(this.recipeNameInputSelector).fill(recipeName)
        await page.locator(this.saveRecipeNameButtonSelector).click()
    }

    async inputRecipeDetails(recipeData) {
        await page.locator(this.descriptionInputSelector).fill(recipeData['Description'])
        await page.locator(this.preparationTimeInputSelector).fill(recipeData['Preparation_time'])
        await page.locator(this.waitingTimeInputSelector).fill(recipeData['Waiting_time'])
        await page.locator(this.servingsInputSelector).fill(recipeData['Servings'])
        await page.locator(this.servingsTextInputSelector).fill(recipeData['Servings_text'])
        await page.locator(this.imageInputSelector).setInputFiles(`${filesForUpload}${recipeData['Image']}`)
    }

    async inputRecipeStepDetails(stepData) {
        await page.locator(this.stepNameInputSelector).fill(stepData['Step_name'])
        await page.locator(this.timeAddButtonSelector).click()
        await page.locator(this.timeInputSelector).fill(stepData['Step_time'])
        await page.locator(this.stepInstructionInputSelector).fill(stepData['Instructions'])
    }

    async inputIngredients(ingredientsData) {
        for (let i = 0; i < ingredientsData.length; i++) {
            await page.locator(this.ingredientsAddButtonSelector).click()
            await page.locator(format(this.ingredientAmountInputSelector, i)).fill(ingredientsData[i]['Amount'])
            await page.locator(format(this.ingredientUnitInputSelector, i)).type(ingredientsData[i]['Unit'])
            await page.locator(format(this.ingredientUnitSelectSelector, i, ingredientsData[i]['Unit'])).click()
            await page.locator(format(this.ingredientNameInputSelector, i)).type(ingredientsData[i]['Name'])
            await page.locator(format(this.ingredientNameSelectSelector, i, ingredientsData[i]['Name'])).click()
        }
    }

    clickSaveVieworDeleteButton(buttonName) {
        return page.locator(format(this.saveViewOrDeleteButtonSelector, buttonName)).click()
    }
}
module.exports = { RecipePage }