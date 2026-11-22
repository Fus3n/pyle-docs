---
title: Functions & Closures
description: Named functions, lambdas, closures, recursion, and higher-order calls.
---

Functions are first-class values. They can be named, anonymous, stored in arrays and maps, passed as arguments, and returned from other functions.

## Named functions

```pyle
fn add(a, b) {
    return a + b
}
```

A single-expression body can use `=>` for an implicit return.

```pyle
fn double(x) => x * 2
fn greet(name) => "hello, " + name
```

A function without a `return` returns `none`.

```pyle
fn log(value) {
    print(value)
}
```

Functions accept at most 255 parameters.

## Anonymous functions

```pyle
let square = fn(x) => x * x
print(square(5))

let values = [1, 2, 3]
print(values.map(fn(v) => v * 2))
```

## Closures

Every function is a closure. It captures surrounding variables by reference, so mutations are visible to the original binding.

```pyle
fn make_counter() {
    let count = 0
    return fn() {
        count += 1
        return count
    }
}

let next = make_counter()
print(next())    # 1
print(next())    # 2
print(next())    # 3
```

Closures capture by reference, not by value. If you need a snapshot, copy the value into a new local before returning the closure.

```pyle
fn make_fixed(value) {
    let snapshot = value
    return fn() => snapshot
}
```

## Recursion

```pyle
fn fib(n) {
    if n <= 1 { return n }
    return fib(n - 1) + fib(n - 2)
}

print(fib(10))
```

## Higher-order functions

Functions can be passed to and returned from other functions.

```pyle
fn apply(callback, value) {
    return callback(value)
}

print(apply(fn(x) => x + 1, 41))
```

The built-in array methods `map`, `filter`, and `find` take a one-argument callback.

```pyle
let numbers = [1, 2, 3, 4, 5]

let doubled = numbers.map(fn(n) => n * 2)
let evens = numbers.filter(fn(n) => n % 2 == 0)
let first_big = numbers.find(fn(n) => n > 3)

print(doubled)
print(evens)
print(first_big)
```

A callback runtime error aborts the method and propagates.

## Keyword arguments

Keyword arguments are only for struct constructors. Ordinary function calls are positional.

```pyle
struct Point(x, y) {}

let p = Point(x: 1, y: 2)
```

Native functions can declare optional parameters with the `?` type form; omit the trailing arguments positionally.

```pyle
# On a native binding: fn greet(name: string, punctuation: string?)
print(greet("Ada", "!"))
```

## Functions in modules

Functions defined at the top level of a script are globals for that module. When another script imports the module, it receives a module map containing those names.

```pyle
# lib/mathx.pyl
fn square(x) => x * x
let version = "1.0"
```

```pyle
# main.pyl
let mathx = import("lib/mathx")
print(mathx.square(9))
print(mathx.version)
```

Each module has its own globals. A function from a module resolves that module's globals, not the importer's.

## Next steps

- [Structs](/language/structs/)
- [Coroutines & Async](/language/async/)
- [Error Handling](/language/errors/)
