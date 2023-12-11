// @ts-check

const code = require('./index')
	.code
	.replace('$slots', '$scopedSlots');

exports.code = code;
exports.default = code;
