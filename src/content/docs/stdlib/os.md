---
title: os
description: Time, environment, paths, sleeping, and process information.
---

```pyle
let os = import("os")
```

`os` is a core module: it is part of `libpyle` and is available to every embedder that registers the core natives.

## Time

| Function | Returns | Description |
| --- | --- | --- |
| `time()` | `float` | Monotonic interval clock in float seconds. Not wall time; use it for durations |
| `epoch()` | `int` | Unix time in whole seconds (wall clock) |
| `clock()` | `float` | CPU seconds used by the process |
| `difftime(t2: int | float, t1: int | float)` | `float` | `t2 - t1` in seconds, as a float |
| `sleep(ms: int)` | `none` | Block the current thread for `ms` milliseconds |
| `sleep_async(ms: int)` | `Future` | Return a `Future` that resolves after `ms` |
| `date()` | `string` | Local time as `"YYYY-MM-DD HH:MM:SS"` |
| `strftime(format: string, timestamp: int | float?)` | `string` | Format epoch seconds with `strftime` codes; defaults to now |
| `strptime(date: string, format: string)` | `int` | Parse a date string into epoch seconds; raises on mismatch |
| `parse_date(s: string)` | `Date` | Auto-detect common date shapes and return a `Date` struct |
| `localtime(epoch: int | float)` | `Date` | `Date` struct in local time |
| `gmtime(epoch: int | float)` | `Date` | `Date` struct in UTC |
| `timezone()` | `int` | Local offset from UTC in seconds, positive east |

```pyle
let start = os.time()
os.sleep(100)
printf("slept {:.3f}s", os.time() - start)

print(os.date())
print(os.strftime("%Y-%m-%d", os.epoch()))

let d = os.parse_date("2026-11-21")
printf("{}-{:02d}-{:02d}", d.year, d.month, d.day)
```

`os.parse_date` tries `%Y-%m-%d %H:%M:%S`, `%Y-%m-%d`, `%m/%d/%Y`, `%m-%d-%Y`, `%b %d, %Y`, and `%B %d, %Y`, in that order. Ambiguous numeric dates are month-first, so `10/11/2026` is October 11. It returns a strict `Date` struct with `year`, `month`, `day`, `hour`, `min`, `sec`, and `epoch` fields; reading an unknown field raises `NameError`.

## Environment

| Function | Returns | Description |
| --- | --- | --- |
| `getenv(name: string)` | `string?` | Value string, or `none` if unset |
| `setenv(name: string, value: string)` | `bool` | Set a variable; returns bool |
| `unsetenv(name: string)` | `bool` | Remove a variable; returns bool |
| `environ()` | `map` | Map of all environment variables |
| `cwd()` | `string?` | Current working directory, or `none` |
| `chdir(path: string)` | `bool` | Change directory; returns bool |
| `home()` | `string?` | Home directory, or `none` |
| `tempdir()` | `string?` | System temp directory, or `none` |
| `tmpname()` | `string` | Create and return a unique temp file path |

```pyle
let home = os.getenv("HOME") or os.getenv("USERPROFILE")
print(home)
```

## Process and system information

| Function | Returns | Description |
| --- | --- | --- |
| `pid()` | `int` | Current process id |
| `platform()` | `string` | `"windows"`, `"linux"`, `"macos"`, `"wasm"`, or `"unknown"` |
| `arch()` | `string` | `"wasm32"`, `"wasm64"`, `"x86_64"`, `"aarch64"`, `"x86"`, or `"unknown"` |
| `hostname()` | `string?` | Machine name, or `none` |
| `username()` | `string?` | Current user name, or `none` |
| `cpu_count()` | `int` | Logical core count |
| `system(cmd: string)` | `int` | Run a shell command; returns the exit code. No shell exists on `wasm32`, so it returns `-1` |

```pyle
printf("{} / {} / {}", os.platform(), os.arch(), os.cpu_count())
```

## Script arguments and paths

| Name | Type | Description |
| --- | --- | --- |
| `args` | `array[string]` | Array of arguments after the script path |
| `script_path()` | `string` | Path of the running script as invoked; empty when none |
| `script_dir()` | `string` | Directory of the script; `"."` when it has no directory |

Flags before the script belong to the interpreter. Everything after the script path goes to `os.args` verbatim, including `-d` and `--version`. A `--` before the script forces positional parsing.

```sh
pyle script.pyl one two --flag
```

```pyle
print(os.args)    # ["one", "two", "--flag"]
```

## Workers

These functions are available when process support is compiled in. They spawn Pyle worker processes, never arbitrary executables.

| Function | Returns | Description |
| --- | --- | --- |
| `spawn_worker(script: string, args: array[string])` | `Worker` | Spawn a worker running `script`; returns a `Worker` |
| `is_worker()` | `bool` | True inside a spawned worker |
| `worker_args()` | `array[string]` | Spawn arguments, worker side |
| `worker_send(msg: string)` | `bool` | Send a string to the parent; returns bool |
| `worker_recv(timeout_ms: int)` | `string?` | Receive a string from the parent, or `none` on timeout |
| `Worker.pid()` | `int` | Worker process id |
| `Worker.send(msg: string)` | `bool` | Parent to worker; returns bool |
| `Worker.recv(timeout_ms: int)` | `string?` | Worker to parent; `none` on timeout or EOF |
| `Worker.recv_async()` | `Future` | Resolves to a string |
| `Worker.alive()` | `bool` | True while the worker is running |
| `Worker.wait()` | `int` | Block for exit and return the exit code |
| `Worker.kill()` | `bool` | Terminate the worker |

```pyle
let p = os.spawn_worker("worker.pyl", ["id-0"])
p.send("hello")
print(p.recv(1000))
print(p.wait())
```

The worker channel carries length-prefixed strings over two pipes, with a maximum frame size of 64 MiB. Serialize structured data yourself; the bundled [`worker`](/stdlib/worker/) module does this with JSON. The child's normal stdout is not the channel.

See [worker](/stdlib/worker/) for the higher-level pool.

## Platform notes

- On `wasm32`, process support is disabled, so `os.spawn_worker` and the `Worker` API are not registered. `os.sleep_async` resolves synchronously because there are no threads.
- In the browser playground, the environment functions report what Emscripten provides: `os.platform()` is `"wasm"`, `os.arch()` is `"wasm32"`, `os.hostname()` is `"emscripten"`, `os.pid()` is a fixed value, and `os.environ()` holds the Emscripten defaults (`HOME=/home/web_user`, `PATH=/`, `USER=web_user`). `os.system` returns `-1` because there is no shell.
- `os.sleep` blocks the worker, so the playground's 8-second timer still applies to it.
- Filesystem writes stay in the in-memory FS and are discarded when the page reloads.
- `os.time()` is not Unix time. If you need a timestamp, use `os.epoch()`.

## Related

- [path](/stdlib/path/) for path string manipulation.
- [fs](/stdlib/fs/) for filesystem operations.
- [proc](/stdlib/proc/) for spawning arbitrary programs.
