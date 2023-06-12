Feature: login feature
    As a user
    I want to manage my profile
    So that other users can recognize my recipe


    Background:
        Given the user has signed up with the following details
            | username         | user     |
            | password         | aaaa1234 |
            | confirm_password | aaaa1234 |
        And the user has browsed to login page


    Scenario: user logs in with valid credentials
        When the user logs in with username "user" and password "aaaa1234"
        Then the user should be navigated to the homepage
        And the user should see the message "Successfully signed in as user."


    Scenario: user logs in with invalid credentials
        When the user logs in with username "<username>" and password "<password>"
        Then the user should see the error message "<message>"
        Examples:
            | username | password | message                                                     |
            | user123  | 123456   | The username and/or password you specified are not correct. |
            | user     | 123456   | The username and/or password you specified are not correct. |
            | user123  | aaaa1234 | The username and/or password you specified are not correct. |