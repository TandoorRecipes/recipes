const Username = {
	type: 'string',
	minLength: 1,
	maxLength: 48,
	pattern: '^[a-z0-9][a-z0-9-]*[a-z0-9]$'
};

const Name = {
	type: 'string',
	minLength: 1,
	maxLength: 32
};

const Email = {
	type: 'string',
	minLength: 5,
	maxLength: 256
};

const ImportFlowGitProvider = {
	oneOf: [
		{
			'enum': ['github', 'gitlab', 'bitbucket']
		},
		{
			type: 'null'
		}
	]
};

const ImportFlowGitNamespace = {
	oneOf: [
		{
			type: 'string'
		},
		{
			type: 'null'
		}
	]
};

const ImportFlowGitNamespaceId = {
	oneOf: [
		{
			type: 'string'
		},
		{
			type: 'number'
		},
		{
			type: 'null'
		}
	]
};

const ScopeId = {
	type: 'string'
};

const GitNamespaceId = {
	oneOf: [
		{
			type: 'string'
		},
		{
			type: 'number'
		},
		{
			type: 'null'
		}
	]
};

const PlatformVersion = {
	oneOf: [
		{
			// A `null` platform version means to always use the latest
			type: 'null'
		},
		{
			type: 'integer',
			minimum: 1,
			maximum: 2
		}
	]
};

const Avatar = {
	type: 'string',
	minLength: 40,
	maxLength: 40,
	pattern: '^[0-9a-f]+$'
};

const Bio = {
	type: 'string'
};

const Website = {
	type: 'string',
	minLength: 4,
	maxLength: 40
};

const Profile = {
	type: 'object',
	properties: {
		service: {
			type: 'string'
		},
		link: {
			type: 'string'
		}
	},
	additionalProperties: false
};

const Profiles = {
	type: 'array',
	minItems: 0,
	maxItems: 100,
	uniqueItems: true,
	items: Profile,
	additionalProperties: false
};

const RemoteCaching = {
	type: 'object',
	properties: {
		enabled: {
			type: 'boolean'
		}
	},
	additionalProperties: false
};


// Record<ToastName, Record<Scope, Date>>
const DismissedToasts = {
	type: 'object',
	patternProperties: {
		'^.*$': {
			'^.*$': {
				type: 'number'
			}
		}
	},
	additionalProperties: false
};

const User = {
	type: 'object',
	additionalProperties: false,
	properties: {
		username: Username,
		name: Name,
		email: Email,
		billingChecked: { type: 'boolean' },
		avatar: Avatar,
		platformVersion: PlatformVersion,
		bio: Bio,
		website: Website,
		profiles: Profiles,
		importFlowGitProvider: ImportFlowGitProvider,
		importFlowGitNamespace: ImportFlowGitNamespace,
		importFlowGitNamespaceId: ImportFlowGitNamespaceId,
		scopeId: ScopeId,
		gitNamespaceId: GitNamespaceId,
		remoteCaching: RemoteCaching,
		dismissedToasts: DismissedToasts
	}
};

module.exports = {
	User,
	Username,
	Name,
	Email,
	Avatar,
	PlatformVersion,
	ImportFlowGitProvider,
	ImportFlowGitNamespace,
	ImportFlowGitNamespaceId,
	ScopeId,
	GitNamespaceId,
	DismissedToasts
};
