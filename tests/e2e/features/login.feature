Feature: login feature
    As a superuser
    I want to manage my profile
    So that other superusers can recognize my recipe

    Background:
        Given the superuser has signed up with the following details
            | username | superuser |
            | password | super1234 |
        And the superuser has browsed to login page


    Scenario: superuser logs in with valid credentials
        When the superuser logs in with username "superuser" and password "super1234"
        Then the superuser should be navigated to the homepage
        And the superuser should see the message "Successfully signed in as superuser."


    Scenario: superuser logs in with invalid credentials
        When the superuser logs in with username "<username>" and password "<password>"
        Then the superuser should see the error message "<message>"
        Examples:
            | username     | password  | message                                                     |
            | superuser123 | 123456    | The username and/or password you specified are not correct. |
            | superuser    | 123456    | The username and/or password you specified are not correct. |
            | superuser123 | super1234 | The username and/or password you specified are not correct. |