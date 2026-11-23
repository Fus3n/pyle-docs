import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CACHE_FILE = join(ROOT, '.cache', 'pyle-release.json');
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const REPO = 'Fus3n/pyle';
const API = `https://api.github.com/repos/${REPO}`;

const headers = {
	Accept: 'application/vnd.github+json',
	'User-Agent': 'pyle-docs',
};

const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
if (token) headers.Authorization = `Bearer ${token}`;

const readCache = async () => {
	try {
		return JSON.parse(await readFile(CACHE_FILE, 'utf8'));
	} catch {
		return null;
	}
};

const writeCache = async (release) => {
	try {
		await mkdir(join(ROOT, '.cache'), { recursive: true });
		await writeFile(CACHE_FILE, JSON.stringify({ ...release, fetchedAt: Date.now() }, null, 2));
	} catch {}
};

const semver = (tag) => tag.replace(/^v/, '').split('.').map(Number);

const newest = (tags) =>
	tags
		.filter((tag) => /^v?\d+\.\d+\.\d+$/.test(tag))
		.sort((a, b) => {
			const [x, y] = [semver(a), semver(b)];
			for (let i = 0; i < 3; i++) if ((x[i] || 0) !== (y[i] || 0)) return (y[i] || 0) - (x[i] || 0);
			return 0;
		})[0];

const fetchRelease = async () => {
	try {
		const res = await fetch(`${API}/releases/latest`, {
			headers,
			signal: AbortSignal.timeout(8000),
		});
		if (res.ok) {
			const release = await res.json();
			if (release.tag_name) return { tag: release.tag_name, url: release.html_url };
		}
	} catch {}

	const res = await fetch(`${API}/tags?per_page=100`, {
		headers,
		signal: AbortSignal.timeout(8000),
	});
	if (!res.ok) throw new Error(`GitHub API responded ${res.status}`);

	const tag = newest((await res.json()).map((entry) => entry.name));
	if (!tag) throw new Error('no version tags found');

	return { tag, url: `https://github.com/${REPO}/releases/tag/${tag}` };
};

const localVersion = async () => {
	try {
		const config = await readFile(
			join(ROOT, 'vendor/pyle/libpyle/include/pyle/config.hpp'),
			'utf8'
		);
		return config.match(/#define\s+PYLE_VERSION\s+"([^"]+)"/)?.[1] ?? null;
	} catch {
		return null;
	}
};

const resolveRelease = async () => {
	const cached = await readCache();
	if (cached?.tag && Date.now() - cached.fetchedAt < CACHE_TTL_MS) return cached;

	try {
		const release = await fetchRelease();
		await writeCache(release);
		return release;
	} catch (error) {
		if (cached?.tag) {
			console.warn(`[pyle-release] GitHub unavailable (${error.message}); using cached ${cached.tag}`);
			return cached;
		}

		const version = await localVersion();
		console.warn(
			`[pyle-release] GitHub unavailable (${error.message}); using local ${version ?? 'unknown'}`
		);
		return {
			tag: version ? `v${version}` : 'unknown',
			url: `https://github.com/${REPO}/releases`,
		};
	}
};

let pending;

/** Latest Pyle release tag, cached on disk for six hours. */
export function getLatestRelease() {
	pending ??= resolveRelease();
	return pending;
}
