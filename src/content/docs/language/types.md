---
title: Types & Values
description: The value model, literals, reference types, and equality.
---

Pyle is dynamically typed. A variable holds a value, and the value carries its own type. There are no declarations that change runtime behavior and no implicit conversions between unrelated types.

## Value tags

| Type | Literal | Notes |
| --- | --- | --- |
| `Int` | `42`, `0xFF` | 64-bit signed, wraps on overflow |
| `Float` | `3.14` | Double precision |
| `Bool` | `true`, `false` | |
| `None` | `none` | Absence of a value |
| `String` | `"hello"` | Interned, immutable byte string |
| `Array` | `[1, 2, 3]` | Heterogeneous, resizable |
| `Map` | `{a: 1, "b": 2}` | Keys can be strings, ints, and other hashable values |
| `Range` | `1..10` | Exclusive end |
| `Function` | `fn(x) x + 1` | First-class closure |
| `StructType` | `struct Point(x, y) {}` | Type definition |
| `Struct` | `Point(1, 2)` | Fixed-shape instance |
| `Bytes` | `Bytes([65, 66])` | Immutable byte buffer |
| `BytesBuilder` | `BytesBuilder()` | Mutable byte writer |
| `Coro` | `Coro(my_fn)` | Coroutine |
| `Future` | `Future()` | Async result handle |
| `Iterator` | produced by iteration | Internal iteration state |
| `NativeObject` | produced by bindings | Wrapped C++ object |

`typeof` returns a string describing a value.

```pyle
print(typeof(42))          # int
print(typeof(3.14))        # float
print(typeof("hello"))     # string
print(typeof([1, 2]))      # array
print(typeof({a: 1}))      # map
print(typeof(fn() => 1))      # function
print(typeof(none))        # none
```

For a struct type, `typeof(P)` returns a heap reference name such as `"HeapRef(12)"`; `tostring(P)` returns `"struct {fields}"`. For a struct instance, `typeof(instance)` returns `"struct"` and `tostring(instance)` returns `{field: value, ...}`.

## Strings

Strings are immutable, interned byte strings. The same string content shares one heap allocation.

```pyle
let s = "hello"
print(s.size())          # 5
print(s[0])              # h
print(s.slice(1, 3))     # el
print(s.upper())         # HELLO
print(s.split("l"))      # ["he", "", "o"]
```

String indexing is checked at runtime. String comparison with `<`, `<=`, `>`, or `>=` raises `TypeError`; only `==` and `!=` compare strings.

## Arrays

Arrays are reference types with indexed access and mutation.

```pyle
let values = [1, 2, 3]
values.append(4)
values[0] = 10
print(values)               # [10, 2, 3, 4]
print(values.slice(1, 3))   # [2, 3]
```

There are no negative indices. Use `values[values.size() - 1]` for the last element. Out-of-bounds access raises `IndexError`.

## Maps

Maps store key-value pairs. Keys can be strings, ints, floats, bools, and other hashable values. Arrays, maps, struct instances, and `BytesBuilder` cannot be keys.

```pyle
let person = {name: "Ada", age: 36}
print(person.name)          # Ada
print(person["age"])        # 36

person["age"] = 37
person.city = "London"      # dot assignment writes the data key

print(person.has("city"))   # true
print(person.keys())
print(person.values())
```

A missing key through brackets raises `IndexError`. Dot access returns `none` for a missing key.

## Ranges

Ranges are created with `..` and have an exclusive end.

```pyle
for i in 1..5 {
    print(i)    # 1, 2, 3, 4
}

let empty = 5..1
```

Range boundaries must be integers. A float boundary raises `TypeError`.

## Functions

Functions are closures and first-class values.

```pyle
fn add(a, b) => a + b
let f = add
print(f(2, 3))
```

A function value can be stored in an array or map, passed as an argument, or returned from another function.

## Structs

Structs are fixed-shape reference types with fields and methods.

```pyle
struct Point(x, y) {
    fn length() => self.x + self.y
}

let p = Point(3, 4)
print(p.length())
```

Fields must be declared in the struct header. You cannot add a new field after construction.

## Equality

`==` and `!=` compare values:

- Ints and floats compare numerically across types: `1 == 1.0` is true.
- `true == 1` is false.
- Strings compare by content.
- Arrays, maps, structs, bytes, functions, ranges, coroutines, and native objects compare by identity. `[] == []` is false.

```pyle
print(1 == 1.0)       # true
print("a" == "a")     # true
print([] == [])       # false

let a = [1]
let b = a
print(a == b)         # true, same object
```

## Type names as constants

`int`, `float`, `bool`, `string`, `array`, `map`, and `bytes` are string constants. They are useful with `typeof`.

```pyle
let value = 42
if typeof(value) == int {
    print("integer")
}
```

There are no `int()`, `float()`, `bool()`, or `string()` conversion functions. Use `toint`, `tofloat`, `tonum`, `tostring`, and the string parsing methods.

## Next steps

- [Operators](/language/operators/)
- [Strings, Arrays & Maps](/stdlib/strings-arrays-maps/)
- [Bytes & BytesBuilder](/stdlib/bytes/)
