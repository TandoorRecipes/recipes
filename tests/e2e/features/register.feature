Feature: Register as super superuser
    As a superuser
    I want to register as a superuser
    So that I can create recipes,spaces and users

    Background:
        Given the superuser has navigated to the setup page


    Scenario Outline: superuser tries to sign up with invalid credentials
        When the superuser signs up with the following details
            | username         | <username>         |
            | password         | <password>         |
            | confirm_password | <confirm_password> |
        Then the superuser should see a message "<message>"
        Examples:
            | username  | password | confirm_password | message                                                                                                                            |
            | superuser | 1234567  | 12345            | Passwords dont match!                                                                                                              |
            | superuser | qwecvb1  | qwecvb1          | This password is too short. It must contain at least 8 characters.                                                                 |
            | superuser | aaaaaaaa | aaaaaaaa         | This password is too common.                                                                                                       |
            | superuser | 12345    | 12345            | This password is too short. It must contain at least 8 characters.,This password is too common.,This password is entirely numeric. |
            | superuser | 12345678 | 12345678         | This password is too common.,This password is entirely numeric.                                                                    |


    Scenario: superuser registers with valid credentials
        When the superuser signs up with the following details
            | superusername | superuser |
            | password      | aaaa1234  |
        Then the superuser should redirect to sign in page
        And the superuser should get a success message "User has been created, please login!"
