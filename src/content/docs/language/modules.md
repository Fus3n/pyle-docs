---
title: Modules & Imports
description: Native modules, script imports, search paths, caching, and module globals.
---

Using the `import` function, you can load a native module or another Pyle script and get back a module map.

## Native modules

```pyle
let os = import("os")
let math = import("math")
let json = import("json")

print(os.platform())
printf("sqrt(144) = {}", math.sqrt(144))
```

Native modules registered with the VM are found before the filesystem is searched. Which modules are available depends on the build:

| Layer | Modules |
| --- | --- |
| Core (`libpyle`) | `os`, `path`, `fs`, `color`, `math`, `proc` (when process support is compiled in) |
| CLI interpreter (`pyle`) | `json`, `http`, `crypto`, `worker` |
| External | `raylib` (requires a separate build) |

A library-only embedder does not get `json`, `http`, or `crypto` unless it registers them.

## Script imports

```pyle
let helpers = import("lib/helpers")
let config = import("config.pyl")
```

The `.pyl` extension is optional. Full and relative paths are accepted.

```pyle
let cfg = import("examples/raylib/suika/cfg")
let absolute = import("C:/projects/mylib.pyl")
```

Imported scripts are evaluated once. Their top-level declarations become the module map.

```pyle
# lib/greet.pyl
fn hello(name) => "hello, " + name
let version = "1.0"
```

```pyle
# main.pyl
let greet = import("lib/greet")

print(greet.hello("Ada"))
print(greet.version)
```

## Import paths

The VM starts with `./` on the search path. The CLI interpreter also adds the `std/` directory next to the executable and `./std/`, which is how `import("worker")` finds `std/worker.pyl`.

`add_import_path` appends a directory to that same search path; it does not replace it.

```pyle
add_import_path("lib")
add_import_path("vendor")
```

Import names may include subdirectories and `..` segments. The resolver tries the name as-is, then relative to the importing script for `./` names, then relative to each search directory:

```pyle
let helpers = import("lib/helpers")
let shared = import("../shared/utils")
```

## Caching

Modules are cached by name. A second `import` of the same module returns the same map.

```pyle
let a = import("config")
let b = import("config")
print(a == b)    # true, same map object
```

## Module globals

Each module has its own global namespace. Functions and closures defined in a module resolve that module's globals, not the importer's.

```pyle
# counter.pyl
let count = 0
fn next() {
    count += 1
    return count
}
```

```pyle
# main.pyl
let counter = import("counter")
print(counter.next())    # 1
print(counter.next())    # 2
```

## Cycles

If module A imports B and B imports A, B receives A's partially initialized state. Avoid cycles when the initialization order matters.

## Declaration files

Files ending in `.d.pyl` describe native APIs for editors. They are never executed, and the interpreter refuses to import or run one.

- `std/<module>.d.pyl` for native modules such as `http`, `os`, `json`, `math`, `color`, and `crypto`.
- `std/core/<type>.d.pyl` for built-in types such as `string`, `array`, `map`, `bytes`, `coro`, and `future`.
- `std/core/builtin.d.pyl` declares process-global natives and is loaded automatically by the language server.

Declaration syntax:

```pyle
fn name(param: type): ret { }
let NAME: type
struct Name(field: type) { }
```

## Next steps

- [Standard Library Overview](/stdlib/overview/)
- [Coroutines & Async](/language/async/)
- [Embedding in C++](/embedding/)
