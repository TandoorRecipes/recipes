export interface Config {
	/** For how long to cache latest version (default: 1 day) */
	interval?: number;

	/** An npm distribution tag for comparision (default: 'latest') */
	distTag?: string;
}

export interface Result {
	/** The latest version from npm */
	latest: string;

	/** Has this result been retrieved from the local cache? */
	fromCache: boolean;
}

/** Check if updates are available on npm for a given package */
export default function(pkg: object, config?: Config): Promise<Result | null>;
