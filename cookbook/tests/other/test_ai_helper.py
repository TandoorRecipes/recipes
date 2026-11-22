import socket
from types import SimpleNamespace
from unittest.mock import Mock

import pytest

from cookbook.helper import ai_helper
from cookbook.helper.ai_helper import build_ai_request, strip_json_fences


@pytest.mark.parametrize('text,expected', [
    ('{"a": 1}', '{"a": 1}'),
    ('```json\n{"a": 1}\n```', '{"a": 1}'),
    ('```\n{"a": 1}\n```', '{"a": 1}'),
    ('  ```json\n{"a": 1}\n```  \n', '{"a": 1}'),
    ('```json\n{"a": 1}', '{"a": 1}'),
    ('```JSON\r\n{"a": 1}\r\n```', '{"a": 1}'),
    ('```json\n{"a": "```"}\n```', '{"a": "```"}'),
    ('{"a": "```"}', '{"a": "```"}'),
    ('```json\n{"a": 1}\n```\n\nSome explanation.', '{"a": 1}'),
    ('Here you go:\n```json\n{"a": 1}\n```', '{"a": 1}'),
])
def test_strip_json_fences(text, expected):
    assert strip_json_fences(text) == expected


@pytest.fixture
def ai_provider():
    return SimpleNamespace(api_key='test-key', model_name='test-model', url='')


@pytest.mark.parametrize(('provider', 'model'), [
    ('ollama', 'ollama/llama3'),
    ('ollama_chat', 'ollama_chat/llama3'),
    ('lm_studio', 'lm_studio/model'),
])
def test_local_default_provider_is_rejected(ai_provider, monkeypatch, provider, model):
    ai_provider.model_name = model
    monkeypatch.setattr(
        ai_helper,
        'get_llm_provider',
        lambda model: ('model', provider, None, 'http://localhost:11434'),
    )
    monkeypatch.setattr(ai_helper, '_is_local_url', lambda url: True)

    with pytest.raises(ValueError, match='local URL'):
        build_ai_request(ai_provider, [])


def test_local_default_url_is_allowed_when_whitelisted(ai_provider, monkeypatch):
    monkeypatch.setattr(
        ai_helper,
        'get_llm_provider',
        lambda model: ('model', 'ollama', None, 'http://localhost:11434'),
    )
    monkeypatch.setattr(ai_helper, 'settings', SimpleNamespace(AI_ALLOWED_URLS=['http://localhost:11434']))

    request = build_ai_request(ai_provider, [])

    assert request['api_base'] == 'http://localhost:11434'


def test_litellm_ollama_default_is_rejected(ai_provider, monkeypatch):
    monkeypatch.delenv('OLLAMA_API_BASE', raising=False)
    monkeypatch.setattr(ai_helper.settings, 'AI_ALLOWED_URLS', [])
    ai_provider.model_name = 'ollama/llama3'

    _, provider, _, api_base = ai_helper.get_llm_provider(model=ai_provider.model_name)

    assert provider == 'ollama'
    assert api_base == 'http://localhost:11434'
    with pytest.raises(ValueError, match='local URL'):
        build_ai_request(ai_provider, [])


@pytest.mark.parametrize('provider', ['openai', 'anthropic', 'mistral'])
def test_public_default_provider_is_allowed(ai_provider, monkeypatch, provider):
    monkeypatch.setattr(
        ai_helper,
        'get_llm_provider',
        lambda model: ('model', provider, None, None),
    )

    request = build_ai_request(ai_provider, [])

    assert request['model'] == ai_provider.model_name
    assert 'api_base' not in request


def test_unknown_provider_without_default_url_is_rejected(ai_provider, monkeypatch):
    monkeypatch.setattr(
        ai_helper,
        'get_llm_provider',
        lambda model: ('model', 'unknown_provider', None, None),
    )

    with pytest.raises(ValueError, match='requires an explicit, allowed URL'):
        build_ai_request(ai_provider, [])


def test_unrecognized_model_is_rejected(ai_provider, monkeypatch):
    monkeypatch.setattr(ai_helper, 'get_llm_provider', Mock(side_effect=Exception('unknown model')))

    with pytest.raises(ValueError, match='Unknown AI model'):
        build_ai_request(ai_provider, [])


def test_custom_url_must_be_whitelisted(ai_provider, monkeypatch):
    ai_provider.url = 'https://custom.example/v1'
    monkeypatch.setattr(ai_helper, 'settings', SimpleNamespace(AI_ALLOWED_URLS=[]))
    get_llm_provider = Mock()
    monkeypatch.setattr(ai_helper, 'get_llm_provider', get_llm_provider)

    with pytest.raises(ValueError, match='AI provider URL not allowed'):
        build_ai_request(ai_provider, [])

    get_llm_provider.assert_not_called()


def test_whitelisted_custom_url_is_used(ai_provider, monkeypatch):
    ai_provider.url = 'https://custom.example/v1'
    monkeypatch.setattr(ai_helper, 'settings', SimpleNamespace(AI_ALLOWED_URLS=[ai_provider.url]))

    request = build_ai_request(ai_provider, [], response_format={'type': 'json_object'})

    assert request['api_base'] == ai_provider.url
    assert request['response_format'] == {'type': 'json_object'}


@pytest.mark.parametrize('url', [
    'http://127.0.0.1:11434',
    'http://10.0.0.1',
    'http://169.254.1.1',
    'http://[::1]:11434',
    'http://[fc00::1]',
    'http://[fe80::1]',
])
def test_local_ip_addresses_are_detected(url):
    assert ai_helper._is_local_url(url)


def test_public_ip_address_is_not_local():
    assert not ai_helper._is_local_url('https://8.8.8.8')


def test_dns_resolving_to_local_address_is_detected(monkeypatch):
    monkeypatch.setattr(
        ai_helper.socket,
        'getaddrinfo',
        lambda host, port: [(socket.AF_INET, socket.SOCK_STREAM, 6, '', ('10.0.0.1', 0))],
    )

    assert ai_helper._is_local_url('http://internal.example')
