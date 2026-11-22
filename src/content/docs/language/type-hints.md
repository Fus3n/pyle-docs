---
title: Type Hints
description: Optional annotations for editors and documentation. Never enforced at runtime.
---

Pyle is dynamically typed. Type hints are accepted everywhere an annotation makes sense, but the compiler parses and discards them. They exist for editor completion and for readers.

```pyle
fn add(a: int, b: int): int {
    return a + b
}

struct Point(x: float, y: float) {}

let origin: Point = Point(x: 0, y: 0)
let names: array[string] = ["a", "b"]
let lookup: map[string, any] = {"k": 1}
```

A wrong hint never errors:

```pyle
let x: int = "hello"    # runs fine
```

## Where hints are allowed

- `let` bindings
- Function parameters and return types
- Struct fields
- Struct method parameters and return types

## Built-in type names

`int`, `float`, `string`, `bool`, `bytes`, `array`, `map`, `function`, `any`, and `none`, plus named structs.

Generic forms are supported by the declaration files and editor tooling:

```pyle
let rows: array[map[string, any]] = []
let handler: function = fn(x) => x
```

## Unions

```pyle
fn parse(value: string | int): int | none {
    return tonum(value)
}
```

In a type position, `|` is union syntax. In an expression, `|` is still bitwise or.

## Optional types

`string?` means `string` or `none`. On a native function parameter it also marks the parameter as omittable. `T?` binds tighter than `|`, so `string? | int` is `(string | none) | int`.

```pyle
let name: string? = none
```

Pyle-defined functions do not have default parameter values; optional parameters are a native-binding feature.

## Type-name constants

The names `int`, `float`, `bool`, `string`, `array`, `map`, and `bytes` are also string constants usable at runtime:

```pyle
if typeof(value) == int {
    print("integer")
}
```

## Related

- [Types & Values](/language/types/) for the runtime value model.
- [Declaration Files](/language/modules/#declaration-files) for `.d.pyl` files used by the language server.
