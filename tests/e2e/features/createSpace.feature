Feature: Create space super user
    As a user
    I want to create a space
    So that I can add recipes and share my recipes


    Background:
        Given the user has registered with username "user" and password "aaaa1234"
        And the user has browsed to login page
        And the user logs in with username "user" and password "aaaa1234"
        And user should see options to create space


    Scenario: user tries to create a space when first login
        When user tries to create a space with name "user's Space"
        And redirects to search page
        Then user should get success message "You have successfully created your own recipe space. Start by adding some recipes or invite other people to join you."
        And userspace "user's Space" should be visible on option menu


    Scenario: user tries to create a space on space overview page
        Given user is on space overview page
        When user tries to create a space with name "user's new Space"
        And redirects to search page
        Then user should get success message "You have successfully created your own recipe space. Start by adding some recipes or invite other people to join you."
        And userspace "user's new Space" should be visible on option menu


    Scenario: user tries to create space with invalid name
        Given user is on space overview page
        And user tries to create a space with name "user's new Space"
        And user is on space overview page
        When user tries to create a space with name "user's new Space"
        Then user should get error message "Name already taken."

