export interface Options {
	/**
	The host to check.

	Can be a domain (optionally, with a sub-domain) or an IP address.

	@example 'localhost'
	*/
	readonly host: string;

	/**
	The time to wait in milliseconds before giving up.

	@default 1000
	*/
	readonly timeout?: number;
}

/**
Check if a local or remote port is reachable.

@example
```
import isPortReachable from 'is-port-reachable';

console.log(await isPortReachable(80, {host: 'google.com'}));
//=> true
```
*/
export default function isPortReachable(port: number, options: Options): Promise<boolean>;
