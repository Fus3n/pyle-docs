---
title: Coroutines & Async
description: Cooperative coroutines, futures, waitfor, async.run, and async.all.
---

Pyle coroutines are cooperative and single-threaded. You can drive them one step at a time, or let the prelude's async helpers run them to completion.

## Creating a coroutine

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
print(gen.state())     # dead
```

`resume(value?)` runs until the coroutine yields or returns. A value passed to `resume` becomes the result of the `yield` expression inside the coroutine.

```pyle
let c = Coro(fn() {
    let received = yield "ready"
    print(received)
})

print(c.resume())        # ready
c.resume("hello")        # hello
```

## Coroutine state

`state()` returns `"suspended"`, `"running"`, or `"dead"`. `error()` returns `none`, or an error map if the coroutine died from a panic.

```pyle
let c = Coro(fn() {
    yield
})

print(c.state())    # suspended
c.resume()
print(c.state())    # dead
```

## Futures

`Future()` creates a result handle with `resolve`, `reject`, and `cancel`.

```pyle
let f = Future()
f.resolve(42)

print(f.is_done)     # true
print(f.has_failed)  # false
print(f.data)        # 42
```

A rejected future carries an error string.

```pyle
let f = Future()
f.reject("something went wrong")

print(f.has_failed)  # true
print(f.error)       # something went wrong
```

Producers can register a cancel hook:

```pyle
let f = Future()
f.set_cancel_hook(fn() {
    print("cancelled")
})

print(f.cancel())    # true
print(f.is_cancelled)
```

## waitfor

`waitfor(future)` yields the current coroutine until the future completes. If the future was rejected, it raises `FutureRejected`.

```pyle
fn main() {
    let result = waitfor(os.sleep_async(1000))
    print("done")
}

async.run(main)
```

A function that calls `waitfor` must run inside `async.run` or `async.all`, or inside a coroutine that has a resumer.

## async.run

`async.run` drives a function or coroutine to completion and returns its result.

```pyle
fn task() {
    waitfor(os.sleep_async(100))
    return "finished"
}

print(async.run(task))
```

## async.all

`async.all` runs several tasks concurrently and collects their outcomes.

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

`async.all` collects failures without printing them. A failure's trace prints once at the escalation point when `async.run` re-raises or `waitfor` raises `FutureRejected`.

## Async file operations

`File` has async variants that return a `Future`:

```pyle
let f = File.open("data.txt", "r")
let content = waitfor(f.read_all_async())
print(content)
f.close()
```

On `wasm32`, these resolve synchronously because threads are unavailable.

## Next steps

- [Futures & Coroutines](/stdlib/futures-coroutines/) for the type reference.
- [os](/stdlib/os/) for `sleep_async` and worker APIs.
- [Error Handling](/language/errors/) for `pcall` and error maps.
