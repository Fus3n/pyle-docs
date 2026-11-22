---
title: Limitations
description: What Pyle deliberately does not have.
---

Pyle is small on purpose. These features are absent, and some are unlikely to be added.

## Syntax and language

- No `switch` or `case`.
- No ternary `a ? b : c`.
- No `try`/`catch`. Use [`pcall`](/language/errors/) for catchable errors; uncaught panics halt execution.
- No list or dict comprehensions.
- No generator expressions.
- No `with` statement.
- No `del` statement.
- No `is` operator.
- No `match` or pattern matching.
- No decorators.
- No `@property`; struct getters and setters exist only through C++ bindings.
- No multiple inheritance or interfaces.
- No f-strings. Use `format()`.
- No `**` exponentiation. Use `math.pow()`.
- No `//` integer division.
- No `++` or `--`. Use `x += 1`.
- No `!` for logical NOT. Use `not`.
- No `in` for containment. `in` only appears in `for x in iterable`.
- No `not in`.
- No slice assignment `arr[1:3] = [...]`.
- No negative indices for arrays or strings.
- No default parameter values for Pyle functions.
- No runtime-enforced type hints.

## Types and values

- Bitwise operators exist but require int operands.
- Strings are byte strings, not Unicode text. Multibyte UTF-8 is not character-aware.
- Strings support `==` and `!=`, but not `<`, `<=`, `>`, or `>=`.
- Division and modulo by zero raise. There is no `inf` or `nan`.
- Integer arithmetic wraps on overflow.
- Structs have a fixed shape. Fields cannot be added after construction.
- Struct operator overloading is not wired up. Only `_init` is honored.
- Map keys cannot be arrays, maps, struct instances, or `BytesBuilder`.
- `json.stringify` rejects struct instances.

## Concurrency

- No threads and no shared-memory parallelism. Coroutines are cooperative and single-threaded.
- No preemptive scheduling. A long-running script blocks its thread until it yields or finishes.
- The playground runs scripts in a worker and terminates them after 8 seconds.

## Tooling and platform

- `proc`, worker processes, and `.pyled` modules are unavailable on `wasm32`.
- `json`, `http`, and `crypto` are not part of `libpyle`.
- The `worker` Pyle module requires `json`.
- Async file and sleep operations resolve synchronously on `wasm32`.

## Compile-time restrictions

- `break` and `continue` outside a loop are compile errors.
- Compound assignment on an index requires a simple index expression: `a[i] += 1` is valid; `a[x + 1] += 1` is a syntax error.
- `1.` is parsed as the integer `1` followed by field access. Write `1.0`.
- Functions accept at most 255 parameters.

## Pre-1.0 status

Pyle is version 0.2.0. Syntax and behavior can change between releases. Pin a commit if you embed it in something long-lived.

## Related

- [Notes](/language/syntax/) for everyday syntax surprises.
- [Types & Values](/language/types/) for the value model.
- [Bytecode & VM](/reference/bytecode/) for the execution model.
