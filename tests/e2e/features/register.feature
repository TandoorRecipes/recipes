Feature: Register as super user
    As a user
    I want to register as a super user
    So that I can create recipes,spaces and users


    Background:
        Given the user has navigated to the setup page


    Scenario Outline: user tries to sign up with invalid credentials
        When the user signs up with the following details
            | username         | <username>         |
            | password         | <password>         |
            | confirm_password | <confirm_password> |
        Then the user should see message "<message>"
        Examples:
            | username | password | confirm_password | message                                                                                                                            |
            | user     | 1234567  | 12345            | Passwords dont match!                                                                                                              |
            | user     | qwecvb1  | qwecvb1          | This password is too short. It must contain at least 8 characters.                                                                 |
            | user     | aaaaaaaa | aaaaaaaa         | This password is too common.                                                                                                       |
            | user     | 12345    | 12345            | This password is too short. It must contain at least 8 characters.,This password is too common.,This password is entirely numeric. |
            | user     | 12345678 | 12345678         | This password is too common.,This password is entirely numeric.                                                                    |


    Scenario: user registers with valid credentials
        When the user signs up with the following details
            | username         | user     |
            | password         | aaaa1234 |
            | confirm_password | aaaa1234 |
        Then the user should redirect to sign in page
        And the user should get success message "User has been created, please login!"
