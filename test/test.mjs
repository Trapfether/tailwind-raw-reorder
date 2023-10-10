import pckge from '../package.json' assert { type: "json" };
import { getTextMatch, buildMatchers } from '../src/utils.mjs';
import { readFileSync } from 'fs';
import path from 'path';

import assert from 'assert';
import { describe } from 'mocha';

const langConfig = pckge.contributes.configuration[0].properties['tailwind-raw-reorder.classRegex'].default;

describe('Basic Regex', function () {
  describe('PHP', function () {
		const phpFilePath = path.resolve('./test/language_examples/example.blade.php');
		const phpFile = readFileSync(phpFilePath, 'utf8');
		const matchesTruth = phpFile.match(/class="((?:[^"{}<>]+|\\")+)"/g).map((value)=>{
			return value.match(/class="((?:[^"{}<>]+|\\")+)"/)[1];
		})
		const matches = [];
		const matchers = buildMatchers( langConfig['php'] );
		for (const matcher of matchers) {
			getTextMatch(matcher.regex, phpFile, (text, startPosition) => {
				matches.push(text);
			});
		}
		it('should match all classes', function () {
			assert.deepEqual(matches, matchesTruth);
		});
  });

	describe('HTML', function () {
		const htmlFilePath = path.resolve('./test/language_examples/example.html');
		const htmlFile = readFileSync(htmlFilePath, 'utf8');
		const matchesTruth = htmlFile.match(/class="((?:[^"{}<>]+|\\")+)"/g).map((value)=>{
			return value.match(/class="((?:[^"{}<>]+|\\")+)"/)[1];
		})
		const matches = [];
		const matchers = buildMatchers( langConfig['html'] );
		for (const matcher of matchers) {
			getTextMatch(matcher.regex, htmlFile, (text, startPosition) => {
				matches.push(text);
			});
		}
		it('should match all classes', function () {
			assert.deepEqual(matches, matchesTruth);
		});
	});

	describe('JS', function () {
		const jsFilePath = path.resolve('./test/language_examples/example.vanilla.js');
		const jsFile = readFileSync(jsFilePath, 'utf8');
		const matchesTruth = jsFile.match(/(?:class(?:Name)?|tw)\s*=\s*(["'`])(?:(?:[^{}<>](?!\1))|\\\1)+[^{}<>]\1/g).map((value)=>{
			return value.match(/(?:class(?:Name)?|tw)\s*=\s*(["'`])((?:(?:[^{}<>](?!\1))|\\\1)+[^{}<>])\1/)[2];
		})
		const matches = [];
		const matchers = buildMatchers( langConfig['javascript'] );
		for (const matcher of matchers) {
			getTextMatch(matcher.regex, jsFile, (text, startPosition) => {
				matches.push(text);
			});
		}
		it('should match all classes', function () {
			assert.deepEqual(matches, matchesTruth);
		});
	});

	describe('Javascript React', function () {
		const jsxFilePath = path.resolve('./test/language_examples/example.react.jsx');
		const jsxFile = readFileSync(jsxFilePath, 'utf8');
		const matchesTruth = jsxFile.match(/(?:class(?:Name)?|tw)\s*=\s*{?(["'`])(?:(?:[^{}<>](?!\1))|\\\1)+[^{}<>]\1/g).map((value)=>{
			return value.match(/(?:class(?:Name)?|tw)\s*=\s*{?(["'`])((?:(?:[^{}<>](?!\1))|\\\1)+[^{}<>])\1/)[2];
		});
		const matches = [];
		const matchers = buildMatchers( langConfig['javascriptreact'] );
		for (const matcher of matchers) {
			getTextMatch(matcher.regex, jsxFile, (text, startPosition) => {
				matches.push(text);
			});
		}
		it('should match all classes', function () {
			assert.deepEqual(matches, matchesTruth);
		});
	});
});