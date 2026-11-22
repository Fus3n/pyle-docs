import { HighlightStyle, StreamLanguage, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';

const keywords = new Set([
	'let',
	'fn',
	'if',
	'elif',
	'else',
	'while',
	'for',
	'in',
	'loop',
	'break',
	'continue',
	'return',
	'struct',
	'enum',
	'static',
	'and',
	'or',
	'not',
	'yield',
	'self',
]);

const builtins = new Set([
	'print',
	'printf',
	'format',
	'input',
	'import',
	'add_import_path',
	'typeof',
	'tostring',
	'tonum',
	'toint',
	'tofloat',
	'Coro',
	'Bytes',
	'BytesBuilder',
	'File',
	'Future',
	'pcall',
	'assert',
	'raise',
	'print_trace',
	'exit',
	'waitfor',
	'os',
	'path',
	'fs',
	'math',
	'color',
	'json',
	'http',
	'crypto',
	'proc',
	'worker',
	'async',
	'PYLE_VERSION',
	'PYLE_GIT_HASH',
	'int',
	'float',
	'bool',
	'string',
	'array',
	'map',
	'bytes',
]);

export const pyleLanguage = StreamLanguage.define({
	name: 'pyle',
	startState: () => ({ expect: null }),
	tokenTable: {
		builtin: tags.standard(tags.variableName),
		typeName: tags.typeName,
	},
	token(stream, state) {
		if (stream.eatSpace()) return null;

		if (state.expect && !/[A-Za-z_]/.test(stream.peek() ?? '')) state.expect = null;

		if (stream.peek() === '#') {
			stream.skipToEnd();
			return 'comment';
		}

		if (stream.peek() === '"') {
			stream.next();
			while (!stream.eol()) {
				const ch = stream.next();
				if (ch === '\\') stream.next();
				else if (ch === '"') break;
			}
			return 'string';
		}

		if (stream.match(/^0[xX][0-9a-fA-F]+/)) return 'number';
		if (stream.match(/^\d+\.\d+/)) return 'number';
		if (stream.match(/^\d+/)) return 'number';

		if (stream.match(/^[A-Za-z_][A-Za-z0-9_]*/)) {
			const word = stream.current();

			if (word === 'true' || word === 'false' || word === 'none') return 'atom';
			if (word === 'struct' || word === 'enum') {
				state.expect = 'type';
				return 'keyword';
			}
			if (word === 'fn') {
				state.expect = 'function';
				return 'keyword';
			}
			if (keywords.has(word)) return 'keyword';

			if (state.expect) {
				const kind = state.expect;
				state.expect = null;
				return kind;
			}

			if (builtins.has(word)) return 'builtin';
			if (/^\s*\(/.test(stream.string.slice(stream.pos))) return 'function(variableName)';
			return 'variableName';
		}

		if (stream.match(/^(=>|==|!=|<=|>=|<<=|>>=|\+=|-=|\*=|\/=|&=|\|=|\^=|<<|>>|\.\.|[-+*/%&|^~<>=!?])/))
			return 'operator';

		if (stream.match(/^[(){}\[\],.;:]/)) return 'punctuation';

		stream.next();
		return null;
	},
});

export const pyleHighlightStyle = HighlightStyle.define([
	{ tag: tags.comment, color: '#77727c', fontStyle: 'italic' },
	{ tag: tags.string, color: '#a8d48a' },
	{ tag: tags.number, color: '#ffc46b' },
	{ tag: tags.keyword, color: '#ff8a5c' },
	{ tag: [tags.atom, tags.bool], color: '#ff9a66' },
	{ tag: tags.function(tags.variableName), color: '#ffd9a8' },
	{ tag: tags.typeName, color: '#7cc7ff' },
	{ tag: tags.standard(tags.variableName), color: '#ffd9a8' },
	{ tag: tags.variableName, color: '#e8e1d7' },
	{ tag: tags.operator, color: '#c9c4bb' },
	{ tag: tags.punctuation, color: '#b8b2a8' },
	{ tag: tags.invalid, color: '#ff6b6b' },
]);

export const pyleLanguageSupport = [pyleLanguage, syntaxHighlighting(pyleHighlightStyle)];
