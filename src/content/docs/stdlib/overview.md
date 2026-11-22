---
title: Standard Library
description: What ships with libpyle, what ships with the CLI, and how modules are loaded.
---

Pyle's standard library is split across two layers. Which functions you can call depends on how the interpreter was built.

## Core modules (`libpyle`)

These are compiled into the embeddable library and are available to every host that registers the core natives:

| Module | Purpose |
| --- | --- |
| [`os`](/stdlib/os/) | Time, environment, paths, process info, sleeping, workers |
| [`path`](/stdlib/path/) | Pure string path manipulation, no syscalls |
| [`fs`](/stdlib/fs/) | Filesystem queries and file operations |
| [`math`](/stdlib/math/) | Constants and numeric functions |
| [`color`](/stdlib/color/) | ANSI terminal color codes |
| [`proc`](/stdlib/proc/) | Spawning processes, pipes, capture (when process support is compiled in) |

## CLI interpreter modules (`pyle`)

These ship with the `pyle` binary and are not part of `libpyle`:

| Module | Purpose |
| --- | --- |
| [`json`](/stdlib/json/) | Parse and serialize JSON |
| [`http`](/stdlib/http/) | HTTP client and server |
| [`crypto`](/stdlib/crypto/) | Hashing, HMAC, Base64, PBKDF2, random bytes |
| [`worker`](/stdlib/worker/) | Multi-process worker pool written in Pyle |

## Built-in types

Methods on strings, arrays, maps, bytes, files, futures, and coroutines are always available because they are part of the VM:

- [Strings, Arrays & Maps](/stdlib/strings-arrays-maps/)
- [Bytes & BytesBuilder](/stdlib/bytes/)
- [Files](/stdlib/files/)
- [Futures & Coroutines](/stdlib/futures-coroutines/)

## Importing

Native modules are loaded with `import`:

```pyle
let os = import("os")
let math = import("math")
let json = import("json")

printf("sqrt(144) = {}", math.sqrt(144))
```

An unregistered module fails with `NameError`. On the CLI, `import("worker")` resolves `std/worker.pyl` because the interpreter adds its bundled `std/` directory to the import path.

Scripts are imported the same way:

```pyle
let helpers = import("lib/helpers")
```

See [Modules & Imports](/language/modules/) for search paths, caching, and module globals.

## Global built-ins

`print`, `printf`, `format`, `typeof`, `pcall`, `import`, and the rest are documented in [Built-in Functions](/stdlib/builtins/).

## What is not included

The following are not part of the core library and are unavailable in a library-only build:

- `json`, `http`, `crypto`
- The `worker` Pyle module (it depends on `json`)
- The language server
- The raylib module

The [playground](/playground/) is a `libpyle` build, so it includes the core modules and excludes the CLI-only modules.
