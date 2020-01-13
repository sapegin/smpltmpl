'use strict';

const template = require('./index').template;
const templateFromFile = require('./index').templateFromFile;

const isNode4 = process.version.startsWith('v4.');

describe('template()', () => {
	it('should apply template to a file', () => {
		const result = template('Hello, ${foo}!', { foo: 'Bar' });
		expect(result).toBe('Hello, Bar!');
	});

	it('should escape `', () => {
		const fn = () => template('Hello, \\`${foo}\\`!', { foo: 'Bar' });
		expect(fn).not.toThrowError();

		const result = fn();
		expect(result).toBe('Hello, `Bar`!');
	});

	it('should throw if template has a syntax error', () => {
		const fn = () => template('Hello\n${foo!', { foo: 'Bar' });
		// Node 4 in some case doesn’t have position information
		expect(fn).toThrowError(
			isNode4 ? 'Error in template untitled' : 'Error in template untitled:2'
		);
	});

	it('should throw if context variable is missed', () => {
		const fn = () => template('Hello\nworld of templates ${foo}!', { bar: 'Bar' });
		expect(fn).toThrowError('Error in template untitled:2:22\nfoo is not defined');
	});

	it('should show a given file name in an error message', () => {
		const fn = () => template('Hello\n${foo}!', {}, 'pizza.txt');
		expect(fn).toThrowError('Error in template pizza.txt:2:3');
	});

	it('should a code frame', () => {
		const fn = () => template('Hello\nworld ${foo}!', { bar: 'Bar' });
		expect(fn).toThrowErrorMatchingSnapshot();
	});
});

describe('templateFromFile()', () => {
	it('should apply template to a file', () => {
		const result = templateFromFile('test/template.txt', { foo: 'Bar' });
		expect(result).toBe('Hello, Bar!');
	});

	it('should throw if a template file not found', () => {
		const fn = () => templateFromFile('pizza', {});
		expect(fn).toThrowError('Template file not found: pizza');
	});

	it('should throw in case of other error while reading a file', () => {
		const fn = () => templateFromFile('test', {});
		expect(fn).toThrowError('EISDIR');
	});
});
