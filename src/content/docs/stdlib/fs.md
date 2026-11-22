---
title: fs
description: Filesystem queries, directory operations, and whole-file helpers.
---

```pyle
let fs = import("fs")
```

`fs` is a core module. It wraps the C++ filesystem library and works in a library-only build.

## Queries

| Function | Returns | Description |
| --- | --- | --- |
| `exists(path: string)` | `bool` | True if the path exists |
| `is_file(path: string)` | `bool` | True if the path is a regular file |
| `is_dir(path: string)` | `bool` | True if the path is a directory |
| `file_size(path: string)` | `int?` | Size in bytes, or `none` if missing |
| `modified(path: string)` | `int?` | Modification time as epoch seconds, or `none` if missing |

## Directories

| Function | Returns | Description |
| --- | --- | --- |
| `mkdir(path: string)` | `bool` | Create the directory and any missing parents; returns bool |
| `listdir(path: string)` | `array[string]` | Array of entry names; raises if not a directory |
| `walk(path: string)` | `array[string]` | Recursive array of paths relative to `path` |
| `glob(pattern: string)` | `array[string]` | Array of paths in the pattern directory matching the file name |

```pyle
let entries = fs.listdir("src")
for name in entries {
    print(name)
}

let scripts = fs.glob("src/*.pyl")
print(scripts)

for relative in fs.walk("examples") {
    print(relative)
}
```

`fs.listdir` returns names only, not full paths, and does not include `.` or `..`. `fs.walk` always recurses and returns paths relative to the root. `fs.glob` matches the final path component against `*` and `?` only; it does not recurse, and `**` is not special. Neither `listdir`, `walk`, nor `glob` sorts; their order is filesystem-dependent.

## Mutation

| Function | Returns | Description |
| --- | --- | --- |
| `remove(path: string)` | `bool` | Remove a file or empty directory; returns bool |
| `remove_all(path: string)` | `bool` | Recursively remove a file or directory; returns bool |
| `rename(src: string, dst: string)` | `bool` | Rename or move; returns bool |
| `copy(src: string, dst: string)` | `bool` | Copy a file; returns bool |

## Whole-file helpers

| Function | Returns | Description |
| --- | --- | --- |
| `read_file(path: string)` | `string?` | File contents as a string, or `none` if missing |
| `write_file(path: string, data: string)` | `bool` | Replace file contents; returns bool |
| `append_file(path: string, data: string)` | `bool` | Append to a file; returns bool |

```pyle
fs.write_file("out.txt", "hello\n")
fs.append_file("out.txt", "world\n")

let text = fs.read_file("out.txt")
print(text)
```

## Errors and return values

- Boolean-returning functions report failure as `false` rather than raising. Check the result when the failure matters.
- `fs.listdir` and `fs.walk` raise `ArgumentError` when the path is not a directory.
- `fs.read_file` returns `none` when the file is missing or unreadable.
- Paths are strings; use [`path`](/stdlib/path/) to build them portably.

## Playground notes

The browser playground uses Emscripten's in-memory filesystem. Files written by a script exist only for that run and are discarded when the page reloads. The standard library files bundled into the build are readable.

## Related

- [Files](/stdlib/files/) for streaming reads and writes with `File`.
- [path](/stdlib/path/) for string path manipulation.
