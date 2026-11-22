---
title: Strings, Arrays & Maps
description: Methods on the three collection types you will use most.
---

Strings, arrays, and maps are built into the VM. Their methods are available on every value without an import.

## Strings

Strings are immutable byte strings. `size()`, indexing, iteration, and `split("")` are byte-based, not character-based.

| Method | Returns | Description |
| --- | --- | --- |
| `.size()` | `int` | Byte count |
| `.to_num()` | `int \| float \| none` | Parse a number; `int`, `float`, or `none` |
| `.slice(start: int, end: int)` | `string` | Substring; negative `start` clamps to 0 |
| `.slice(range: range)` | `string` | Substring from a range with an exclusive end |
| `.is_digit()` | `bool` | All bytes are ASCII digits |
| `.is_alpha()` | `bool` | All bytes are ASCII letters |
| `.is_alnum()` | `bool` | All bytes are ASCII letters or digits |
| `.is_space()` | `bool` | All bytes are ASCII whitespace |
| `.join(arr: array)` | `string` | Join values with this string as the delimiter |
| `.split(delimiter: string)` | `array` | Split by a delimiter; an empty delimiter splits into bytes |
| `.lower()` | `string` | Lowercase copy |
| `.upper()` | `string` | Uppercase copy |
| `.to_bytes()` | `bytes` | Copy the bytes into `bytes` |
| `.trim()` | `string` | Strip leading and trailing whitespace |
| `.contains(sub: string)` | `bool` | True if `sub` occurs |
| `.starts_with(prefix: string)` | `bool` | Prefix test |
| `.ends_with(suffix: string)` | `bool` | Suffix test |
| `.replace(old: string, new: string)` | `string` | Replace all non-overlapping occurrences |

```pyle
let s = "  Hello, Pyle  "

print(s.trim())              # Hello, Pyle
print(s.trim().upper())      # HELLO, PYLE
print("a,b,c".split(","))    # ["a", "b", "c"]
print("-".join([1, 2, 3]))   # 1-2-3
print("abc".slice(1, 3))     # bc
print("abc".slice(1..3))     # bc
print("hello".contains("ell"))
print("hello".replace("l", "L"))
```

Indexing returns a one-byte string:

```pyle
print("hello"[0])      # h
```

Slice clamping is shared with arrays: a negative `start` becomes 0, `end` is clamped to the length, and `start >= end` yields an empty result. `"hello".slice(1, -1)` is `""`.

There is no `*` repetition operator and no implicit concatenation. Use `+`.

## Arrays

Arrays are heterogeneous and resizable.

| Method | Returns | Description |
| --- | --- | --- |
| `.append(val)` | `none` | Add to the end |
| `.size()` | `int` | Element count |
| `.pop()` | `any` | Remove and return the last element |
| `.reverse()` | `none` | Reverse in place |
| `.slice(start: int, end: int)` | `array` | New sub-array |
| `.slice(range: range)` | `array` | New sub-array from a range |
| `.clear()` | `none` | Remove all elements |
| `.reserve(capacity: int)` | `none` | Pre-allocate capacity; negative raises `ArgumentError` |
| `.resize(new_size: int, default_value)` | `none` | Resize and fill new slots; negative raises `ArgumentError` |
| `.map(callback: function)` | `array` | New array with the callback applied |
| `.filter(callback: function)` | `array` | New array with elements where the callback is truthy |
| `.find(callback: function)` | `any` | First matching element, or `none` |
| `.index_of(value)` | `int?` | Index of the first equal element, or `none` |

```pyle
let nums = [1, 2, 3]
nums.append(4)
nums[0] = 10

print(nums)                     # [10, 2, 3, 4]
print(nums.pop())               # 4
print(nums.slice(1, 3))         # [2, 3]
print(nums.map(fn(n) => n * 2)) # [20, 4, 6]

let evens = nums.filter(fn(n) => n % 2 == 0)
let first = nums.find(fn(n) => n > 2)
print(nums.index_of(3))
```

`map`, `filter`, and `find` callbacks take exactly one argument, the element. A callback runtime error aborts the method and propagates.

There are no negative indices. Use `arr[arr.size() - 1]`. Out-of-bounds access and `pop()` on an empty array raise `IndexError`.

## Maps

Maps store key-value pairs. Keys can be strings, ints, floats, bools, and other hashable values. Arrays, maps, struct instances, and `BytesBuilder` cannot be keys.

| Method | Returns | Description |
| --- | --- | --- |
| `.size()` | `int` | Entry count |
| `.remove(key)` | `any` | Remove and return the value, or `none` |
| `.keys()` | `array` | Array of keys |
| `.values()` | `array` | Array of values |
| `.has(key)` | `bool` | Key existence check |
| `.clear()` | `none` | Remove all entries |

```pyle
let person = {name: "Ada", age: 36}

print(person.name)          # Ada
print(person["age"])        # 36

person["age"] = 37
person.city = "London"      # dot assignment writes the data key

print(person.has("city"))   # true
print(person.keys())
print(person.values())
print(person.remove("city"))
```

Map literals use `{key: value}`. A bare key is auto-quoted as a string. Computed keys are evaluated:

```pyle
let n = 5
let m = {answer: 42, 5 + 5: 10}
```

Missing keys behave differently by access form:

- `map["missing"]` raises `IndexError`.
- `map.missing` returns `none`.

Dot assignment writes a data key, so `map.size = 10` does not shadow the `size()` method.

## Equality

- Strings compare by content.
- Arrays and maps compare by identity, so `[] == []` is false.
- Ints and floats compare numerically across types.
- `true == 1` is false.

See [Types & Values](/language/types/#equality).

## Iteration

```pyle
for value in [10, 20] {
    print(value)
}

for byte in "hi" {
    print(byte)    # one-byte strings
}

for key in person.keys() {
    printf("{} = {}", key, person[key])
}
```

Maps are not directly iterable. Iterate `keys()` or `values()`.

## Related

- [Types & Values](/language/types/)
- [Built-in Functions](/stdlib/builtins/)
- [Bytes & BytesBuilder](/stdlib/bytes/)
