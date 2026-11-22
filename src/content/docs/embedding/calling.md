---
title: Calling into Pyle
description: Call Pyle functions and methods from C++ and handle the results.
---

The host can call any Pyle callable through the VM. `get_global` fetches a global by name, and `call_func` converts arguments and dispatches.

## Calling a global function

```cpp
pyle::Value fn = interpreter.vm.get_global("my_func");
pyle::Value result = interpreter.vm.call_func(fn, 42, "hello");

double value = pyle::from_value<double>(interpreter.vm, result);
```

`call_func` converts each C++ argument with `to_value` and dispatches to the matching call path. It returns a `Value`; convert it with `from_value` when you need a concrete C++ type.

If the global does not exist, `get_global` returns `none`. Calling `none` raises a Pyle `TypeError`.

## Call variants

| Method | Use |
| --- | --- |
| `call_func(callee, args...)` | Convert arguments and call |
| `call_func1(callee, arg)` | One argument, zero-allocation path |
| `call_func_n(callee, args, count)` | Pre-built argument array |
| `call_func_raw(callee, vector<Value>)` | Already-converted `Value` arguments |

```cpp
std::vector<pyle::Value> args = {
    pyle::Value(static_cast<int64_t>(5))
};
pyle::Value result = interpreter.vm.call_func_raw(fn, args);
```

`call_func_raw` does not convert arguments, so it is useful when you already have `Value` objects. It allocates a synthetic chunk per call; prefer `call_func` on hot paths.

## Calling methods

The VM's method-call convention passes the receiver implicitly, so a method is not an ordinary global callable. From C++, the practical options are:

- Call a global function that performs the method call on the instance.
- Fetch the method from the struct type and invoke it with the receiver's `HeapIdx`.

```cpp
pyle::Value instance = interpreter.vm.get_global("player");
auto& s = std::get<pyle::Struct>(interpreter.vm.get_heap_object(instance.as_ref).data);
auto& type = std::get<pyle::StructType>(interpreter.vm.get_heap_object(s.type_idx).data);

HeapIdx name_id = interpreter.vm.intern_string("status");
auto it = type.methods.find(name_id);
if (it != type.methods.end()) {
    auto& method = std::get<pyle::NativeMethod>(
        interpreter.vm.get_heap_object(it->second).data);
    pyle::Value result = method.fn(interpreter.vm, instance.as_ref, {nullptr, 0});
}
```

For most hosts, binding a free function that takes the object as an argument is simpler than reaching into the struct type.

## pcall: catching a panic

`call_func` lets a panic propagate and print an error report. `pcall_invoke` installs a catch checkpoint and returns a result map instead:

```cpp
pyle::Value result = interpreter.vm.pcall_invoke(fn, nullptr, 0);
```

The result is a map with `ok` and either `value` or `error`. Access the entries directly:

```cpp
auto& entries = std::get<pyle::MapObject>(
    interpreter.vm.get_heap_object(result.as_ref).data).entries;

auto ok = entries[pyle::Value(pyle::Value::Tag::StringRef,
    interpreter.vm.intern_string("ok"))];

if (pyle::from_value<bool>(interpreter.vm, ok)) {
    pyle::Value value = entries[pyle::Value(pyle::Value::Tag::StringRef,
        interpreter.vm.intern_string("value"))];
} else {
    pyle::Value error = entries[pyle::Value(pyle::Value::Tag::StringRef,
        interpreter.vm.intern_string("error"))];
    std::string type = pyle::from_value<std::string>(interpreter.vm,
        std::get<pyle::MapObject>(interpreter.vm.get_heap_object(error.as_ref).data)
            .entries[pyle::Value(pyle::Value::Tag::StringRef,
                interpreter.vm.intern_string("type"))]);
    std::string message = pyle::from_value<std::string>(interpreter.vm,
        std::get<pyle::MapObject>(interpreter.vm.get_heap_object(error.as_ref).data)
            .entries[pyle::Value(pyle::Value::Tag::StringRef,
                interpreter.vm.intern_string("message"))]);
}
```

`pcall_invoke` takes a `const Value*` argument array and a count. It does not print the trace.

## Printing and re-raising errors

`print_trace` prints an error map using the runtime error format:

```cpp
interpreter.vm.print_trace(error);
```

`raise_error` re-raises an error map or a message string with its trace preserved:

```cpp
interpreter.vm.raise_error(error);
```

## Checking the panic flag

After `execute` or a call, `vm.is_panicked()` reports whether a runtime error occurred. Use it to decide whether to keep using the interpreter or reset it.

```cpp
if (interpreter.vm.is_panicked()) {
    // the VM is in a panic state; further calls are not meaningful
}
```

## Example

```cpp
pyle::Value fn = interpreter.vm.get_global("calculate_factorial");
if (fn.tag == pyle::Value::Tag::None) {
    return 1;
}

pyle::Value result = interpreter.vm.call_func(fn, 5);
double value = pyle::from_value<double>(interpreter.vm, result);
```

## Related

- [Free Functions](/embedding/functions/) for the reverse direction.
- [Values & Conversions](/embedding/values/) for `from_value` and `to_value`.
- [Error Handling](/language/errors/) for the Pyle-side `pcall` shape.
