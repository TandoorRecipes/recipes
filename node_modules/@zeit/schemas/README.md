# Vercel Schemas

Schemas used across many Vercel packages to validating config files, requests to APIs, and more.

## Why?

- Keep schemas used across Vercel projects in sync
- We use `.js` instead of `.json` because parsing JSON takes longer

## Usage

To get started, pick one of the schemas in this repository and load it:

```js
const schema = require('@zeit/schemas/deployment/config');
```

Next, set up [AJV](https://github.com/epoberezkin/ajv) (the validator) and run the schema through it:

```js
const AJV = require('ajv');

const ajv = new AJV({ allErrors: true });
const isValid = ajv.validate(schema, <object-to-validate>);

if (!isValid) {
	console.error(`The following entries are wrong: ${JSON.stringify(ajv.errors)}`);
}
```

That is all! :tada:

## Contributing

We are currently not accepting external contributions for this repository.
