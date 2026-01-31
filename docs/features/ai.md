Tandoor has several AI based features. To allow maximum flexibility, you can configure different AI providers and select them based on the task you want to perform.
To prevent accidental cost escalation Tandoor has a robust system of tracking and limiting AI costs.

## Where AI is used
AI is currently used for a few focused tasks:

- Importing recipes from images, PDFs, or raw text.
- Sorting recipe steps and assigning ingredients to steps.
- Extracting food and recipe properties (nutrition and other metadata).

All AI calls are routed through LiteLLM, so any provider supported by LiteLLM (or an OpenAI compatible endpoint) can be used when configured correctly.

## Default Configuration
By default the AI features are enabled for every space. Each space has a spending limit of roughly 1 USD per month.
This can be changed using the [configuration variables](https://docs.tandoor.dev/system/configuration/#ai-integration)

You can change these settings any time using the django admin. If you do not care about AI cost you can enter a very high limit or disable cost tracking for your providers.
The limit resets on the first of every month. 

## Configure AI Providers
When AI support is enabled for a space every user in a space can configure AI providers. 
The models shown in the editor have been tested and work with Tandoor. Most other models that can parse images/files and return text should also work. 

Superusers also have the ability to configure global AI providers that every space can use.

### Self-hosting setup
To use AI on a self-hosted instance, you need to:

1. Enable AI in your space (or set defaults via environment variables)
2. Create at least one AI Provider
3. Pick that provider when using an AI feature 

If you want a provider to be available in every space, create a global AI Provider as a superuser. Otherwise create a space-specific provider.

### Provider fields
When creating an AI Provider, the following fields matter:

- **Name**: Friendly label shown in the UI.
- **Model name**: Provider model identifier (example: `gpt-4o-mini`).
- **API key**: Required by the model. For local providers that do not need a key, set any non-empty value.
- **URL**: Optional base URL for OpenAI compatible endpoints (e.g. a self-hosted gateway).
- **Log credit cost**: Enables cost tracking. If disabled, the monthly credit limit will not be enforced for that provider.

### Provider examples
Examples for commonly used providers. For model naming, auth, and base URL details, see the LiteLLM provider docs:
`https://docs.litellm.ai/docs/providers`

#### OpenAI (gpt5.2-mini)

```text
Name: OpenAI gpt5.2-mini
Model name: gpt5.2-mini
API key: <your OpenAI API key>
URL: 
Log credit cost: enabled
```

#### OpenRouter (Gemini)
OpenRouter provides OpenAI compatible endpoints for many models. Model names must be prefixed with `openrouter/`.
Pick a Gemini model that supports JSON mode and (if needed) vision inputs. LiteLLM can route OpenRouter without a base URL, but setting it explicitly also works.

```text
Name: OpenRouter Gemini
Model name: openrouter/google/gemini-2.5-flash-lite
API key: <your OpenRouter API key>
URL: https://openrouter.ai/api/v1
Log credit cost: enabled
```

#### Google AI Studio (Gemini)

```text
Name: Gemini 2.5 Flash
Model name: gemini/gemini-2.5-flash
API key: <your Google AI Studio API key>
URL: (leave empty)
Log credit cost: enabled
```

### Requirements for models
Tandoor expects structured JSON responses from every AI call, so your model must support JSON mode or reliably return JSON.
For image/PDF import the provider must support vision inputs.

<!-- prettier-ignore -->
!!! warning
     AI import sends the entire file as base64 inside the request. Large files can exceed provider limits or reverse proxy limits.
     Consider reducing image size or using the text import path for large documents.

## Troubleshooting

- **JSON mode is required**: if the model ignores `response_format`, Tandoor will fail to parse the response and the request will error.
- **Vision support matters**: image/PDF import uses `image_url`. Models without vision support will fail. PDF handling depends on the provider; some only accept images.
- **Timeouts**: AI calls are synchronous. Slow models can hit reverse proxy or application server timeouts. Increase timeouts if your provider is slow.
- **Rate limits**: `AI_RATELIMIT` throttles AI endpoints (`60/hour` by default). For batch usage, raise this limit.
- **Cost tracking relies on LiteLLM**: if the provider does not return usage or cost data, logs and credit limits may not reflect real usage.
- **OpenRouter model names**: use the `openrouter/` prefix and select a model that supports structured outputs (OpenRouter model list: `https://openrouter.ai/api/v1/models?supported_parameters=structured_outputs`).

## AI Log
The AI Log allows you to track the usage of AI calls. Here you can also see the usage.
