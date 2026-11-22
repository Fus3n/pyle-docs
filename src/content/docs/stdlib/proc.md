---
title: proc
description: Spawn programs, capture output, and drive interactive pipes.
---

```pyle
let proc = import("proc")
```

`proc` is a core module, but it is only registered when process support is compiled in. It is unavailable on `wasm32` and in the browser playground.

## Running a program

```pyle
let proc = import("proc")

let r = proc.run("git", ["--version"])
print(r.code)                  # 0
print(r.stdout.to_string())    # git version ...
print(r.stderr.to_string())
print(r.timed_out)             # false
```

| Field | Type | Description |
| --- | --- | --- |
| `code` | `int?` | Exit code, `none` when killed on timeout, negative for signal death |
| `stdout` | `bytes` | Captured stdout as `Bytes` |
| `stderr` | `bytes` | Captured stderr as `Bytes` |
| `timed_out` | `bool` | True when the timeout fired |

The result shape is always `{code, stdout, stderr, timed_out}`.

| Function | Returns | Description |
| --- | --- | --- |
| `run(program: string, args: array[string]?, options: map?)` | `ProcResult` | Run a program and wait for it |
| `popen(program: string, args: array[string]?, options: map?)` | `Child` | Start an interactive child process |
| `run_async(program: string, args: array[string]?, options: map?)` | `Future` | Run a program asynchronously |

### Options

| Key | Description |
| --- | --- |
| `cwd` | Working directory |
| `env` | Map merged over the parent environment; a `none` value removes a variable |
| `clear_env` | Start with an empty environment |
| `stdin` | String or `Bytes` fed to the child; closes stdin after writing |
| `timeout_ms` | Kill after this many milliseconds; `-1` waits forever |

```pyle
let r = proc.run("cat", [], {stdin: "hello\n"})
print(r.stdout.to_string())    # hello

let slow = proc.run("sleep", ["5"], {timeout_ms: 500})
print(slow.timed_out)          # true
```

## No shell

`proc.run(program, args)` executes the program directly, with a PATH search. There is no shell, so pipes, globs, and redirection are not interpreted.

If you need shell features, spawn the shell explicitly and write commands to its stdin. Pyle has no ternary operator, so choose the shell with a normal branch:

```pyle
let shell = "sh"
if os.platform() == "windows" {
    shell = "cmd"
}

let sh = proc.popen(shell, [])
```

## Interactive children

`proc.popen(program, args, options?)` returns a `Child`.

| Method | Returns | Description |
| --- | --- | --- |
| `pid()` | `int` | Child process id |
| `alive()` | `bool` | True while the child is running |
| `poll()` | `int?` | Exit code, or `none` while running |
| `wait(timeout_ms: int?)` | `int?` | Block for exit; `none` on timeout |
| `stdin_write(data: string \| bytes)` | `bool` | Write a string or `Bytes` |
| `stdin_close()` | `bool` | Close stdin so the child sees EOF |
| `stdout_read(max_bytes: int?, timeout_ms: int?)` | `bytes?` | `Bytes`, `none` on timeout, empty `Bytes` on EOF |
| `stderr_read(max_bytes: int?, timeout_ms: int?)` | `bytes?` | Same, for stderr |
| `communicate(input: string \| bytes?, timeout_ms: int?)` | `ProcResult` | Write input, close stdin, drain both streams, wait |
| `terminate()` | `bool` | SIGTERM |
| `kill()` | `bool` | SIGKILL |

```pyle
let c = proc.popen("python", ["-i"])
c.stdin_write("print(1 + 1)\n")
c.stdin_close()

let out = c.stdout_read(4096, 2000)
if out != none {
    print(out.to_string())
}
print(c.wait())
```

`communicate` is the deadlock-free way to feed input and collect both streams for a process that produces a lot of output. `run` and `communicate` drain stdout and stderr on separate threads so large output cannot fill a pipe and stall the child.

## Async

`proc.run_async(program, args, options?)` returns a `Future` that resolves to the usual result map. Cancelling the future kills the child.

```pyle
let f = proc.run_async("git", ["fetch"])
let result = waitfor(f)
print(result.code)
```

## Notes

- `proc.run` is for one-shot commands. Use `popen` for long-lived interactive processes.
- `timeout_ms` on `run` and `communicate` is the only built-in timeout. For `popen`, pass timeouts to the read and wait calls.
- Output is returned as `Bytes`, so binary-safe. Call `.to_string()` only when you know the output is text.
- `proc` is not available in the playground. The playground is a `libpyle` build without process support.

## Related

- [os](/stdlib/os/) for the higher-level Pyle worker API.
- [Bytes & BytesBuilder](/stdlib/bytes/) for output handling.
