---
title: Files
description: Streaming file I/O with the File type.
---

`File.open(path, mode)` returns a `File`. Use it when you need streaming reads, writes, seeking, or binary data. For whole-file operations, [`fs.read_file`](/stdlib/fs/#whole-file-helpers) and `fs.write_file` are simpler.

## Opening

```pyle
let f = File.open("data.txt", "r")
```

| Mode | Meaning |
| --- | --- |
| `r` | Read text |
| `w` | Write text, truncating |
| `a` | Append text |
| `rb` | Read binary |
| `wb` | Write binary, truncating |
| `ab` | Append binary |

On Windows, text modes translate line endings. Use the binary modes when byte-for-byte content matters.

## Reading

| Method | Returns | Description |
| --- | --- | --- |
| `File.open(path: string, mode: string)` | `File` | Open a file |
| `read_line()` | `string?` | Read one line, or `none` at EOF |
| `read_all()` | `string` | Read all remaining content as a string |
| `read_bytes(count: int?)` | `bytes` | Read up to `count` bytes, or all remaining bytes |
| `size()` | `int` | File size in bytes |
| `tell()` | `int` | Current position |
| `seek(offset: int, origin: int)` | `none` | Move the position; origin `0` = start, `1` = current, `2` = end |
| `close()` | `none` | Close the file |

```pyle
let f = File.open("data.txt", "r")

let line = f.read_line()
while line != none {
    print(line)
    line = f.read_line()
}

f.close()
```

```pyle
let f = File.open("image.bin", "rb")
let header = f.read_bytes(16)
print(header.size())
f.close()
```

## Writing

| Method | Returns | Description |
| --- | --- | --- |
| `write(text: string)` | `none` | Write a string |
| `write_bytes(data: bytes)` | `none` | Write a `Bytes` value |

```pyle
let f = File.open("out.txt", "w")
f.write("hello\n")
f.write("world\n")
f.close()
```

```pyle
let payload = Bytes([0, 1, 2, 255])
let f = File.open("out.bin", "wb")
f.write_bytes(payload)
f.close()
```

## Seeking

```pyle
let f = File.open("data.bin", "rb")
f.seek(4, 0)
print(f.tell())    # 4

let chunk = f.read_bytes(8)
f.seek(-8, 2)      # last 8 bytes, with negative offset from the end
f.close()
```

## Async variants

Each blocking operation has an async form that returns a `Future`:

| Method | Returns | Description |
| --- | --- | --- |
| `read_line_async()` | `Future` | Resolves to a line or `none` |
| `read_all_async()` | `Future` | Resolves to a string |
| `write_async(text: string)` | `Future` | Resolves when the write completes |
| `read_bytes_async(count: int?)` | `Future` | Resolves to `Bytes` |
| `write_bytes_async(data: bytes)` | `Future` | Resolves when the write completes |

```pyle
let f = File.open("data.txt", "r")
let content = waitfor(f.read_all_async())
print(content)
f.close()
```

On `wasm32`, these resolve synchronously because threads are unavailable.

## Closing

`f.close()` releases the handle. A `File` also closes when it is collected, but explicit closes are better: they release the operating system handle immediately and make the intent clear.

```pyle
let f = File.open("out.txt", "w")
f.write("data")
f.close()
```

## Playground notes

The browser playground uses an in-memory filesystem. Files you create exist only for that run and disappear on reload. Reading a path that was not created in the same run raises an error.

## Related

- [fs](/stdlib/fs/) for whole-file helpers and directory operations.
- [Bytes & BytesBuilder](/stdlib/bytes/) for binary data.
- [Futures & Coroutines](/stdlib/futures-coroutines/) for awaiting async operations.
