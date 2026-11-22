---
title: Enums
description: Named integer constants that desugar to maps.
---

An `enum` is a named collection of constants. It desugars to a map literal bound to a name, so members are accessed like map keys.

```pyle
enum Direction { NORTH, SOUTH, EAST, WEST }

print(Direction.NORTH)       # 0
print(Direction["SOUTH"])    # 1
```

The desugared form is:

```pyle
let Direction = {"NORTH": 0, "SOUTH": 1, "EAST": 2, "WEST": 3}
```

## Explicit values

Members can have explicit values. Integer initializers reset the auto-increment counter.

```pyle
enum Status { OK, ERROR = 5, TIMEOUT }

print(Status.OK)       # 0
print(Status.ERROR)    # 5
print(Status.TIMEOUT)  # 6
```

Values do not have to be integers:

```pyle
enum Token { WORD = "word", NUMBER = "number" }
```

A non-integer initializer stops the counter, so the next member must carry an explicit initializer.

```pyle
enum Valid { A = "x", B = "y" }

# enum Invalid { A = "x", B }    # compile error
```

## Access

Enums are maps, so the usual map operations work.

```pyle
enum Color { RED, GREEN, BLUE }

print(Color.RED)
print(Color["BLUE"])
print(Color.keys())
print(Color.values())
print(Color.has("GREEN"))
```

Because an enum is a map, it is not a distinct runtime type. `typeof(Color)` is `"map"`.

## Next steps

- [Modules & Imports](/language/modules/)
- [Types & Values](/language/types/)
