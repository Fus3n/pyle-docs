---
title: Built-in Functions
description: Global functions and constants available in every Pyle program.
---

These names are registered in the global namespace by `register_core_natives`. They are available without an import.

## Output and input

| Function | Returns | Description |
| --- | --- | --- |
| `print(...)` | `none` | Print values separated by spaces, followed by a newline |
| `printf(fmt: string, ...)` | `none` | Formatted print using {fmt} syntax, with a trailing newline |
| `format(fmt: string, ...)` | `string` | Return the formatted string |
| `input(prompt: string?)` | `string` | Read one line from stdin |

```pyle
print("hello", 42)
printf("{} + {} = {}", 1, 2, 3)
let name = input("name: ")
```

Format strings are covered in [Format Strings](/language/format-strings/).

## Types and conversion

| Function | Returns | Description |
| --- | --- | --- |
| `typeof(v)` | `string` | Type name as a string |
| `tostring(v: any)` | `string` | Display string, the same text `print` produces |
| `tonum(v: any)` | `int | float | none` | Parse a number; returns `int`, `float`, or `none` |
| `toint(v: any)` | `int | none` | Truncate to an int; returns `int` or `none` |
| `tofloat(v: any)` | `float | none` | Widen or parse to a float; returns `float` or `none` |

```pyle
typeof(42)          # "int"
typeof(3.14)        # "float"
typeof("hello")     # "string"
typeof([1, 2])      # "array"
typeof({a: 1})      # "map"
typeof(fn() => 1)      # "function"
typeof(none)        # "none"

tonum("2.5")        # 2.5
tonum("2/13")       # none, strict parse
toint(3.9)          # 3
toint("3.9")        # none, strict integer strings only
tofloat(3)          # 3.0
```

`typeof` reports native classes by name, such as `"File"` or `"Server"`. A struct type reports a heap reference name, while a struct instance reports `"struct"`.

## Imports

| Function | Returns | Description |
| --- | --- | --- |
| `import(name: string)` | `map` | Load a native module or script and return its module map |
| `add_import_path(path: string)` | `none` | Add a directory to the module search path |

```pyle
add_import_path("lib")
let helpers = import("helpers")
```

## Constructors

| Function | Returns | Description |
| --- | --- | --- |
| `Coro(f: function)` | `coro` | Wrap a function in a coroutine |
| `Future()` | `Future` | Create an unresolved future |
| `Bytes(arr: array[int])` | `bytes` | Create an immutable byte buffer from int values |
| `BytesBuilder(capacity: int?)` | `bytes_builder` | Create a mutable byte writer |
| `File.open(path: string, mode: string)` | `File` | Open a file |

```pyle
let c = Coro(fn() { yield 1 })
let b = Bytes([72, 105])
let builder = BytesBuilder(1024)
```

## Async helpers

| Function | Returns | Description |
| --- | --- | --- |
| `waitfor(task)` | `any` | Suspend the current coroutine until the future completes |
| `async.run(task)` | `any` | Drive a function or coroutine to completion and return its result |
| `async.all(tasks)` | `array` | Run tasks concurrently and return per-task results |

```pyle
fn work() {
    waitfor(os.sleep_async(50))
    return "done"
}

print(async.run(work))
```

`async.all` returns an array where each element is `{ok: true, value}` or `{ok: false, error}`. See [Coroutines & Async](/language/async/).

## Errors

| Function | Returns | Description |
| --- | --- | --- |
| `pcall(f: function)` | `PCallResult` | Call under a catch checkpoint; returns `{ok, value}` or `{ok, error}` |
| `assert(cond: any, msg: any?)` | `any` | Return `cond` if truthy, else raise `AssertionError` |
| `raise(err: any)` | `none` | Re-raise an error map or a message string |
| `print_trace(err: any)` | `none` | Print an error map using the runtime error format |
| `exit(code: int?)` | `none` | Exit the process with an optional exit code |

```pyle
let result = pcall(fn() { return 1 / 0 })

if not result.ok {
    print(result.error.type)       # RuntimeError
    print(result.error.message)
    print_trace(result.error)
}
```

See [Error Handling](/language/errors/) for the error map shape.

## Constants

| Name | Type | Description |
| --- | --- | --- |
| `PYLE_VERSION: string` | `string` | Interpreter version string, for example `"0.2.0"` |
| `int`, `float`, `bool`, `string`, `array`, `map`, `bytes` | `string` | Type-name string constants |

```pyle
printf("Pyle {}", PYLE_VERSION)

if typeof(value) == int {
    print("integer")
}
```

## `tostring` details

`tostring` uses the display form:

| Value | Result |
| --- | --- |
| `1.0` | `"1"` |
| `1e20` | `"1e+20"` |
| `Bytes([1, 2])` | `"<bytes 2>"` |
| `BytesBuilder()` | `"<bytes_builder size=0>"` |
| A coroutine | `"<coro>"` |
| A native function | `"<native_function>"` |
| A closure | `"<function name at 0x...>"` |
| A struct instance | `"{field: value, ...}"` |
| A struct type | `"struct {fields}"` |

Self-referential arrays print `[heap_idx]`; self-referential maps and structs print `{...}`.

## Related

- [Standard Library Overview](/stdlib/overview/)
- [Format Strings](/language/format-strings/)
- [Coroutines & Async](/language/async/)
