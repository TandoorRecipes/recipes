/* eslint camelcase: 0 */
const AJV = require('ajv');
const assert = require('assert');
const { User } = require('../user');

const ajv = new AJV({ allErrors: true });

// Username
exports.test_username_null = () => {
	const isValid = ajv.validate(User, {
		username: null
	});
	assert.equal(isValid, false);
	assert.equal(ajv.errors.length, 1);
	assert.equal(ajv.errors[0].dataPath, '.username');
	assert.equal(ajv.errors[0].message, 'should be string');
};

exports.test_username_invalid_pattern = () => {
	const isValid = ajv.validate(User, {
		username: '!!!'
	});
	assert.equal(isValid, false);
	assert.equal(ajv.errors.length, 1);
	assert.equal(ajv.errors[0].dataPath, '.username');
	assert.equal(
		ajv.errors[0].message,
		'should match pattern "^[a-z0-9][a-z0-9-]*[a-z0-9]$"'
	);
};

exports.test_username_too_short = () => {
	const isValid = ajv.validate(User, {
		username: ''
	});
	assert.equal(isValid, false);
	assert.equal(ajv.errors.length, 2);
	assert.equal(ajv.errors[0].dataPath, '.username');
	assert.equal(
		ajv.errors[0].message,
		'should NOT be shorter than 1 characters'
	);
	assert.equal(ajv.errors[1].dataPath, '.username');
	assert.equal(
		ajv.errors[1].message,
		'should match pattern "^[a-z0-9][a-z0-9-]*[a-z0-9]$"'
	);
};

exports.test_username_too_long = () => {
	const isValid = ajv.validate(User, {
		username: 'a'.repeat(50)
	});
	assert.equal(isValid, false);
	assert.equal(ajv.errors.length, 1);
	assert.equal(ajv.errors[0].dataPath, '.username');
	assert.equal(
		ajv.errors[0].message,
		'should NOT be longer than 48 characters'
	);
};

exports.test_username_valid = () => {
	assert(ajv.validate(User, { username: 'n8' }));
	assert(ajv.validate(User, { username: 'rauchg' }));
};

// Name
exports.test_name_too_short = () => {
	const isValid = ajv.validate(User, {
		name: ''
	});
	assert.equal(isValid, false);
	assert.equal(ajv.errors.length, 1);
	assert.equal(ajv.errors[0].dataPath, '.name');
	assert.equal(
		ajv.errors[0].message,
		'should NOT be shorter than 1 characters'
	);
};

exports.test_name_too_long = () => {
	const isValid = ajv.validate(User, {
		name: 'a'.repeat(50)
	});
	assert.equal(isValid, false);
	assert.equal(ajv.errors.length, 1);
	assert.equal(ajv.errors[0].dataPath, '.name');
	assert.equal(
		ajv.errors[0].message,
		'should NOT be longer than 32 characters'
	);
};

exports.test_name_valid = () => {
	assert(ajv.validate(User, { name: 'Nate' }));
};

// BillingChecked
exports.test_billing_checked_null = () => {
	const isValid = ajv.validate(User, {
		billingChecked: null
	});
	assert.equal(isValid, false);
	assert.equal(ajv.errors.length, 1);
	assert.equal(ajv.errors[0].dataPath, '.billingChecked');
	assert.equal(ajv.errors[0].message, 'should be boolean');
};

exports.test_billing_checked_valid = () => {
	assert(ajv.validate(User, { billingChecked: true }));
};

// Avatar
exports.test_avatar_too_short = () => {
	const isValid = ajv.validate(User, {
		avatar: 'abc'
	});
	assert.equal(isValid, false);
	assert.equal(ajv.errors.length, 1);
	assert.equal(ajv.errors[0].dataPath, '.avatar');
	assert.equal(
		ajv.errors[0].message,
		'should NOT be shorter than 40 characters'
	);
};

exports.test_avatar_too_long = () => {
	const isValid = ajv.validate(User, {
		avatar: 'a'.repeat(50)
	});
	assert.equal(isValid, false);
	assert.equal(ajv.errors.length, 1);
	assert.equal(ajv.errors[0].dataPath, '.avatar');
	assert.equal(
		ajv.errors[0].message,
		'should NOT be longer than 40 characters'
	);
};

exports.test_avatar_invalid = () => {
	const isValid = ajv.validate(User, {
		avatar: 'n'.repeat(40)
	});
	assert.equal(isValid, false);
	assert.equal(ajv.errors.length, 1);
	assert.equal(ajv.errors[0].dataPath, '.avatar');
	assert.equal(ajv.errors[0].message, 'should match pattern "^[0-9a-f]+$"');
};

exports.test_avatar_valid = () => {
	assert(ajv.validate(User, { avatar: 'a'.repeat(40) }));
};

exports.test_email_valid = () => {
	assert(ajv.validate(User, { email: 'nate@zeit.co' }));
};

exports.test_email_invalid = () => {
	const isValid = ajv.validate(User, {
		email: `${'n'.repeat(256)}@zeit.co`
	});
	assert.equal(isValid, false);
};

exports.test_avatar_invalid_length = () => {
	assert(ajv.validate(User, { avatar: 'a'.repeat(40) }));
};

exports.test_platformVersion_null_valid = () => {
	assert(ajv.validate(User, { platformVersion: null }));
};

exports.test_platformVersion_zero_invalid = () => {
	const isValid = ajv.validate(User, {
		platformVersion: 0
	});
	assert.equal(isValid, false);
};

exports.test_platformVersion_one_valid = () => {
	assert(ajv.validate(User, { platformVersion: 1 }));
};

exports.test_platformVersion_two_valid = () => {
	assert(ajv.validate(User, { platformVersion: 2 }));
};

exports.test_platformVersion_three_invalid = () => {
	const isValid = ajv.validate(User, {
		platformVersion: 3
	});
	assert.equal(isValid, false);
};

exports.test_importFlowGitProvider_github_valid = () => {
	assert(ajv.validate(User, { importFlowGitProvider: 'github' }));
};

exports.test_importFlowGitProvider_gitlab_valid = () => {
	assert(ajv.validate(User, { importFlowGitProvider: 'gitlab' }));
};

exports.test_importFlowGitProvider_bitbucket_valid = () => {
	assert(ajv.validate(User, { importFlowGitProvider: 'bitbucket' }));
};

exports.test_importFlowGitProvider_null_valid = () => {
	assert(ajv.validate(User, { importFlowGitProvider: null }));
};

exports.test_importFlowGitProvider_invalid_value = () => {
	const isValid = ajv.validate(User, {
		importFlowGitProvider: 'test'
	});
	assert.equal(isValid, false);
};

exports.test_importFlowGitProvider_number_invalid = () => {
	const isValid = ajv.validate(User, {
		importFlowGitProvider: 10
	});
	assert.equal(isValid, false);
};

exports.test_importFlowGitNamespace_string_valid = () => {
	assert(ajv.validate(User, { importFlowGitNamespace: 'test' }));
};

exports.test_importFlowGitNamespace_null_valid = () => {
	assert(ajv.validate(User, { importFlowGitNamespace: null }));
};

exports.test_importFlowGitNamespace_number_invalid = () => {
	const isValid = ajv.validate(User, {
		importFlowGitNamespace: 10
	});
	assert.strictEqual(isValid, false);
};

exports.test_importFlowGitNamespace_boolean_invalid = () => {
	const isValid = ajv.validate(User, {
		importFlowGitNamespace: true
	});
	assert.strictEqual(isValid, false);
};

exports.test_importFlowGitNamespaceId_string_valid = () => {
	assert(ajv.validate(User, { importFlowGitNamespaceId: 'test' }));
};

exports.test_importFlowGitNamespaceId_number_valid = () => {
	assert(ajv.validate(User, { importFlowGitNamespaceId: 10 }));
};

exports.test_importFlowGitNamespaceId_null_valid = () => {
	assert(ajv.validate(User, { importFlowGitNamespaceId: null }));
};

exports.test_importFlowGitNamespaceId_boolean_invalid = () => {
	const isValid = ajv.validate(User, {
		importFlowGitNamespaceId: true
	});
	assert.strictEqual(isValid, false);
};

exports.test_scopeId_valid = () => {
	assert(ajv.validate(User, { scopeId: '123test' }));
};

exports.test_scopeId_invalid = () => {
	const isValid = ajv.validate(User, {
		scopeId: null
	});
	assert.strictEqual(isValid, false);
};

exports.test_gitNamespaceId_string_valid = () => {
	assert(ajv.validate(User, { gitNamespaceId: 'test' }));
};

exports.test_gitNamespaceId_number_valid = () => {
	assert(ajv.validate(User, { gitNamespaceId: 123 }));
};

exports.test_gitNamespaceId_null_valid = () => {
	assert(ajv.validate(User, { gitNamespaceId: null }));
};

exports.test_gitNamespaceId_boolean_invalid = () => {
	const isValid = ajv.validate(User, {
		gitNamespaceId: true
	});
	assert.strictEqual(isValid, false);
};

exports.test_remoteCaching_valid = () => {
	assert(ajv.validate(User, { remoteCaching: { enabled: true } }));
};

exports.test_remoteCaching_valid = () => {
	const isValid = ajv.validate(User, { remoteCaching: { enabled: 'yes' } });
	assert.strictEqual(isValid, false);
};

exports.test_dismissedToasts_valid = () => {
	assert(ajv.validate(User, { dismissedToasts: {} }));
};

exports.test_dismissedToasts_valid = () => {
	assert(ajv.validate(User, { dismissedToasts: { exampleToast: { exampleScopeId: 1656442351576 } } }));
};

exports.test_dismissedToasts_valid = () => {
	const isValid = ajv.validate(User, { dismissedToasts: []});
	assert.strictEqual(isValid, false);
};
