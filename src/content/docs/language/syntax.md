---
title: Syntax & Variables
description: Comments, statements, strings, numbers, and variable declarations.
---

Pyle source is line-oriented, but semicolons and braces give you control over statement boundaries. The syntax is deliberately close to JavaScript and Lua without trying to be either.

## Comments

Comments start with `#` and run to the end of the line. There are no block comments.

```pyle
# This is a comment.
let x = 1    # This is also a comment.
```

## Statements and blocks

A statement ends at a newline, a semicolon, or a closing brace. Braces create a block.

```pyle
if ready {
    print("one")
    print("two")
}

if ready { print("one"); print("two") }
```

Single-statement bodies do not need braces:

```pyle
if score > 90 print("A")
while running tick()
```

## Strings

Strings use double quotes only. Single quotes are not string delimiters.

```pyle
let greeting = "hello"
let escaped = "line one\nline two"
```

Supported escapes are `\n`, `\e`, `\t`, `\r`, `\\`, `\"`, `\'`, and `\0`.

There is no implicit concatenation. Use `+`:

```pyle
let name = "Pyle"
let message = "hello, " + name
```

Strings are byte strings. `size()` counts bytes, indexing returns a one-byte string, and iteration yields bytes. Multibyte UTF-8 is not treated as a sequence of characters.

```pyle
print("héllo".size())    # 6, not 5
print("hello"[0])        # "h"
```

## Numbers

Integers are 64-bit signed values. Decimal and hexadecimal literals are supported.

```pyle
let count = 42
let mask = 0xFF
```

Floats must have a decimal point followed by at least one digit.

```pyle
let pi = 3.14159
let half = 0.5
```

`1.` is parsed as the integer `1` followed by a field access dot, not as a float. Write `1.0` instead.

Integer arithmetic wraps on overflow, following two's complement. Division and modulo by zero raise a runtime error.

## Booleans and none

```pyle
let yes = true
let no = false
let missing = none
```

`none`, `false`, `0`, and `0.0` are falsy. Everything else is truthy, including empty arrays and empty maps.

```pyle
if [] print("empty arrays are truthy")
if {} print("empty maps are truthy")
```

## Variables

`let` declares a variable. Reassignment omits `let`.

```pyle
let name = "Pyle"
let count = 0

count = 1
count += 1
```

Compound assignment operators are `+=`, `-=`, `*=`, `/=`, `&=`, `|=`, `^=`, `<<=`, and `>>=`. There is no `++` or `--`.

```pyle
count += 1
flags |= 0x04
```

Variables are block-scoped. A variable declared inside a block is not visible outside it.

```pyle
if true {
    let local = 1
    print(local)
}
# print(local) would be a NameError
```

At module top level, declarations are globals for that module.

## Identifiers and keywords

Identifiers start with a letter or underscore and continue with letters, digits, or underscores. They are case-sensitive. Keywords are reserved lowercase words such as `let`, `fn`, `if`, `elif`, `else`, `while`, `for`, `in`, `loop`, `break`, `continue`, `return`, `struct`, `enum`, `static`, `and`, `or`, `not`, `yield`, and `self`.

## Semicolons

Semicolons are optional separators, not terminators. They are useful when you want two statements on one line.

```pyle
let a = 1; let b = 2
print(a + b)
```

## Next steps

- [Types & Values](/language/types/) for the full value model.
- [Operators](/language/operators/) for precedence and behavior.
- [Control Flow](/language/control-flow/) for loops and conditionals.
