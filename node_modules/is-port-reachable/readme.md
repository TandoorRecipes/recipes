# is-port-reachable

> Check if a local or remote port is reachable

## Install

```sh
npm install is-port-reachable
```

## Usage

```js
import isPortReachable from 'is-port-reachable';

console.log(await isPortReachable(80, {host: 'google.com'}));
//=> true
```

## API

### isPortReachable(options)

Returns `Promise<boolean>` for whether the port is reachable.

##### port

Type: `number`

The port to check.

#### options

Type: `object`

##### host

**Required**\
Type: `string`\
Example: `'localhost'`

The host to check.

Can be a domain (optionally, with a sub-domain) or an IP address.

##### timeout

Type: `number`\
Default: `1000`

The time to wait in milliseconds before giving up.

## Related

- [is-reachable](https://github.com/sindresorhus/is-reachable/) - Check if servers are reachable
