Feature: edit user details
    As a user
    I want to edit my details
    So that I can share my details to other users

    Background:
        Given the superuser has signed up with the following details
            | username | superuser |
            | password | super1234 |
        And the superuser has logged in with username "superuser" and password "super1234"
        And the superuser has created a space "superuser's Space"


    Scenario Outline: superuser updates/edits his/her name
        Given the superuser has navigated to account setting page
        When the superuser edits his first name to "<firstname>" and lastname to "<lastname>"
        Then the superuser name should be updated on toolbar to "<firstname> <lastname>"
        Examples:
            | firstname | lastname |
            | first     | last     |
            | first     |          |
            |           | last     |
