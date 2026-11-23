---
title: Introduction
description: What Pyle is, how it is structured, and what makes it different.
---

Pyle is a small, embeddable dynamic scripting language for C++17 and newer. It is designed to sit inside a host application and drive gameplay logic, tooling, configuration, and small scripts without pulling in a heavyweight runtime.

The language has a C-like syntax shaped by JavaScript, with runtime behavior borrowed from Lua. It compiles to bytecode and runs on a stack-based virtual machine with automatic garbage collection. Functions are first-class and close over their environment. Structs have a fixed shape. Coroutines are cooperative and can be driven manually or through `async.run`.

```pyle
struct Stack(items) {
    fn push(v) => self.items.append(v)
    fn pop() => self.items.pop()
}

let s = Stack(items: [])
s.push(1)
s.push(2)
printf("{} then {}", s.pop(), s.pop())   # 2 then 1
```

## Two layers

Pyle ships as two separate layers, and it matters which one you are using.

| Layer | What it is | What it contains |
| --- | --- | --- |
| **libpyle** | The embeddable core | Lexer, parser, compiler, bytecode VM, garbage collector, core natives, and the `os`, `path`, `fs`, `color`, `math`, and `proc` modules. Builds for `wasm32`. |
| **pyle** | The CLI interpreter binary and bundled modules | The `pyle` CLI plus `json`, `http`, `crypto`, `worker`, `raylib`, the standard declaration files, and the language server. |

The core is what you link into a C++ application. The CLI is a consumer of the core, not the other way around. An embedder that links only `libpyle` does not get `json`, `http`, or `crypto` unless it copies their module sources and brings their external libraries.

This split keeps the embedding surface small: the heavy dependencies used by the CLI (simdjson, cpp-httplib, mbedtls, argparse) never enter a library-only build.

## Design goals

- **Small and embeddable.** The library is the whole language. There is no required host framework and no global runtime to initialize.
- **Familiar syntax.** If you have written JavaScript, Lua, or Python, Pyle should feel readable immediately.
- **Native when it matters.** Bind C++ functions, classes, methods, and constructors without a serialization layer.
- **Portable.** `libpyle` builds for desktop platforms and for `wasm32` through Emscripten, with no Emscripten APIs in the library.

## What Pyle is not

Pyle is not a statically typed language, and type hints are never enforced at runtime. It does not have exceptions in the C++ sense; errors are values that can be caught with `pcall`, and an uncaught error halts the script. It does not have threads or shared-memory parallelism; coroutines are cooperative and single-threaded. It is also pre-1.0, so syntax and features can change between releases.

## Status

The current release is **{{pyle.version}}**. Pyle is pre-1.0, so syntax and behavior can change between releases. The desktop test suite covers the language, standard library, and embedding APIs; the same suite runs under Node for the `wasm32` build with process tests excluded.

## Next steps

- [Install and build Pyle](/getting-started/installation/) for your platform.
- [Follow the quick start](/getting-started/quick-start/) to run your first script.
- [Embed Pyle in a C++ application](/embedding/).
- [Try the playground](/playground/) to run the real language in your browser.
