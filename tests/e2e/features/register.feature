Feature: Register as super user
    As a user
    I want to register as a super user
    So that I can


    Background:
        Given user has navigated to the Setup page


    Scenario Outline: user tries to log in with invalid credentials
        When user logs in with username "<username>" ,password "<password>" and confirm password "<confirm password>"
        Then user should see message "<message>"
        Examples:
            | username | password | confirm password | message                                                                                                                            |
            | user     | 1234567  | 12345            | Passwords dont match!                                                                                                              |
            | user     | qwecvb1  | qwecvb1          | This password is too short. It must contain at least 8 characters.                                                                 |
            | user     | aaaaaaaa | aaaaaaaa         | This password is too common.                                                                                                       |
            | user     | 12345    | 12345            | This password is too short. It must contain at least 8 characters.,This password is too common.,This password is entirely numeric. |
            | user     | 12345678 | 12345678         | This password is too common.,This password is entirely numeric.                                                                    |


    Scenario: user logs in with valid credentials
        When user logs in with username "user" ,password "aaaa1234" and confirm password "aaaa1234"
        Then user should redirect to login page
        And user should get sucess message "User has been created, please login!"
