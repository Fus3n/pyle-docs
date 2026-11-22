---
title: math
description: Constants and numeric functions.
---

```pyle
let math = import("math")
```

`math` is a core module and has no dependencies.

## Constants

| Constant | Type | Description |
| --- | --- | --- |
| `PI` | `float` | π |
| `TAU` | `float` | 2π |
| `E` | `float` | Euler's number |

```pyle
printf("pi = {:.6f}", math.PI)
```

## Roots and powers

| Function | Returns | Description |
| --- | --- | --- |
| `sqrt(x: int | float)` | `float` | Square root |
| `cbrt(x: int | float)` | `float` | Cube root |
| `pow(b: int | float, e: int | float)` | `float` | `base` raised to `exp` |
| `hypot(x: int | float, y: int | float)` | `float` | `sqrt(x*x + y*y)` |
| `exp(x: int | float)` | `float` | `e^x` |
| `log(x: int | float)` | `float` | Natural logarithm |
| `log2(x: int | float)` | `float` | Base-2 logarithm |
| `log10(x: int | float)` | `float` | Base-10 logarithm |

## Trigonometry

All angles are in radians.

| Function | Returns | Description |
| --- | --- | --- |
| `sin(x: int | float)` | `float` | Sine |
| `cos(x: int | float)` | `float` | Cosine |
| `tan(x: int | float)` | `float` | Tangent |
| `asin(x: int | float)` | `float` | Inverse sine |
| `acos(x: int | float)` | `float` | Inverse cosine |
| `atan(x: int | float)` | `float` | Inverse tangent |
| `atan2(y: int | float, x: int | float)` | `float` | Angle of the vector `(x, y)` |
| `sinh(x: int | float)` | `float` | Hyperbolic sine |
| `cosh(x: int | float)` | `float` | Hyperbolic cosine |
| `tanh(x: int | float)` | `float` | Hyperbolic tangent |
| `radians(d: int | float)` | `float` | Degrees to radians |
| `degrees(r: int | float)` | `float` | Radians to degrees |

```pyle
printf("sin(pi/2) = {}", math.sin(math.PI / 2))
printf("90 degrees = {} radians", math.radians(90))
```

## Rounding

| Function | Returns | Description |
| --- | --- | --- |
| `floor(x: int | float)` | `int` | Largest integer not greater than `x`; returns int |
| `ceil(x: int | float)` | `int` | Smallest integer not less than `x`; returns int |
| `round(x: int | float)` | `int` | Nearest int, half away from zero |
| `trunc(x: int | float)` | `int` | Truncate toward zero; returns int |

```pyle
math.floor(3.9)     # 3
math.ceil(3.1)      # 4
math.round(2.5)     # 3
math.round(-2.5)    # -3
math.trunc(-3.9)    # -3
```

`round` is half away from zero, not banker's rounding.

## General

| Function | Returns | Description |
| --- | --- | --- |
| `abs(x: int | float)` | `int | float` | Absolute value; preserves int or float |
| `sign(x: int | float)` | `int` | `-1`, `0`, or `1` as an int |
| `min(a: int | float, b: int | float)` | `int | float` | Smaller value |
| `max(a: int | float, b: int | float)` | `int | float` | Larger value |
| `clamp(v: int | float, lo: int | float, hi: int | float)` | `int | float` | Clamp `v` into `[lo, hi]` |

```pyle
math.abs(-4)             # 4
math.sign(-2.5)          # -1
math.min(3, 8)           # 3
math.clamp(15, 0, 10)    # 10
```

## Notes

- Pyle has no `**` operator. Use `math.pow(base, exp)`.
- Division and modulo by zero raise a runtime error. There is no `inf` or `nan` in the language.
- Integer arithmetic wraps on overflow; use floats when you need a wider range.
- `math.floor`, `math.ceil`, `math.round`, `math.trunc`, and `math.sign` return ints. The rest return floats unless the input type dictates otherwise.

## Related

- [Operators](/language/operators/) for arithmetic and bitwise behavior.
- [Types & Values](/language/types/) for numeric types.
