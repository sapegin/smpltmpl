// @ts-check
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const codeFrame = require('babel-code-frame');

/**
 * @param {string} filename
 * @return {string}
 */
function read(filename) {
	try {
		return fs.readFileSync(filename, 'utf8');
	} catch (err) {
		if (err.code === 'ENOENT') {
			throw Error(`Template file not found: ${filename}`);
		} else {
			throw err;
		}
	}
}

const STACK_REGEXP = /evalmachine\.<anonymous>:(\d+)(?::(\d+))?\n/;

/**
 * @param {string} tmpl
 * @param {object} context
 * @param {string} [filename]
 * @return {string}
 */
function template(tmpl, context, filename) {
	filename = filename || 'untitled';
	tmpl = tmpl.replace(/`/g, '\\`');
	try {
		return vm.runInNewContext('`' + tmpl + '`', context);
	} catch (exception) {
		// Take line and column from the last mentioned position which would look like this:
		// evalmachine.<anonymous>:1:11
		const positions = exception.stack.match(new RegExp(STACK_REGEXP, 'g'));
		let line;
		let col;
		if (positions) {
			const m = positions.pop().match(STACK_REGEXP);
			line = m && m[1];
			col = m && (m[2] || 1);
		}

		const code = codeFrame(tmpl, Number(line), Number(col));
		throw new Error(
			`Error in template ${filename}:${line}:${col}\n${exception.message}\n\n${code}`
		);
	}
}

/**
 * @param {string} filename
 * @param {string} context
 * @return {string}
 */
function templateFromFile(filename, context) {
	const tmpl = read(filename);
	return template(tmpl, context, path.basename(filename));
}

module.exports = {
	template,
	templateFromFile,
};
