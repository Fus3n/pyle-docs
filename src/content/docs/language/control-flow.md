---
title: Control Flow
description: Conditionals, loops, ranges, break, and continue.
---

## If, elif, else

```pyle
if score >= 90 {
    print("A")
} elif score >= 80 {
    print("B")
} else {
    print("C")
}
```

`elif` is a keyword. `else if` is also valid and is parsed as a nested `if` inside an `else` block.

```pyle
if a {
    print("a")
} else if b {
    print("b")
} else {
    print("neither")
}
```

Single-statement bodies can omit braces:

```pyle
if ready print("ready")
if a > 0 { print("positive") } else { print("not positive") }
```

An `else` on the same line needs the `then` body braced, or a semicolon after it. `if a > 0 print("positive") else print("not positive")` is a syntax error.

## While

```pyle
let i = 0
while i < 5 {
    print(i)
    i += 1
}
```

## Loop

`loop` is an infinite loop. Use `break` to exit.

```pyle
loop {
    let line = input("> ")
    if line == "quit" { break }
    print(line)
}
```

## For-in

`for` iterates arrays, ranges, strings, and bytes.

```pyle
for value in [10, 20, 30] {
    print(value)
}

for i in 1..5 {
    print(i)    # 1, 2, 3, 4
}

for byte in "hi" {
    print(byte)    # one-byte strings
}

for value in Bytes([65, 66]) {
    print(value)   # 65, 66
}
```

Maps are not directly iterable. Iterate `keys()` or `values()`:

```pyle
let person = {name: "Ada", age: 36}

for key in person.keys() {
    printf("{} = {}", key, person[key])
}

for value in person.values() {
    print(value)
}
```

## Break and continue

```pyle
for i in 1..10 {
    if i == 3 { continue }
    if i == 6 { break }
    print(i)    # 1, 2, 4, 5
}
```

`break` and `continue` work in `while`, `for`, and `loop`. Using them outside a loop is a compile error. There are no labeled breaks.

## Ranges

Ranges use `..` with an exclusive end.

```pyle
for i in 0..arr.size() {
    print(arr[i])
}
```

`start > end` yields an empty range. Boundaries must be integers.

## Truthiness

The falsy values are `none`, `false`, `0`, and `0.0`. Everything else is truthy, including empty arrays and empty maps.

```pyle
if [] print("truthy")
if {} print("truthy")
if 0 print("never")
```

## Statement bodies

Braces are optional for a single statement. A block with multiple statements needs braces or semicolons.

```pyle
if a > 5 print("big")

if a > 5 {
    print("big")
    print("also big")
}
```

## Next steps

- [Functions & Closures](/language/functions/)
- [Coroutines & Async](/language/async/)
- [Error Handling](/language/errors/)
