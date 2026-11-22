---
title: Install & Build
description: Build the Pyle interpreter, the embeddable library, or a WebAssembly build.
---

Pyle uses [xmake](https://xmake.io) as its primary build system. The repository also ships a standalone CMake project for `libpyle`, which is the path to use when your host application already uses CMake or when you are targeting WebAssembly.

## Requirements

- A C++17 compiler: clang, GCC, or MSVC.
- [xmake](https://xmake.io) for the default build.
- [CMake](https://cmake.org) 3.20 or newer if you are building `libpyle` on its own.
- [Emscripten](https://emscripten.org) if you are targeting `wasm32`.

The CLI interpreter target fetches its own dependencies through xmake: argparse, simdjson, cpp-httplib, and mbedtls. A library-only build resolves only fmt and unordered_dense, both header-only.

## Build everything

```sh
xmake f -m release
xmake
```

This builds the interpreter, the language server, the raylib module, the test suite, and the C++ embedding examples. Artifacts land under `build/<platform>/<arch>/<mode>/`.

## Build only the interpreter

```sh
xmake f -m release --with_lsp=n --with_raylib=n --with_tests=n --with_examples=n
xmake build pyle
```

Run a script with the built binary:

```sh
./build/mingw/x86_64/release/pyle.exe script.pyl
```

The exact directory depends on your platform and toolchain.

## Build only the library

```sh
xmake f -m release --with_cli=n --with_lsp=n --with_raylib=n --with_tests=n --with_examples=n
xmake build libpyle
```

Every component sits behind a `--with_*` option and is enabled by default: `--with_cli`, `--with_lsp`, `--with_raylib`, `--with_tests`, and `--with_examples`. A disabled component creates no target and resolves none of its packages.

## Build with CMake

`libpyle/CMakeLists.txt` is a standalone CMake project. Point `add_subdirectory` at the library and link the target:

```cmake
add_subdirectory(third_party/pyle/libpyle)
add_executable(my_app main.cpp)
target_link_libraries(my_app PRIVATE libpyle)
```

The CMake project uses `find_package(fmt)` when a suitable version is available and otherwise fetches fmt and unordered_dense with `FetchContent`. `BUILD_SHARED_LIBS=ON` produces a shared library, and `PYLE_PROFILE_OPS=ON` enables the per-opcode profiling build.

## Build for WebAssembly

The library builds for `wasm32` with Emscripten. There are no Emscripten APIs in `libpyle`; platform differences are selected in `libpyle/include/pyle/config.hpp`.

```sh
xmake f -p wasm -m release --emsdk=/path/to/emsdk
xmake build libpyle
```

The `wasm` platform forces the interpreter, language server, raylib, and tests off. Process support, threads, and `.pyled` modules are unavailable on this target. Async helpers such as `os.sleep_async` and the async `File` methods resolve inline.

The test suite also runs under Node:

```sh
xmake build -y pyle_tests
node build/wasm/wasm32/release/pyle_tests.js
```

The desktop suite reports 97 tests; the wasm build excludes `tests/test_proc.cpp`, so it reports 87.

### CMake for WebAssembly

Use the Emscripten toolchain file:

```sh
emcmake cmake -S libpyle -B build-wasm -DCMAKE_BUILD_TYPE=Release
emmake cmake --build build-wasm --parallel
```

The CMake project automatically excludes `std_proc.cpp` and `std_process.cpp` and adds `-fwasm-exceptions` on this platform.

## Editor support

The VS Code extension lives in `editors/vscode`. It provides syntax highlighting, hover, completion, go to definition, and signature help through `pyle-lsp`.

After building, run `npm install` in that folder and launch it with F5. Then open the command palette and run **Pyle: Select Interpreter Path** to point the extension at your `pyle` binary. The extension looks for a `std` folder next to the interpreter for the declaration files.

## Platform support

| Platform | Status |
| --- | --- |
| Windows x86_64 (MSVC 2022, mingw clang64) | Tested |
| Linux x86_64 (Ubuntu 26.04, GCC, WSL) | Tested |
| macOS (arm64/x86_64) | Not tested |
| Web/WASM (wasm32, Emscripten) | Tested (`proc`, workers, and `.pyled` unavailable) |

## Next steps

- [Run your first script](/getting-started/quick-start/).
- [Embed libpyle in C++](/embedding/).
