import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const buildDir = join(root, 'wasm', 'build');
const outputDir = join(root, 'public', 'playground');
const isWindows = process.platform === 'win32';

function findEmsdk() {
	if (process.env.EMSDK) return process.env.EMSDK;

	const home = homedir();
	const localAppData = process.env.LOCALAPPDATA ?? '';
	const candidates = [
		join(root, '.emsdk'),
		join(home, 'emsdk'),
		join(home, 'tools', 'emsdk'),
		join(localAppData, 'emsdk'),
		'/opt/emsdk',
		'/usr/local/emsdk',
	];

	for (const candidate of candidates) {
		if (existsSync(join(candidate, 'upstream', 'emscripten'))) return candidate;
	}

	return null;
}

const emsdk = findEmsdk();
const env = { ...process.env };

if (emsdk) {
	env.EMSDK = emsdk;
	const config = join(emsdk, '.emscripten');
	if (existsSync(config)) env.EM_CONFIG = config;
	const pathKey = Object.keys(env).find((key) => key.toUpperCase() === 'PATH') ?? 'PATH';
	const separator = isWindows ? ';' : ':';
	env[pathKey] = `${join(emsdk, 'upstream', 'emscripten')}${separator}${env[pathKey] ?? ''}`;
	env.PATH = env[pathKey];
	console.log(`Using emsdk at ${emsdk}`);
} else {
	const probe = spawnSync(isWindows ? 'where' : 'which', ['emcmake'], {
		encoding: 'utf8',
		shell: isWindows,
	});
	if (probe.status !== 0) {
		console.error('emscripten not found. Install emsdk, then set EMSDK or activate emsdk so emcmake is on PATH.');
		console.error('See https://emscripten.org/docs/getting_started/downloads.html');
		process.exit(1);
	}
	console.log('EMSDK not set; using emcmake/emmake from PATH.');
}

function run(command, args) {
	console.log(`> ${command} ${args.join(' ')}`);
	const result = spawnSync(command, args, {
		cwd: root,
		env,
		stdio: 'inherit',
		shell: isWindows,
	});
	if (result.error) {
		console.error(result.error.message);
		process.exit(1);
	}
	if (result.status !== 0) process.exit(result.status ?? 1);
}

const sourceDir = resolve(process.env.PYLE_SOURCE_DIR ?? join(root, 'vendor', 'pyle'));

if (!existsSync(join(sourceDir, 'libpyle', 'CMakeLists.txt'))) {
	console.error(`libpyle not found at ${sourceDir}`);
	console.error('Run: git submodule update --init --depth 1');
	process.exit(1);
}

run('emcmake', [
	'cmake',
	'-S', 'wasm',
	'-B', buildDir,
	'-DCMAKE_BUILD_TYPE=Release',
	`-DPYLE_SOURCE_DIR=${sourceDir.replaceAll('\\', '/')}`,
	'-DPYLE_WASM_ENV=web,worker',
]);

run('emmake', ['cmake', '--build', buildDir, '--parallel']);

mkdirSync(outputDir, { recursive: true });

for (const file of ['pyle_wasm.js', 'pyle_wasm.wasm']) {
	const from = join(buildDir, file);
	const to = join(outputDir, file);
	copyFileSync(from, to);
	const kb = Math.round(statSync(to).size / 1024);
	console.log(`Copied ${file} (${kb} KB)`);
}
