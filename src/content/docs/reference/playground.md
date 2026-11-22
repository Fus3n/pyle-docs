---
title: Playground
description: How the browser playground works and what it includes.
---

The [playground](/playground/) runs the real Pyle interpreter in your browser. It is `libpyle` compiled to WebAssembly with Emscripten, not a JavaScript reimplementation.

## What is included

The build links `libpyle` and registers the core modules:

- `os`
- `path`
- `fs`
- `math`
- `color`

The global built-ins are available: `print`, `printf`, `format`, `typeof`, `pcall`, `Bytes`, `BytesBuilder`, `Coro`, `Future`, `input`, and the rest.

`input()` reads a line from the page. When a script calls it, the worker suspends, an input bar appears under the toolbar, and the script resumes after you send a line. The 8-second run timer is paused while the bar is open.

## What is not included

The CLI-only modules are absent:

- `json`
- `http`
- `crypto`
- `worker`
- `proc` (process support is compiled out on `wasm32`)

`import("json")` in the playground fails with `NameError`. The same applies to the other interpreter modules.

## How a run works

1. The page starts a Web Worker.
2. The worker loads `pyle_wasm.js` and the `.wasm` binary.
3. The worker calls an Embind wrapper around `pyle::Pyle`.
4. The wrapper creates a fresh interpreter, registers the core natives, compiles the source, and runs it.
5. `std::cout` and `stderr` are routed to `Module.print` and `Module.printErr`, which the worker forwards to the page.
6. `input()` is bound to a host callback. The build is linked with Asyncify, so the WASM stack suspends while the page collects a line and resumes when it arrives.

Every run starts from a clean VM. Globals, files, and other state do not persist between runs.

## Controls

| Control | Behavior |
| --- | --- |
| **Run** | Compile and execute the current script |
| **Ctrl+Enter** | Run from the editor |
| **Stop** | Terminate the worker and start a fresh one |
| **Reset** | Restore the default example |
| **Example menu** | Load a bundled example |
| **Clear** | Clear the output panel |

Your code is saved to `localStorage` as you type, so a reload does not lose it.

## Timeouts and errors

Scripts are terminated after 8 seconds. This is a hard limit enforced by the page, not by the language. An infinite loop cannot freeze the tab because execution happens in a worker. The timer is paused while the page is waiting for `input()` and resumes when a line is sent.

Browser-specific `os` behavior (no shell, in-memory filesystem, Emscripten environment) is covered in [os](/stdlib/os/#platform-notes).

Runtime errors are printed with the usual Pyle error format. The playground highlights the reported line in the editor when it can parse the location from the message.

Compiler errors are reported before execution starts and include the source location.

## Building the WASM artifacts

The artifacts are built from the `vendor/pyle` submodule with Emscripten and CMake:

```sh
npm run wasm
```

This produces `public/playground/pyle_wasm.js` and `public/playground/pyle_wasm.wasm`. The build script auto-detects an emsdk installation and sets `EMSDK`, `EM_CONFIG`, and `PATH`. Set `EMSDK` explicitly if yours lives somewhere unusual.

The artifacts are generated files and are not committed. A fresh clone needs either a WASM build or the prebuilt files from CI.

## Host glue

The glue lives in this repository:

- `wasm/glue.cpp` exposes `run(source)` and `version()` through Embind and binds the host `input` callback.
- `wasm/async_input.js` implements the async `input` import that Asyncify suspends on.
- `wasm/CMakeLists.txt` builds the library and links the glue.
- `public/playground/worker.js` loads the module and forwards output and input requests.
- `src/pages/playground.astro` owns the editor, output panel, input bar, and worker lifecycle.

`libpyle` itself contains no Emscripten APIs, so the host supplies the JavaScript and the Embind boundary.

## Why the interpreter is fresh per run

Pyle's VM is not designed to be reset in place. Creating a new `pyle::Pyle` per run is simpler and avoids state leaking between scripts. It also makes the Stop button safe: terminating the worker discards the entire VM.

## Related

- [Embedding in C++](/embedding/) for the native side of the same API.
- [Install & Build](/getting-started/installation/) for the WASM build steps.
- [Limitations](/reference/limitations/) for the full list of unavailable features.
