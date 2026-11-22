---
title: Bytes & BytesBuilder
description: Immutable byte buffers and a mutable writer for binary data.
---

Pyle strings are byte strings, but they are also interned and immutable. `Bytes` and `BytesBuilder` are the types to use for binary protocols, files, and hashing.

## Bytes

`Bytes(array)` creates an immutable byte buffer from an array of ints.

```pyle
let b = Bytes([72, 101, 108, 108, 111])
print(b.size())          # 5
print(b[0])              # 72, an int
print(b.to_string())     # Hello
```

Byte values must be 0-255. `Bytes([300])` and `Bytes([-1])` raise `RuntimeError`.

| Method | Returns | Description |
| --- | --- | --- |
| `.size()` | `int` | Byte count |
| `.to_string()` | `string` | Raw byte-preserving copy into a string |
| `.to_int_le()` | `int` | Read an int64 little-endian; requires exactly 8 bytes |
| `.to_int_be()` | `int` | Read an int64 big-endian; requires exactly 8 bytes |
| `.to_float_le()` | `float` | Read a float64 little-endian; requires exactly 8 bytes |
| `.to_float_be()` | `float` | Read a float64 big-endian; requires exactly 8 bytes |

```pyle
let header = Bytes([1, 0, 0, 0, 0, 0, 0, 0])
print(header.to_int_le())    # 1
print(header.to_int_be())    # 72057594037927936
```

`to_string` does not validate UTF-8. It copies the raw bytes; interpreting them is up to you.

Indexing returns an int, and out-of-bounds access is a runtime error. Iterating yields ints:

```pyle
for byte in Bytes([65, 66]) {
    print(byte)    # 65, 66
}
```

## BytesBuilder

`BytesBuilder(capacity?)` creates a mutable byte writer. It has no indexed access; reading is done through `to_bytes()` or `to_string()`.

| Method | Returns | Description |
| --- | --- | --- |
| `.push(b: int)` | `int` | Append one byte (0-255); returns the new size |
| `.extend_array(arr: array[int])` | `int` | Append packed bytes from an int array; returns the new size |
| `.reserve(n: int)` | `int` | Ensure capacity for `n` bytes; returns the capacity |
| `.size()` | `int` | Current byte count |
| `.to_string()` | `string` | Raw copy into a string; the builder is unchanged |
| `.to_bytes()` | `Bytes` | Move the bytes into `Bytes`; the builder is emptied and reusable |

```pyle
let b = BytesBuilder()
b.push(72)
b.extend_array([101, 108, 108, 111])

let hello = b.to_bytes()
print(hello.to_string())    # Hello
print(b.size())             # 0, the builder was emptied
```

```pyle
let b = BytesBuilder(1024)
b.reserve(4096)
b.push(255)

let text = b.to_string()    # copy, builder still holds the byte
print(b.size())             # 1
```

## Choosing between them

- Use `Bytes` when the data is final and should not change.
- Use `BytesBuilder` when appending incrementally.
- Use `.extend_array(chunk)` rather than calling `.push()` per byte; it is one native call per chunk.
- Use `crypto.to_hex(bytes)` to inspect binary data as text.

## Related

- [Strings, Arrays & Maps](/stdlib/strings-arrays-maps/)
- [Files](/stdlib/files/) for `read_bytes` and `write_bytes`
- [crypto](/stdlib/crypto/) for digests and random bytes
