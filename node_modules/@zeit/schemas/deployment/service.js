const Service = {
	type: 'object',
	additionalProperties: false,
	properties: {
		port: {
			type: 'number',
			minimum: 1,
			maximum: 32767
		}
	}
};

module.exports = {
	Service
};
