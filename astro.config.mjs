// @ts-check
import { readFileSync } from 'node:fs';
import { unified } from '@astrojs/markdown-remark';
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { remarkLinkTypes } from './scripts/remark-link-types.mjs';
import { remarkPyleVersion } from './scripts/remark-pyle-version.mjs';

const readJson = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));

const pyleGrammar = readJson('./src/shiki/pyle.tmLanguage.json');
const pyleDark = readJson('./src/shiki/pyle-dark.json');
const pyleLight = readJson('./src/shiki/pyle-light.json');

const rawBase = process.env.BASE_PATH?.trim() || '/';
const base = rawBase === '/' ? '/' : `/${rawBase.replace(/^\/+|\/+$/g, '')}/`;
const site = process.env.SITE_URL ?? 'https://fus3n.github.io';

function rehypeBaseLinks(basePath) {
	return (tree) => {
		const walk = (node) => {
			if (!node || typeof node !== 'object') return;

			if (node.type === 'element' && node.properties) {
				for (const attribute of ['href', 'src']) {
					const value = node.properties[attribute];
					if (
						typeof value === 'string' &&
						value.startsWith('/') &&
						!value.startsWith('//') &&
						basePath !== '/'
					) {
						node.properties[attribute] = `${basePath}${value.slice(1)}`;
					}
				}
			}

			if (Array.isArray(node.children)) {
				for (const child of node.children) walk(child);
			}
		};

		walk(tree);
	};
}

// https://astro.build/config
export default defineConfig({
	site,
	base,
	devToolbar: {
		enabled: false,
	},
	vite: {
		client: {
			overlay: false,
		},
	},
	markdown: {
		processor: unified({
			remarkPlugins: [remarkLinkTypes, remarkPyleVersion],
			rehypePlugins: [[rehypeBaseLinks, base]],
		}),
		shikiConfig: {
			themes: { light: pyleLight, dark: pyleDark },
			langs: [pyleGrammar],
		},
	},
	integrations: [
		starlight({
			title: 'Pyle',
			description:
				'An embeddable dynamic scripting language for C++17 with a familiar syntax, a bytecode VM, and a WASM-ready core.',
			logo: {
				src: './src/assets/pyle-logo.svg',
				alt: 'Pyle',
				replacesTitle: true,
			},
			favicon: '/pyle-logo.svg',
			head: [
				{
					tag: 'script',
					attrs: { type: 'module' },
					content:
						'document.querySelectorAll(\'.header a[href^="http"]\').forEach((a) => { a.target = "_blank"; a.rel = "noopener noreferrer"; });',
				},
			],
			customCss: ['./src/styles/theme.css'],
			components: {
				Head: './src/components/Head.astro',
			},
			expressiveCode: {
				themes: [pyleDark, pyleLight],
				shiki: { langs: [pyleGrammar] },
				styleOverrides: {
					borderRadius: '0.875rem',
					codeFontFamily: 'var(--pyle-font-mono)',
					uiFontFamily: 'var(--pyle-font-body)',
				},
			},
			social: [
				{
					icon: 'rocket',
					label: 'Playground',
					href: `${base}playground/`,
				},
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/Fus3n/pyle',
				},
			],
			editLink: {
				baseUrl: 'https://github.com/Fus3n/pyle_docs/edit/main/',
			},
			lastUpdated: true,
			sidebar: [
				{
					label: 'Getting Started',
					items: [
						{ label: 'Introduction', slug: 'getting-started/introduction' },
						{ label: 'Install & Build', slug: 'getting-started/installation' },
						{ label: 'Quick Start', slug: 'getting-started/quick-start' },
					],
				},
				{
					label: 'Embedding',
					items: [
						{ label: 'Overview', slug: 'embedding' },
						{ label: 'Free Functions', slug: 'embedding/functions' },
						{ label: 'Classes', slug: 'embedding/classes' },
						{ label: 'Native Modules', slug: 'embedding/modules' },
						{ label: 'Values & Conversions', slug: 'embedding/values' },
						{ label: 'Calling into Pyle', slug: 'embedding/calling' },
						{ label: 'Async & Threading', slug: 'embedding/async' },
					],
				},
				{
					label: 'Language',
					items: [
						{ label: 'Syntax & Variables', slug: 'language/syntax' },
						{ label: 'Types & Values', slug: 'language/types' },
						{ label: 'Operators', slug: 'language/operators' },
						{ label: 'Control Flow', slug: 'language/control-flow' },
						{ label: 'Functions & Closures', slug: 'language/functions' },
						{ label: 'Structs', slug: 'language/structs' },
						{ label: 'Enums', slug: 'language/enums' },
						{ label: 'Modules & Imports', slug: 'language/modules' },
						{ label: 'Coroutines & Async', slug: 'language/async' },
						{ label: 'Error Handling', slug: 'language/errors' },
						{ label: 'Format Strings', slug: 'language/format-strings' },
						{ label: 'Type Hints', slug: 'language/type-hints' },
						{ label: 'Memory & GC', slug: 'language/memory' },
					],
				},
				{
					label: 'Standard Library',
					items: [
						{ label: 'Overview', slug: 'stdlib/overview' },
						{ label: 'Built-in Functions', slug: 'stdlib/builtins' },
						{ label: 'os', slug: 'stdlib/os' },
						{ label: 'path', slug: 'stdlib/path' },
						{ label: 'fs', slug: 'stdlib/fs' },
						{ label: 'math', slug: 'stdlib/math' },
						{ label: 'color', slug: 'stdlib/color' },
						{ label: 'json', slug: 'stdlib/json' },
						{ label: 'http', slug: 'stdlib/http' },
						{ label: 'crypto', slug: 'stdlib/crypto' },
						{ label: 'proc', slug: 'stdlib/proc' },
						{ label: 'worker', slug: 'stdlib/worker' },
						{ label: 'Strings, Arrays & Maps', slug: 'stdlib/strings-arrays-maps' },
						{ label: 'Bytes & BytesBuilder', slug: 'stdlib/bytes' },
						{ label: 'Files', slug: 'stdlib/files' },
						{ label: 'Futures & Coroutines', slug: 'stdlib/futures-coroutines' },
					],
				},
				{
					label: 'Reference',
					items: [
						{ label: 'CLI', slug: 'reference/cli' },
						{ label: 'Bytecode & VM', slug: 'reference/bytecode' },
						{ label: 'Limitations', slug: 'reference/limitations' },
						{ label: 'Playground', slug: 'reference/playground' },
						{ label: 'For AI Assistants', slug: 'reference/for-llms' },
					],
				},
				{
					label: 'Try it',
					items: [
						{
							label: 'Open the playground',
							link: '/playground/',
							badge: { text: 'WASM', variant: 'tip' },
						},
					],
				},
			],
		}),
	],
});
