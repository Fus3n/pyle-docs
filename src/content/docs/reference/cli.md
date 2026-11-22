---
title: Command-Line Interface
description: Flags, stdin, exit codes, and argument handling for the pyle interpreter.
---

The `pyle` binary runs a script, reads one from stdin, or prints version and help information.

## Usage

```sh
pyle [options] [script] [args...]
```

| Flag | Description |
| --- | --- |
| `-h`, `--help` | Print usage and exit |
| `-v`, `--version` | Print version information and exit |
| `-d`, `--dissassamble` | Print the disassembled bytecode before running |

The misspelling `--dissassamble` is the actual flag name. `-d` is the short form.

```sh
pyle --version
# Pyle version 0.2.0 (abc1234)

pyle -d script.pyl
pyle script.pyl one two --flag
```

## Reading from stdin

Use `-` as the script path to read the program from stdin.

```sh
echo 'print("hi")' | pyle -
```

The virtual script name becomes `<stdin>` in error messages.

## Argument splitting

The interpreter uses a simple, predictable rule:

- Flags before the script path belong to `pyle`.
- The first non-flag token is the script path.
- Everything after the script path goes to the script verbatim, even `-d` or `--version`.
- `--` before the script forces positional parsing.

```sh
pyle -d script.pyl -v
```

Here `-d` is interpreted by `pyle`, and `-v` is passed to the script. Inside the script, `os.args` is `["-v"]`.

```pyle
let os = import("os")
print(os.args)
print(os.script_path())
print(os.script_dir())
```

## Exit codes

| Situation | Exit code |
| --- | --- |
| Successful run | `0` |
| `--version` or `--help` | `0` |
| No script given | `1` |
| Lex, parse, or compile error | `1` |
| Uncaught runtime panic | `1` |
| Script calls `exit(n)` | `n` |

`exit(code?)` exits immediately with the given code, defaulting to `0`.

```pyle
if not ok {
    exit(2)
}
```

## Declaration files

The interpreter refuses to run or import a `.d.pyl` file:

```text
Error: 'std/os.d.pyl' is a type definition file, not a script.
```

Declaration files are for editors and the language server.

## Import paths

The interpreter adds two directories to the import path:

- `std/` next to the executable.
- `./std/` relative to the current working directory.

That is how `import("worker")` finds `std/worker.pyl`. Add more with `add_import_path`.

## Globals set by the CLI

The CLI sets `PYLE_GIT_HASH` to the build's git hash. `PYLE_VERSION` is always available.

```pyle
printf("Pyle {} ({})", PYLE_VERSION, PYLE_GIT_HASH)
```

`PYLE_GIT_HASH` is only set by the CLI, not by `libpyle`.

## Environment variables

The interpreter does not require any environment variables. Worker processes are initialized from the spawn environment, so `os.is_worker()` and `os.worker_args()` work in the child.

## Related

- [os](/stdlib/os/) for `os.args`, `os.script_path()`, and `os.script_dir()`.
- [Bytecode & VM](/reference/bytecode/) for the `-d` output.
