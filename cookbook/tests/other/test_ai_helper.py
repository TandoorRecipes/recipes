import pytest

from cookbook.helper.ai_helper import strip_json_fences


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
