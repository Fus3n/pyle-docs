---
title: Async & Threading
description: Bind native functions that resolve futures, and keep the VM thread-safe.
---

Pyle's async model is cooperative. A native function can return a `Future` immediately and resolve it from another thread. The VM's scheduler picks it up when the future completes.

## Creating a future

`pyle::Future::create(vm)` returns a `Value` handle for Pyle and a `std::shared_ptr<Future>` for the host:

```cpp
auto [value, future] = pyle::Future::create(vm);
```

The `Future` has:

| Member | Description |
| --- | --- |
| `future->resolve(Value)` | Complete successfully |
| `future->reject(vm, Value)` | Complete with an error value |
| `future->failed` | Set when rejected |
| `future->error` | Error string |
| `future->is_done()` | True after resolve or reject |
| `future->cancel(vm)` | Invoke the cancel hook, if any |
| `future->set_cancel_hook(fn)` | Register a C++ or Pyle cancel callback |

## A threaded native function

```cpp
pyle::Value fetch_data(pyle::VM& vm, pyle::ArgView args) {
    auto [value, future] = pyle::Future::create(vm);

    std::thread([future, &vm]() {
        std::this_thread::sleep_for(std::chrono::seconds(1));
        std::string result = "done";

        {
            std::lock_guard<std::recursive_mutex> lock(vm.get_mutex());
            future->resolve(pyle::Value(pyle::Value::Tag::StringRef,
                vm.intern_string(result)));
        }
    }).detach();

    return value;
}

pyle::bind_function<fetch_data>(interpreter.vm, "fetch_data");
```

```pyle
fn main() {
    let result = waitfor(fetch_data())
    print(result)
}

async.run(main)
```

The native function returns the future immediately. `waitfor` suspends the coroutine until the future resolves. The thread locks `vm.get_mutex()` before touching the future, because the VM may be running on another thread.

## Background ticks

The VM runs background ticks while it waits. Register a tick with `background_ticks()`:

```cpp
pyle::background_ticks().push_back([](pyle::VM& vm, pyle::ArgView) -> pyle::Value {
    // poll timers, pump servers, check worker pipes
    return pyle::Value();
});
```

Ticks run during `waitfor` and other suspension points. They are the hook used by `http.Server` and the `os` worker API.

## Ready tasks

`ready_tasks()` is a deque of values that the scheduler should resume. `ready_tasks_owner()` records which coroutine owns the queue. Native code can push a task and let the scheduler drive it:

```cpp
pyle::ready_tasks().push_back(some_value);
```

Most embedders do not need to touch this directly; `Future::create` and the async natives use it internally.

## Thread safety

The VM is not thread-safe by default. Any native callback that may run on another thread must lock `vm.get_mutex()` before calling VM methods or touching heap values:

```cpp
std::lock_guard<std::recursive_mutex> lock(vm.get_mutex());
```

The mutex is recursive, so a callback that calls back into the VM can lock it again. `BulkAlloc` skips the mutex for single-threaded bulk allocation; do not use it from a threaded callback.

## Async file and sleep

`os.sleep_async` and the async `File` methods return futures. On `wasm32` they resolve synchronously because there are no threads. On native builds they use the same background tick mechanism.

## Related

- [Values & Conversions](/embedding/values/) for `Value` and ownership.
- [Futures & Coroutines](/stdlib/futures-coroutines/) for the Pyle-side API.
- [Coroutines & Async](/language/async/) for the language guide.
