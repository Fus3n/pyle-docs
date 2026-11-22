let modulePromise = null;
let currentRun = null;
let inputResolver = null;

function emit(stream, text) {
	if (currentRun == null) return;
	self.postMessage({ type: stream, id: currentRun, text });
}

self.pyleRequestInput = (prompt) =>
	new Promise((resolve) => {
		inputResolver = resolve;
		self.postMessage({ type: 'input-request', prompt });
	});

async function getModule() {
	if (!modulePromise) {
		modulePromise = (async () => {
			const imported = await import('./pyle_wasm.js');
			return imported.default({
				print: (line) => emit('stdout', line),
				printErr: (line) => emit('stderr', line),
				locateFile: (path) => new URL(path, self.location.href).href,
			});
		})();
	}

	try {
		return await modulePromise;
	} catch (error) {
		modulePromise = null;
		throw error;
	}
}

self.onmessage = async (event) => {
	const data = event.data;

	if (data.type === 'init') {
		try {
			const module = await getModule();
			self.postMessage({ type: 'ready', version: module.version() });
		} catch (error) {
			self.postMessage({ type: 'init-error', message: String(error?.message ?? error) });
		}
		return;
	}

	if (data.type === 'input-response') {
		const resolve = inputResolver;
		inputResolver = null;
		if (resolve) resolve(data.line);
		return;
	}

	if (data.type !== 'run') return;

	if (currentRun != null) {
		self.postMessage({ type: 'busy', id: data.id });
		return;
	}

	currentRun = data.id;

	try {
		const module = await getModule();
		const result = module.run(data.code);
		const ok = result instanceof Promise ? await result : result;
		self.postMessage({ type: 'done', id: data.id, ok });
	} catch (error) {
		self.postMessage({
			type: 'worker-error',
			id: data.id,
			message: String(error?.stack ?? error?.message ?? error),
		});
	} finally {
		currentRun = null;
	}
};
