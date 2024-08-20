from cookbook.helper.HelperFunctions import validate_import_url


def test_url_validator():
    # neither local nor public urls without protocol are valid
    assert not validate_import_url('localhost:8080')
    assert not validate_import_url('www.google.com')

    # public urls with schema and parameters are valid
    assert validate_import_url('https://www.google.com')
    assert validate_import_url('https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html#case-2-application-can-send-requests-to-any-external-ip-address-or-domain-name')

    assert not validate_import_url('https://localhost')
    assert not validate_import_url('http://127.0.0.1')