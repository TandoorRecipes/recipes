Feature: Create a space
    As a superuser
    I want to create a space
    So that I can add recipes and share my recipes

    Background:
        Given the superuser has signed up with the following details
            | username | superuser |
            | password | super1234 |
        And the superuser has logged in with username "superuser" and password "super1234"


    Scenario: superuser creates a space
        When the superuser creates a space "superuser's Space"
        Then the superuser should get a success message "You have successfully created your own recipe space. Start by adding some recipes or invite other people to join you."
        And superuser's space "superuser's Space" should be visible on option menu


    Scenario: superuser creates a space from space overview page
        Given the superuser has browsed to the space overview page
        When the superuser creates a space "superuser's new Space"
        Then the superuser should get a success message "You have successfully created your own recipe space. Start by adding some recipes or invite other people to join you."
        And superuser's space "superuser's new Space" should be visible on option menu


    Scenario: superuser tries to create space with existing name
        Given the superuser has browsed to the space overview page
        And the superuser has created a space "superuser's new Space"
        And the superuser has browsed to the space overview page
        When the superuser tries to create a space "superuser's new Space"
        Then the superuser should get an error message "Name already taken."
