---
title: Embedding Overview
description: What libpyle is, how to execute scripts, and how to register only the modules you need.
---

`libpyle` is the embeddable half of Pyle: lexer, parser, compiler, bytecode VM, garbage collector, and the core natives. It has no runtime dependencies beyond fmt and unordered_dense, both header-only. The `pyle` interpreter is a consumer of `libpyle`, not the other way around.

An embedder links `libpyle`, creates a `pyle::Pyle`, registers the modules it wants, and hands the VM source code or calls into functions from C++.

## Minimal embedding

```cpp
#include <pyle/pyle.hpp>
#include <pyle/std/std_core.hpp>

int main() {
    pyle::Pyle interpreter;
    pyle::register_core_natives(interpreter.vm);

    bool ok = interpreter.execute(R"(
        fn add(a, b) {
            return a + b
        }
        print(add(3, 4))
    )", false, "main.pyl");

    return ok ? 0 : 1;
}
```

`execute` takes the source, a disassembly flag, and a virtual script name used in error messages. It returns `false` when lexing, parsing, or compilation fails.

A runtime panic does not make `execute` return `false`. It prints an error report and sets `vm.is_panicked()`. Check both when you need to distinguish a clean run from a panic:

```cpp
bool compiled = interpreter.execute(source, false, "main.pyl");
bool ok = compiled && !interpreter.vm.is_panicked();
```

`execute` returns `true` after a script that panics, so `is_panicked()` is the authoritative failure signal for runtime errors.

## Selecting core modules

`register_core_natives(vm)` registers the global built-ins and the core modules. Pass `false` to register only the built-ins:

```cpp
pyle::register_core_natives(interpreter.vm, false);  // built-ins only
pyle::register_math_module(interpreter.vm);          // a la carte
```

The individual registration functions are:

| Function | Registers |
| --- | --- |
| `register_os_module(vm)` | `os` |
| `register_path_module(vm)` | `path` |
| `register_fs_module(vm)` | `fs` |
| `register_color_module(vm)` | `color` |
| `register_math_module(vm)` | `math` |
| `register_proc_module(vm)` | `proc`, only when process support is compiled in |
| `register_core_modules(vm)` | all of the above that are available |

The `json`, `http`, and `crypto` modules live in the CLI interpreter target, not in `libpyle`. An embedder that wants them copies the module sources into its build, brings the required libraries (simdjson, cpp-httplib, mbedtls), and registers them with `register_module`.

## The Pyle object

`pyle::Pyle` is a thin wrapper around `pyle::VM`. The VM owns the heap, the value stack, the call frames, the interned strings, and the module registry. One `Pyle` instance is one interpreter; scripts and bound classes share its globals.

```cpp
pyle::Pyle interpreter;
pyle::VM& vm = interpreter.vm;
```

The VM is not thread-safe by default. Use `vm.get_mutex()` around native callbacks that may run on another thread, and see [Async & Threading](/embedding/async/).

## Build integration

With xmake:

```lua
includes("path/to/pyle/libpyle")

target("my_app")
    set_kind("binary")
    add_files("main.cpp")
    add_deps("libpyle")
```

With CMake:

```cmake
add_subdirectory(third_party/pyle/libpyle)
add_executable(my_app main.cpp)
target_link_libraries(my_app PRIVATE libpyle)
```

The CMake project uses `find_package(fmt)` when available and otherwise fetches fmt and unordered_dense with `FetchContent`. `BUILD_SHARED_LIBS=ON` produces a shared library.

## WebAssembly notes

On `wasm32`, process support, threads, and `.pyled` modules are unavailable. Async helpers such as `os.sleep_async` and the async `File` methods resolve synchronously. `libpyle` itself contains no Emscripten APIs, so the host supplies the JavaScript glue.

The [playground](/playground/) on this site is an example of that glue: a small Embind wrapper around `pyle::Pyle` that exposes a `run` function and captures stdout and stderr.

## Where to go next

- [Free Functions](/embedding/functions/) for `bind_function` and raw native functions.
- [Classes](/embedding/classes/) for `ClassBinder` and `SharedClassBinder`.
- [Native Modules](/embedding/modules/) for `NativeModule` and `register_module`.
- [Values & Conversions](/embedding/values/) for `from_value`, `to_value`, ownership, and GC roots.
- [Calling into Pyle](/embedding/calling/) for `call_func` and `pcall_invoke`.
- [Async & Threading](/embedding/async/) for native functions that resolve futures.
