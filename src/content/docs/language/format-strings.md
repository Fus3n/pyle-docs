---
title: Format Strings
description: The {fmt}-based formatting engine used by printf, format, and printf-style helpers.
---

`format(fmt, ...)` returns a formatted string. `printf(fmt, ...)` prints it with a trailing newline. Both use the C++ [{fmt}](https://fmt.dev) library through `fmt::vformat`, so the syntax is close to Python's `str.format` with C-style format specifiers.

```pyle
printf("Hello {}!", "world")           # Hello world!
printf("{:.2f}", 3.14159)              # 3.14

let s = format("{} + {} = {}", 1, 2, 3)
printf("{{{}}}", 42)                   # {42}
printf("{1} {0}", "a", "b")            # b a
```

## Arguments

`{}` consumes the next argument. `{0}` and `{1}` address arguments by index, and indices can repeat or be reordered.

```pyle
printf("{} {} {}", "a", "b", "c")      # a b c
printf("{2} {0}", "a", "b", "c")       # c a
printf("{0} {0}", "again")             # again again
```

Extra arguments are ignored.

```pyle
printf("{}", 1, 2)                     # 1
```

The first argument must be a string. A malformed format raises `ArgumentError` with a `Format error: ...` message.

## Escaping

`{{` renders a literal `{`, and `}}` renders a literal `}`.

```pyle
printf("{{}}", 1)       # {}
printf("{{{}}}", 42)    # {42}
```

## Format specs

Format specs appear after `:`. They are type-strict.

| Type | Specs | Example |
| --- | --- | --- |
| Float | `f`, `e`, `g`, precision, width | `{:.2f}`, `{:e}`, `{:>8.2f}` |
| Int | `d`, `x`, `X`, `o`, `b`, `c` | `{:d}`, `{:05d}`, `{:#x}` |
| String | `s` | `{:s}` |
| Alignment | `<`, `>`, `^` with width | `{:>10}`, `{:^10}` |

```pyle
printf("{:.2f}", 3.14159)       # 3.14
printf("{:.0f}", 3.6)           # 4
printf("{:g}", 3.14159)         # 3.14159
printf("{:e}", 1234.5)          # 1.234500e+03

printf("{:d}", 42)              # 42
printf("{:05d}", 42)            # 00042
printf("{:08d}", 42)            # 00000042
printf("{:x}", 255)             # ff
printf("{:#x}", 255)            # 0xff
printf("{:b}", 5)               # 101
printf("{:c}", 65)              # A

printf("{:>10}", "right")       #      right
printf("{:<10}", "left")        # left
printf("{:^10}", "center")      #   center
printf("{:>8.2f}", 3.14159)     #     3.14
printf("{:+d}", 42)             # +42
printf("{: }", 42)              #  42
```

Passing a float to an integer spec or an int to a float spec raises `ArgumentError`.

```pyle
format("{:.2f}", 5)       # ArgumentError
format("{:d}", 5.0)       # ArgumentError
```

## Not supported

- Named fields such as `{name}` raise `ArgumentError: Format error: argument not found`.
- The `,` grouping option (`{,d}`, `{,.2f}`) raises `invalid format specifier`.

## Argument conversion

Ints, floats, and bools use their natural presentation. `none` becomes `none`. Any other value uses its display string, so arrays print like `[1, 2]`.

```pyle
printf("{}", [1, 2, 3])       # [1, 2, 3]
printf("{}", none)            # none
printf("{}", true)            # true
```

## Next steps

- [Built-in Functions](/stdlib/builtins/)
- [Strings, Arrays & Maps](/stdlib/strings-arrays-maps/)
