---
title: Quick Start
description: Write and run your first Pyle script.
---

This page walks through the language basics in the order you are likely to need them. Every example runs in the [playground](/playground/) as well as on the command line.

## Hello, world

Create a file named `hello.pyl`:

```pyle
print("Hello, world.")
```

Run it with the interpreter:

```sh
pyle hello.pyl
```

`print` writes its arguments separated by spaces and adds a newline. `printf` and `format` use `{}` placeholders:

```pyle
let name = "world"
printf("Hello, {}!", name)
let message = format("{} + {} = {}", 1, 2, 3)
print(message)
```

## Variables

Variables are declared with `let`. Reassignment does not repeat `let`.

```pyle
let count = 0
count = count + 1
count += 1

let name = "Pyle"
let pi = 3.14159
let ready = true
let missing = none
```

Pyle is dynamically typed. A variable can hold any value, and type hints are documentation only.

```pyle
let value: int = 42
value = "now a string"    # legal; hints are not enforced
```

## Functions

Functions are declared with `fn`. The last expression can be returned with `=>`.

```pyle
fn add(a, b) {
    return a + b
}

fn double(x) => x * 2

printf("{}", add(2, 3))
printf("{}", double(21))
```

Functions are values, so they can be stored in arrays, passed as arguments, and returned from other functions.

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
```

## Control flow

```pyle
let score = 87

if score >= 90 {
    print("A")
} elif score >= 80 {
    print("B")
} else {
    print("C")
}

for i in 1..5 {
    printf("{}", i)    # 1 2 3 4
}

let total = 0
for value in [10, 20, 30] {
    total += value
}
print(total)
```

`1..5` is a range with an exclusive end. Maps are not directly iterable; use `.keys()` or `.values()`.

## Arrays and maps

```pyle
let numbers = [1, 2, 3]
numbers.append(4)
numbers[0] = 10
print(numbers)                    # [10, 2, 3, 4]
print(numbers.slice(1, 3))        # [2, 3]

let person = {name: "Ada", age: 36}
print(person.name)                # Ada
person["age"] = 37
print(person.keys())              # ["name", "age"]
```

Array and map indexing is checked at runtime. A missing map key through brackets raises `IndexError`; dot access returns `none` instead.

## Structs

Structs have a fixed shape declared in the header. Methods receive `self` automatically.

```pyle
struct Rect(w, h) {
    fn area() => self.w * self.h

    static fn square(size) {
        return Rect(size, size)
    }
}

let r = Rect(4, 6)
printf("area = {}", r.area())

let s = Rect.square(5)
printf("square area = {}", s.area())
```

## Imports

Native modules and other scripts are loaded with `import`.

```pyle
let math = import("math")
let os = import("os")

printf("sqrt(144) = {}", math.sqrt(144))
print(os.platform())
```

A script can import another script by path. The `.pyl` extension is optional.

```pyle
let helpers = import("lib/helpers")
helpers.greet("Pyle")
```

## Error handling

Errors are values. Use `pcall` to catch a failing call.

```pyle
fn divide(a, b) {
    assert(b != 0, "cannot divide by zero")
    return a / b
}

let result = pcall(divide, 10, 0)

if result.ok {
    print(result.value)
} else {
    printf("{}: {}", result.error.type, result.error.message)
}
```

## Command-line arguments

`os.args` contains the arguments after the script path. Flags before the script belong to the interpreter.

```pyle
let os = import("os")
print(os.args)
```

```sh
pyle script.pyl one two --flag
```

Inside the script, `os.args` is `["one", "two", "--flag"]`.

## Where to go next

- [Language guide](/language/syntax/) for the full syntax.
- [Standard library](/stdlib/overview/) for modules and built-in types.
- [Embedding](/embedding/) to call Pyle from C++.
