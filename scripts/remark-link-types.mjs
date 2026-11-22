import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const builtins = new Map([
	// Primitive and built-in types
	['int', '/language/types/'],
	['float', '/language/types/'],
	['bool', '/language/types/'],
	['string', '/language/types/'],
	['array', '/language/types/'],
	['map', '/language/types/'],
	['bytes', '/stdlib/bytes/'],
	['bytes_builder', '/stdlib/bytes/'],
	['function', '/language/functions/'],
	['range', '/language/types/'],
	['iterator', '/language/types/'],
	['coro', '/stdlib/futures-coroutines/'],
	['future', '/stdlib/futures-coroutines/'],
	['native_function', '/language/functions/'],
	['native_object', '/embedding/classes/'],
	['any', '/language/type-hints/'],
	['none', '/language/types/'],
	['File', '/stdlib/files/'],
	['Bytes', '/stdlib/bytes/'],
	['BytesBuilder', '/stdlib/bytes/'],
	['Coro', '/stdlib/futures-coroutines/'],
	['Future', '/stdlib/futures-coroutines/'],
	['Date', '/stdlib/os/'],
	['Worker', '/stdlib/os/'],
	['Request', '/stdlib/http/'],
	['ProcResult', '/stdlib/proc/'],
	['Child', '/stdlib/proc/'],
	['Server', '/stdlib/http/'],
	['Client', '/stdlib/http/'],
	['Response', '/stdlib/http/'],
	['Pool', '/stdlib/worker/'],
	['PCallResult', '/language/errors/'],
	['PCallError', '/language/errors/'],
	['TraceFrame', '/language/errors/'],

	// Modules
	['os', '/stdlib/os/'],
	['path', '/stdlib/path/'],
	['fs', '/stdlib/fs/'],
	['math', '/stdlib/math/'],
	['color', '/stdlib/color/'],
	['json', '/stdlib/json/'],
	['http', '/stdlib/http/'],
	['crypto', '/stdlib/crypto/'],
	['proc', '/stdlib/proc/'],
	['worker', '/stdlib/worker/'],

	// Built-in functions
	['print', '/stdlib/builtins/'],
	['printf', '/stdlib/builtins/'],
	['format', '/language/format-strings/'],
	['input', '/stdlib/builtins/'],
	['import', '/language/modules/'],
	['add_import_path', '/language/modules/'],
	['typeof', '/stdlib/builtins/'],
	['tostring', '/stdlib/builtins/'],
	['tonum', '/stdlib/builtins/'],
	['toint', '/stdlib/builtins/'],
	['tofloat', '/stdlib/builtins/'],
	['pcall', '/language/errors/'],
	['assert', '/language/errors/'],
	['raise', '/language/errors/'],
	['print_trace', '/language/errors/'],
	['exit', '/reference/cli/'],
	['waitfor', '/language/async/'],
	['async', '/language/async/'],
	['PYLE_VERSION', '/reference/cli/'],
]);

const userLinksPath = resolve(dirname(fileURLToPath(import.meta.url)), '../src/data/links.json');
const userLinks = existsSync(userLinksPath) ? JSON.parse(readFileSync(userLinksPath, 'utf8')) : {};

const links = new Map([...builtins, ...Object.entries(userLinks)]);

const names = [...links.keys()].sort((a, b) => b.length - a.length);
const pattern = new RegExp(`\\b(${names.map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'g');
const wikiPattern = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

function linkNode(name) {
	return {
		type: 'link',
		url: links.get(name),
		title: null,
		children: [{ type: 'inlineCode', value: name }],
	};
}

function linkInlineCode(node) {
	const value = node.value;

	if (links.has(value)) {
		return [linkNode(value)];
	}

	const parts = [];
	let last = 0;
	let match;
	pattern.lastIndex = 0;
	while ((match = pattern.exec(value)) !== null) {
		if (match.index > last) {
			parts.push({ type: 'inlineCode', value: value.slice(last, match.index) });
		}
		parts.push(linkNode(match[1]));
		last = match.index + match[1].length;
	}
	if (last < value.length) {
		parts.push({ type: 'inlineCode', value: value.slice(last) });
	}

	return parts.length > 0 ? parts : [node];
}

function linkText(node) {
	const value = node.value;
	const parts = [];
	let last = 0;
	let match;
	wikiPattern.lastIndex = 0;
	while ((match = wikiPattern.exec(value)) !== null) {
		if (match.index > last) {
			parts.push({ type: 'text', value: value.slice(last, match.index) });
		}
		const name = match[1].trim();
		const label = (match[2] ?? match[1]).trim();
		if (links.has(name)) {
			parts.push({
				type: 'link',
				url: links.get(name),
				title: null,
				children: [{ type: 'inlineCode', value: label }],
			});
		} else {
			parts.push({ type: 'text', value: match[0] });
		}
		last = match.index + match[0].length;
	}
	if (last < value.length) {
		parts.push({ type: 'text', value: value.slice(last) });
	}
	return parts;
}

export function remarkLinkTypes() {
	return (tree) => {
		const walk = (node) => {
			if (!node || typeof node !== 'object') return;

			if (Array.isArray(node.children)) {
				const next = [];
				for (const child of node.children) {
					if (child && child.type === 'inlineCode') {
						next.push(...linkInlineCode(child));
					} else if (child && child.type === 'text') {
						next.push(...linkText(child));
					} else {
						walk(child);
						next.push(child);
					}
				}
				node.children = next;
			}
		};

		walk(tree);
	};
}
