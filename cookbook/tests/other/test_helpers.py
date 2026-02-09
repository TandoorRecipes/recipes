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

def test_url_normalization():
    # URL with spaces and parentheses (USDA API style)
    assert validate_import_url("https://api.nal.usda.gov/fdc/v1/foods/search?api_key=DEMO_KEY&query=potato&dataType=Foundation,Survey (FNDDS),SR Legacy")
    
    # URL with brackets
    assert validate_import_url("https://example.com/search?q=[test]")

    # URL with control characters should be rejected
    assert not validate_import_url("https://example.com/path\nwith\rchars")

def test_url_encoded_ips():
    # SSRF bypass attempts with various IP encodings
    assert not validate_import_url('http://2130706433/')       # DWORD
    assert not validate_import_url('http://0x7f000001/')      # Hex
    assert not validate_import_url('http://017700000001/')    # Octal
    assert not validate_import_url('http://127.1/')           # Shortened
    assert not validate_import_url('http://0x7f.0x0.0x0.0x1/')# Hex dots
    assert not validate_import_url('http://0177.0.0.1/')      # Octal dots
    
    # Non-local encoded IPs (e.g. 8.8.8.8)
    assert validate_import_url('http://134744072/')           # 8.8.8.8 as DWORD
    assert validate_import_url('http://0x08080808/')          # 8.8.8.8 as Hex