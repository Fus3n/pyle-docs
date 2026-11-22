mergeInto(LibraryManager.library, {
	// Called from the embedding glue when a script invokes input().
	// Marks the import as async so Asyncify suspends the WASM stack until
	// the host delivers a line. The line is written to a heap buffer owned
	// by the caller; the heap is not rolled back across an unwind.
	pyle_input__async: 'auto',
	pyle_input: async (promptPtr, promptLen, outPtr, cap) => {
		const prompt = UTF8ToString(promptPtr, promptLen);
		const line = await self.pyleRequestInput(prompt);
		const encoded = new TextEncoder().encode(line);
		const length = Math.min(encoded.length, cap - 1);
		HEAPU8.set(encoded.subarray(0, length), outPtr);
		HEAPU8[outPtr + length] = 0;
		return length;
	},
});
