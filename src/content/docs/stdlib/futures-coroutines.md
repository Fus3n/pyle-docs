---
title: Futures & Coroutines
description: The Future and Coro types, and how async helpers schedule them.
---

Pyle's concurrency is cooperative and single-threaded. Coroutines yield explicitly, and futures signal completion.

## Coro

`Coro(fn)` wraps a function in a coroutine.

```pyle
let gen = Coro(fn() {
    let i = 0
    while i < 3 {
        yield i
        i += 1
    }
})

print(gen.resume())    # 0
print(gen.resume())    # 1
print(gen.resume())    # 2
print(gen.resume())    # none, the coroutine is dead
```

| Method | Returns | Description |
| --- | --- | --- |
| `resume(arg)` | `any` | Run until the next yield or return |
| `state()` | `string` | `"suspended"`, `"running"`, or `"dead"` |
| `error()` | `PCallError?` | `none`, or an error map if the coroutine died from a panic |

A value passed to `resume` becomes the result of the `yield` expression inside the coroutine.

```pyle
let c = Coro(fn() {
    let received = yield "ready"
    print(received)
})

print(c.resume())        # ready
c.resume("hello")        # hello
```

If the coroutine body panics, `c.state()` becomes `"dead"` and `c.error()` returns the error map.

## Future

`Future()` creates an unresolved handle.

```pyle
let f = Future()

f.resolve(42)
print(f.is_done)       # true
print(f.has_failed)    # false
print(f.data)          # 42
```

| Member | Returns | Description |
| --- | --- | --- |
| `resolve(value)` | `none` | Complete successfully |
| `reject(message)` | `none` | Complete with an error string |
| `set_cancel_hook(callback)` | `none` | Register what `cancel()` should do |
| `cancel()` | `bool` | Best-effort cancel |
| `is_done` | `bool` | Read-only |
| `has_failed` | `bool` | Read-only |
| `is_cancelled` | `bool` | Read-only |
| `data` | `any` | Resolved value |
| `error` | `string` | Error string when rejected |

```pyle
let f = Future()
f.reject("something went wrong")

print(f.has_failed)    # true
print(f.error)         # something went wrong
```

```pyle
let f = Future()
f.set_cancel_hook(fn() {
    print("cancelled")
})

print(f.cancel())      # true
print(f.is_cancelled)  # true
```

`cancel()` returns `false` when the future has no cancel hook or is already done. Native producers such as `http.get_async` install their own hooks, so cancelling the future aborts the underlying operation.

## waitfor

`waitfor(future)` suspends the current coroutine until the future completes. If the future was rejected, it raises `FutureRejected`.

```pyle
fn main() {
    let result = waitfor(os.sleep_async(1000))
    print("done")
}

async.run(main)
```

A function that calls `waitfor` must run inside `async.run`, `async.all`, or a coroutine that has a resumer. Calling it at top level with no coroutine produces an error.

## async.run

`async.run(task)` drives a function or coroutine to completion and returns its result.

```pyle
fn task() {
    waitfor(os.sleep_async(100))
    return "finished"
}

print(async.run(task))    # finished
```

A failed task's trace prints once at the escalation point when `async.run` re-raises.

## async.all

`async.all(tasks)` runs tasks concurrently and returns an array of outcomes.

```pyle
fn task_a() {
    waitfor(os.sleep_async(1000))
    return "a"
}

fn task_b() {
    waitfor(os.sleep_async(1000))
    return "b"
}

let results = async.all([task_a, task_b])

for result in results {
    if result.ok {
        print(result.value)
    } else {
        print(result.error)
    }
}
```

The two tasks overlap, so the total wait is about one second rather than two. Each result is `{ok: true, value}` or `{ok: false, error}`.

`async.all` collects failures without printing them. The failure's trace prints once at the escalation point when `async.run` re-raises or `waitfor` raises `FutureRejected`.

## Async producers in the core

| Producer | Returns |
| --- | --- |
| `os.sleep_async(ms)` | `Future` resolving after `ms` |
| `File.read_all_async()` and friends | `Future` resolving to the result |
| `proc.run_async(...)` | `Future` resolving to a process result |
| `Worker.recv_async()` | `Future` resolving to a string |
| `http.*_async(...)` | `Future` resolving to a response |

On `wasm32`, sleep and file async operations resolve synchronously because there are no threads.

## Practical patterns

### Bounded work

```pyle
fn worker(id) {
    waitfor(os.sleep_async(10))
    return id * 2
}

let tasks = [fn() { worker(1) }, fn() { worker(2) }, fn() { worker(3) }]
let results = async.all(tasks)
```

### Cancellation

```pyle
let f = http.get_async(url)
if not f.cancel() {
    print("already finished")
}
```

### Manual driving

```pyle
let c = Coro(fn() {
    while true {
        let cmd = yield
        if cmd == "stop" { return }
        print(cmd)
    }
})

c.resume()
c.resume("hello")
c.resume("stop")
print(c.state())    # dead
```

## Related

- [Coroutines & Async](/language/async/) for the language guide.
- [os](/stdlib/os/) for `sleep_async` and workers.
- [Files](/stdlib/files/) for async file operations.
