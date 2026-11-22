import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)), '../dist');
const port = Number(process.env.PREVIEW_PORT ?? 4321);

const rawBase = process.env.BASE_PATH?.trim() || '/';
const base = rawBase === '/' ? '/' : `/${rawBase.replace(/^\/+|\/+$/g, '')}/`;

const mime = {
	'.html': 'text/html; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.mjs': 'text/javascript; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.map': 'application/json; charset=utf-8',
	'.md': 'text/markdown; charset=utf-8',
	'.xml': 'application/xml; charset=utf-8',
	'.txt': 'text/plain; charset=utf-8',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.gif': 'image/gif',
	'.webp': 'image/webp',
	'.avif': 'image/avif',
	'.svg': 'image/svg+xml',
	'.ico': 'image/x-icon',
	'.woff': 'font/woff',
	'.woff2': 'font/woff2',
	'.ttf': 'font/ttf',
	'.wasm': 'application/wasm',
	'.webmanifest': 'application/manifest+json',
};

function cacheControl(pathname) {
	if (pathname.startsWith('/_astro/')) {
		return 'public, max-age=31536000, immutable';
	}
	if (
		pathname.endsWith('worker.js') ||
		pathname.endsWith('pyle_wasm.js') ||
		pathname.endsWith('.wasm')
	) {
		return 'no-cache';
	}
	if (pathname.endsWith('.html') || pathname === '/' || pathname.endsWith('/')) {
		return 'no-cache';
	}
	return 'public, max-age=3600';
}

function resolveFile(pathname) {
	const candidates = [pathname];
	if (base !== '/' && pathname.startsWith(base)) {
		candidates.push(pathname.slice(base.length - 1));
	}

	for (const candidate of candidates) {
		const clean = normalize(candidate).replace(/^(\.\.[/\\])+/, '');
		const file = join(root, clean);
		if (!file.startsWith(root + sep) && file !== root) continue;
		if (existsSync(file) && statSync(file).isFile()) return file;
	}
	return null;
}

const server = createServer((req, res) => {
	try {
		const url = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`);
		let pathname = decodeURIComponent(url.pathname);

		let file = resolveFile(pathname);
		if (!file) {
			// Try the directory index before giving up.
			const directory = join(root, normalize(pathname).replace(/^(\.\.[/\\])+/, ''));
			const index = join(directory, 'index.html');
			if (existsSync(index) && statSync(index).isFile()) file = index;
		}

		if (!file) {
			res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
			res.end('Not found');
			return;
		}

		const ext = extname(file).toLowerCase();
		res.writeHead(200, {
			'Content-Type': mime[ext] ?? 'application/octet-stream',
			'Cache-Control': cacheControl(pathname),
		});
		createReadStream(file).pipe(res);
	} catch {
		res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
		res.end('Server error');
	}
});

server.listen(port, () => {
	console.log(`Preview server running at http://localhost:${port}`);
});
