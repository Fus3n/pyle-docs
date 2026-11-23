import { getLatestRelease } from './pyle-release.mjs';

const TOKEN = /\{\{\s*pyle\.version\s*\}\}/g;

/** Replace `{{pyle.version}}` in prose and inline code with the latest release. */
export function remarkPyleVersion() {
	return async (tree) => {
		const { tag } = await getLatestRelease();
		const version = tag.replace(/^v/, '');

		const walk = (node) => {
			if (!node || typeof node !== 'object') return;

			const types = ['text', 'inlineCode', 'code'];
			if (types.includes(node.type) && node.value.includes('{{')) {
				node.value = node.value.replace(TOKEN, version);
			}

			if (Array.isArray(node.children)) {
				for (const child of node.children) walk(child);
			}
		};

		walk(tree);
	};
}
