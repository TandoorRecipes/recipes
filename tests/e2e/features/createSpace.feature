Feature: Create space super user
    As a user
    I want to create a space
    So that I can add recipes and share my recipes


    Background:
        Given the user has registered with username "user" and password "aaaa1234"
        And the user has browsed to login page
        And the user logs in with username "user" and password "aaaa1234"


    Scenario: user tries to create a space
        When the user creates a space "user's Space"
        And the user redirects to search page
        Then the user should get success message "You have successfully created your own recipe space. Start by adding some recipes or invite other people to join you."
        And userspace "user's Space" should be visible on option menu


    Scenario: user tries to create a space on space overview page
        Given the user has browsed to the space overview page
        When the user creates a space "user's new Space"
        And the user redirects to search page
        Then the user should get success message "You have successfully created your own recipe space. Start by adding some recipes or invite other people to join you."
        And userspace "user's new Space" should be visible on option menu


    Scenario: user tries to create space with existing name
        Given the user has browsed to the space overview page
        And the user has created a space "user's new Space"
        And the user has browsed to the space overview page
        When the user creates a space "user's new Space"
        Then the user should get error message "Name already taken."
