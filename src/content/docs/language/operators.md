---
title: Operators
description: Precedence, arithmetic, bitwise operations, comparison, and assignment.
---

Operators are listed from lowest to highest precedence. Unless noted otherwise, binary operators are left-associative.

| Level | Operators | Associativity | Notes |
| --- | --- | --- | --- |
| 0 | `=`, `+=`, `-=`, `*=`, `/=`, `&=`, `\|=`, `^=`, `<<=`, `>>=` | Right | Assignment |
| 1 | `or` | Left | Short-circuit |
| 2 | `and` | Left | Short-circuit |
| 3 | `==`, `!=` | Left | Equality |
| 4 | `<`, `<=`, `>`, `>=` | Left | Comparison |
| 4.5 | `..` | Left | Range literal |
| 4.6 | `\|` | Left | Bitwise or |
| 4.7 | `^` | Left | Bitwise xor |
| 4.8 | `&` | Left | Bitwise and |
| 4.9 | `<<`, `>>` | Left | Shifts |
| 5 | `+`, `-` | Left | Addition, subtraction |
| 6 | `*`, `/`, `%` | Left | Multiplication, division, modulo |
| 7 | `not`, `-`, `+`, `~` | Right | Unary |
| 8 | `f(a, b)`, `o.m()`, `o.f`, `a[i]` | Left | Call and access |

## Arithmetic

```pyle
print(2 + 3)       # 5
print(7 - 2)       # 5
print(4 * 5)       # 20
print(17 / 2)      # 8, integer division
print(7.0 / 2)     # 3.5
print(17 % 5)      # 2
```

`/` on two ints truncates toward zero. If either operand is a float, the result is a float. Division and modulo by zero raise `RuntimeError` for both ints and floats. There is no `inf` or `nan`.

Integer arithmetic wraps on overflow:

```pyle
print(9223372036854775807 + 1)    # -9223372036854775808
```

`+` also concatenates strings. There is no `**` exponentiation; use `math.pow`. There is no `//` integer division operator.

## Unary operators

```pyle
print(-5)
print(not true)    # false
print(~5)          # -6
```

`!` is not a logical NOT operator. Use `not`.

## Bitwise operators

Bitwise operators require integer operands. Floats, bools, strings, and `none` raise `TypeError`.

```pyle
print(5 & 3)       # 1
print(5 | 3)       # 7
print(5 ^ 3)       # 6
print(~5)          # -6
print(1 << 4)      # 16
print(-4 >> 1)     # -2
```

`>>` sign-extends. Shift counts must be non-negative. Counts of 64 or more do not raise: `x << 64` is `0`, and `x >> 64` is `0` for non-negative `x` and `-1` for negative `x`.

Bitwise precedence is Python-style: shifts bind tighter than `&`, which binds tighter than `^`, which binds tighter than `|`, and all of them bind tighter than comparisons.

```pyle
print(5 & 3 == 1)    # true, parsed as (5 & 3) == 1
```

## Comparison

```pyle
print(1 < 2)         # true
print(2 <= 2)        # true
print(3 > 4)         # false
print("a" == "a")    # true
print("a" != "b")    # true
```

`<`, `<=`, `>`, and `>=` work on numbers only. Comparing strings with them raises `TypeError`. Use `==` and `!=` for strings.

Equality follows the value model:

- Ints and floats compare numerically across types.
- `true == 1` is false.
- Strings compare by content.
- Reference types compare by identity.

See [Types & Values](/language/types/#equality) for the full rules.

## Logical operators

`and` and `or` short-circuit and return one of their operands, not necessarily a bool. `not` always returns a bool.

```pyle
print(0 or 5)      # 5
print(0 and 5)     # 0
print(not 0)       # true
```

This makes `and` and `or` useful for defaults and guards:

```pyle
let name = maybe_name or "anonymous"
```

## Assignment

Assignment is an expression that returns the assigned value.

```pyle
let x = 1
let y = (x = 5)
print(x)    # 5
print(y)    # 5
```

Compound assignment operators exist for arithmetic and bitwise operations:

```pyle
x += 1
x -= 2
x *= 3
x /= 4
x &= 0x0F
x |= 0x10
x ^= 0x03
x <<= 1
x >>= 1
```

There is no `++` or `--`. Use `x += 1`.

## Ranges

```pyle
let r = 1..10
for i in r {
    print(i)    # 1 through 9
}
```

The end is exclusive. `start > end` produces an empty range. Boundaries must be integers.

## Access and calls

```pyle
let values = [10, 20, 30]
print(values[1])          # 20
print(values.slice(0, 2))

let person = {name: "Ada"}
print(person.name)
print(person["name"])

fn add(a, b) => a + b
print(add(2, 3))
```

Method calls bind `self` automatically for struct instances. Keyword arguments are supported at call sites:

```pyle
struct Point(x, y) {}
let p = Point(x: 1, y: 2)
```

## Next steps

- [Control Flow](/language/control-flow/)
- [Functions & Closures](/language/functions/)
- [Format Strings](/language/format-strings/)
