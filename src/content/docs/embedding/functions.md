---
title: Free Functions
description: Bind C++ free functions to Pyle with automatic argument and return conversion.
---

The simplest binding is a free function. `pyle::bind_function` wraps a function pointer so Pyle can call it, converting arguments and the return value automatically.

```cpp
int add(int a, int b) {
    return a + b;
}

pyle::bind_function<&add>(interpreter.vm, "add");
```

```pyle
print(add(3, 4))    # 7
```

## Supported signatures

`bind_function` accepts any of these shapes:

| Signature | Notes |
| --- | --- |
| `Ret(Args...)` | Ordinary free function |
| `Ret(VM&, Args...)` | Receives the VM as the first argument |
| `Ret(VM&, ArgView)` | Raw form: inspect and convert `args` yourself |
| `void` return | Returns `none` |

The wrapper checks the argument count and raises `ArgumentError` on a mismatch. It catches `std::exception` and re-raises it as a Pyle `RuntimeError`, so a C++ exception does not unwind through the VM.

```cpp
std::string greet(std::string name) {
    return "hello, " + name;
}

pyle::bind_function<&greet>(interpreter.vm, "greet");
```

## Argument and return conversion

Arguments are converted with `from_value<T>` and return values with `to_value`. The supported types are covered in [Values & Conversions](/embedding/values/).

```cpp
double scale(double value, double factor) {
    return value * factor;
}

pyle::bind_function<&scale>(interpreter.vm, "scale");
```

Ints convert to floats and back when the target type asks for it. Strings must be `std::string` or `std::string_view`. Arrays convert to and from `std::vector`, and string-keyed maps convert to and from `std::map<std::string, std::string>` or `std::unordered_map<std::string, std::string>`.

## Raw native functions

When you need full control over argument handling, write a raw native function with the `VM&, ArgView` signature:

```cpp
pyle::Value double_it(pyle::VM& vm, pyle::ArgView args) {
    if (args.size() != 1) {
        vm.runtime_error(pyle::RuntimeError::ArgumentError, "expected 1 argument");
        return {};
    }

    int64_t n = pyle::from_value<int64_t>(vm, args[0]);
    return pyle::Value(n * 2);
}

pyle::bind_function<double_it>(interpreter.vm, "double_it");
```

`ArgView` gives you the raw `Value` arguments without conversion. Use `from_value` for the ones you accept, and raise `vm.runtime_error` for invalid input. Return `{}` for `none` or a `pyle::Value` for a concrete value.

## Defining a native directly

`bind_function` is a convenience wrapper around `vm.define_native`. If you already have a `NativeFn`, register it directly:

```cpp
pyle::NativeFn wrapped = pyle::FreeFnDeducer<&add>::wrap;
interpreter.vm.define_native("add", wrapped);
```

`NativeFn` is `Value(*)(VM&, ArgView)`. Any callable with that shape works, including a lambda:

```cpp
interpreter.vm.define_native("square", [](pyle::VM& vm, pyle::ArgView args) -> pyle::Value {
    int64_t n = pyle::from_value<int64_t>(vm, args[0]);
    return pyle::Value(n * n);
});
```

## Raising errors

Use `vm.runtime_error` with a `RuntimeError` kind and a message:

```cpp
vm.runtime_error(pyle::RuntimeError::ArgumentError, "expected a string");
vm.runtime_error(pyle::RuntimeError::Type, "expected a number");
vm.runtime_error(pyle::RuntimeError::Runtime, "something went wrong");
```

The available kinds are `Type`, `Name`, `Index`, `ZeroDivision`, `StackUnderflow`, `OutOfBounds`, `ArgumentError`, `Assertion`, and `Runtime`. Pyle code can catch them with `pcall`.

## Void and member-pointer forms

A function returning `void` returns `none` to Pyle. A function whose first parameter is `VM&` receives the VM. Member pointers are not free functions; use [Classes](/embedding/classes/) for those.

## Related

- [Classes](/embedding/classes/) for methods and constructors.
- [Native Modules](/embedding/modules/) for exporting a group of functions.
- [Values & Conversions](/embedding/values/) for the full conversion rules.
