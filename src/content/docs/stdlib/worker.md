---
title: worker
description: A multi-process worker pool written in Pyle.
---

```pyle
let worker = import("worker")
```

`worker` is a Pyle module that ships with the interpreter as `std/worker.pyl`. It builds on `os.spawn_worker` and depends on `json`. A bare `libpyle` embedder does not get it unless it registers `json` and provides the module file.

## Parent side

```pyle
let worker = import("worker")

let pool = worker.start("worker.pyl", 4, [])
let results = pool.map(tasks, 5000)
let codes = pool.stop()
```

| Function | Returns | Description |
| --- | --- | --- |
| `start(script: string, count: int, args: array[string])` | `Pool` | Spawn `count` workers running `script`; returns a `Pool` |
| `Pool.size()` | `int` | Number of workers |
| `Pool.map(tasks: array, timeout_ms: int)` | `array` | Send each task as JSON and collect the results |
| `Pool.stop()` | `array[int]` | Kill all workers and return their wait codes |
| `serve(handler: function, timeout_ms: int)` | `bool` | Loop until timeout; `false` on a receive timeout |

`pool.map` sends each task with `json.stringify`, reads replies in waves the size of the pool, and parses each reply with `json.parse`. A timed-out reply becomes `none` in the result array.

```pyle
let tasks = [1, 2, 3, 4, 5, 6, 7, 8]
let squared = pool.map(tasks, 5000)

for value in squared {
    print(value)
}
```

## Worker side

```pyle
let worker = import("worker")

worker.serve(fn(task) {
    return task * task
}, -1)
```

`worker.serve(handler, timeout_ms)` loops forever (or until the timeout), parsing each request, calling the handler, and stringifying the result. It returns `false` on a receive timeout.

The handler receives the decoded JSON value and may return any JSON-serializable value. Returning `none` produces `null`, which `pool.map` turns back into `none`.

## Protocol

Under the hood the pool uses the `os` worker channel:

- Length-prefixed string frames over two pipes.
- Maximum frame size of 64 MiB.
- `send` and `recv` carry strings only; JSON is the serialization layer.
- The child's normal stdout is not the channel, so `print` is safe for logging.

## Notes

- `worker.start` only spawns Pyle workers. It never launches an arbitrary executable.
- `pool.map` preserves task order in its result array.
- Use `timeout_ms: -1` to wait indefinitely.
- `worker` is not available on `wasm32` or in the playground.

## Related

- [os](/stdlib/os/) for the raw `Worker` API.
- [json](/stdlib/json/) for the serialization format.
- [proc](/stdlib/proc/) for spawning non-Pyle programs.
