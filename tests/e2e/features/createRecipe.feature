Feature: Create recipe feature
    As a user
    I want to create a recipe
    So that I can store and share them with other users

    Background:
        Given the superuser has signed up with the following details
            | username         | superuser |
            | password         | super1234 |
        And the superuser has logged in with username "superuser" and password "super1234"
        And the superuser has created a space named "Superuser's Space"


    Scenario: superuser creates a new recipe with basic details only
        When the superuser creates new recipe "Masala tea recipe(test)" with following details:
            | Description      | This is a test recipe for masala tea |
            | Preparation_time | 2                                    |
            | Waiting_time     | 10                                   |
            | Servings         | 4                                    |
            | Servings_text    | cup                                  |
            | Image            | masalachai.jpeg                      |
        And the superuser "Save & View" the recipe
        Then the superuser should be redirected to the "Masala tea recipe(test)" recipe page


    Scenario: superuser creates a new recipe with steps and ingredients
        When the superuser creates new recipe "Masala tea recipe(test)" with following details:
            | Description      | This is a test recipe for masala tea |
            | Preparation_time | 2                                    |
            | Waiting_time     | 10                                   |
            | Servings         | 4                                    |
            | Servings_text    | cup                                  |
            | Image            | masalachai.jpeg                      |
        And the superuser adds following step details
            | Step_name    | Boil water with tea and spices                            |
            | Step_time    | 2                                                         |
            | Instructions | Add the spices and tea with the water and wait until boil |
        And the superuser adds following ingredients
            | Amount | Unit | Name         |
            | 20     | gm   | mixed spices |
            | 10     | gm   | sugar        |
            | 100    | ml   | water        |
        And the superuser "Save & View" the recipe
        Then the superuser should be redirected to the "Masala tea recipe(test)" recipe page