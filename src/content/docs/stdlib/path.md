---
title: path
description: Pure string path manipulation with no syscalls.
---

```pyle
let path = import("path")
```

`path` operates on strings only. It never touches the filesystem, so it works identically on every platform and in the browser.

| Function | Returns | Description |
| --- | --- | --- |
| `join(a: string, b: string, ...)` | `string` | Join segments with the platform separator |
| `basename(path: string)` | `string` | Final component, including the extension |
| `dirname(path: string)` | `string` | Parent directory |
| `extension(path: string)` | `string` | Extension including the leading dot |
| `stem(path: string)` | `string` | Final component without the extension |
| `normalize(path: string)` | `string` | Collapse `.`, `..`, and duplicate separators |
| `absolute(path: string)` | `string` | Absolute form of a relative path |
| `is_absolute(path: string)` | `bool` | True when the path is absolute |
| `sep: string` | `string` | Platform separator string |

```pyle
path.join("a", "b", "c")        # "a/b/c" on POSIX, "a\\b\\c" on Windows
path.basename("/a/b/c.txt")     # "c.txt"
path.dirname("/a/b/c.txt")      # "/a/b"
path.extension("/a/b/c.txt")    # ".txt"
path.stem("/a/b/c.txt")         # "c"
path.normalize("a//b/../c")     # "a/c"
path.absolute("foo/bar")        # absolute path
path.is_absolute("/a")          # true on POSIX
path.sep                        # "/" or "\\"
```

## Notes

- `path.join` uses the host separator. If you need to build URLs, join with `"/"` manually.
- `path.extension` returns an empty string when there is no dot in the final component.
- `path.absolute` resolves against the current working directory. It does not require the path to exist.
- The module is pure: no permissions, no network, no filesystem access.

## Related

- [fs](/stdlib/fs/) for operations that do touch the filesystem.
- [os](/stdlib/os/) for the current directory.
