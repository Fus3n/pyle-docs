---
title: Error Handling
description: pcall, raise, assert, error maps, and trace printing.
---

Pyle does not have `try`/`catch`. Errors are values. A failing call can be caught with `pcall`, and an uncaught error halts the script through the normal panic path.

## pcall

`pcall(fn, args...)` calls a function under a catch checkpoint. It returns `{ok: true, value}` on success or `{ok: false, error}` on a panic.

```pyle
fn risky() {
    let a = 1
    return a + {}
}

let result = pcall(risky)

if result.ok {
    print(result.value)
} else {
    print(result.error.type)       # TypeError
    print(result.error.message)
    print_trace(result.error)
}
```

`error` is a map with `type`, `message`, and `trace`. `trace` is an array of `{function, file, line}` frames, outermost first. Internal `__call_trampoline` frames are omitted.

`pcall` catches runtime panics from Pyle functions and native functions. Plain struct construction is not catchable.

## raise

`raise` re-raises an error map with its trace preserved.

```pyle
let result = pcall(risky)

if not result.ok {
    raise(result.error)
}
```

A string is also accepted and becomes a `RuntimeError` with that message.

```pyle
raise("something went wrong")
```

An uncaught `raise` follows the normal panic path and exits the interpreter with a nonzero status.

## assert

`assert(condition, message?)` returns the condition if it is truthy, or raises `AssertionError`.

```pyle
fn divide(a, b) {
    assert(b != 0, "cannot divide by zero")
    return a / b
}
```

`assert` is catchable with `pcall`.

## print_trace

`print_trace(err)` prints an error map using the runtime's error format, including frames, a source snippet, and a hint when one is available.

```pyle
let result = pcall(risky)
if not result.ok {
    print_trace(result.error)
}
```

It tolerates malformed input, so passing a partially built map does not crash.

## Error shapes

A pcall result:

```pyle
let result = {
    ok: true,
    value: none    # any value
}
```

A failure:

```pyle
let failure = {
    ok: false,
    error: {
        type: "TypeError",
        message: "Unsupported operand types...",
        trace: [
            {function: "risky", file: "main.pyl", line: 3}
        ]
    }
}
```

The trace frame order is outermost first. `file` is the virtual script name passed to the interpreter.

## Runtime error types

| Type | Raised when |
| --- | --- |
| `TypeError` | An operation receives an incompatible type |
| `NameError` | A variable or field does not exist |
| `IndexError` | An array, string, or map index is invalid |
| `OutOfBoundsError` | An index is outside a container |
| `ArgumentError` | A native function receives invalid arguments |
| `AssertionError` | `assert` fails |
| `RuntimeError` | A generic runtime failure, including division or modulo by zero |
| `StackUnderFlowError` | The VM stack is inconsistent; indicates an interpreter bug |

## Nested pcall

Nested `pcall` works. The innermost checkpoint catches first.

```pyle
let outer = pcall(fn() {
    let inner = pcall(fn() {
        return 1 / 0
    })
    return inner
})

print(outer.ok)    # true, the outer function returned a map
```

## Yield inside pcall

`pcall` supports yielding when the callee has a coroutine caller. The suspend and resume are transparent, and `value` is the final result. At top level with no caller, a yield inside `pcall` produces a caught `RuntimeError`.

## Next steps

- [Coroutines & Async](/language/async/)
- [Built-in Functions](/stdlib/builtins/) for `pcall`, `raise`, `assert`, and `print_trace`.
- [Bytecode & VM](/reference/bytecode/) for the execution model.
