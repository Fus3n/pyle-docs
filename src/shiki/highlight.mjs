import { createHighlighter } from 'shiki';
import pyleGrammar from './pyle.tmLanguage.json';
import pyleDark from './pyle-dark.json';

let highlighterPromise;

async function getHighlighter() {
	highlighterPromise ??= createHighlighter({
		langs: [pyleGrammar, 'cpp'],
		themes: [pyleDark],
	});

	return highlighterPromise;
}

export async function highlight(code, lang = 'pyle') {
	const highlighter = await getHighlighter();
	return highlighter.codeToHtml(code, {
		lang,
		theme: pyleDark.name,
	});
}
