---
title: Values & Conversions
description: Convert between Pyle values and C++, and manage ownership and GC roots.
---

Bound functions convert arguments with `from_value` and return values with `to_value`. The same helpers work in raw native functions, custom methods, and module factories.

## Value tags

A `pyle::Value` is a tagged union. The tag is one of:

| Tag | Meaning |
| --- | --- |
| `Int` | 64-bit signed integer |
| `Float` | 64-bit float |
| `Bool` | Boolean |
| `None` | `none` |
| `StringRef` | Interned string |
| `ArrayRef` | Array |
| `MapRef` | Map |
| `StructRef` | Struct instance |
| `StructTypeRef` | Struct type / native class constructor |
| `NativeFuncRef` | Native function |
| `FuncRef` | Compiled Pyle function |
| `ClosureRef` | Closure with upvalues |
| `UpvalueRef` | Captured upvalue |
| `IteratorRef` | Iterator |
| `RangeRef` | Range |
| `NativeObjectRef` | Wrapped C++ object |
| `CoroutineRef` | Coroutine |
| `BytesRef` | Immutable byte buffer |
| `BytesBuilderRef` | Mutable byte builder |

## from_value

`from_value<T>(vm, value)` converts a Pyle value to C++.

| Target type | Accepted Pyle value |
| --- | --- |
| `Value` | Anything, no conversion |
| `int64_t`, other integrals | `Int`, or `Float` truncated |
| `double`, `float` | `Float`, or `Int` widened |
| `std::string`, `std::string_view` | `StringRef` |
| `bool` | Any value, using Pyle truthiness |
| `T*` | `NativeObjectRef` |
| `std::vector<E>` | `ArrayRef`, elements converted recursively |
| `std::map<std::string, std::string>`, `std::unordered_map<std::string, std::string>` | `MapRef`, keys and values converted to strings |

Unsupported target types are a compile error. A wrong Pyle type raises `RuntimeError::Type` and returns a default-constructed value.

```cpp
int64_t n = pyle::from_value<int64_t>(vm, args[0]);
std::string name = pyle::from_value<std::string>(vm, args[1]);
auto items = pyle::from_value<std::vector<std::string>>(vm, args[2]);
```

## to_value

`to_value(vm, value)` converts a C++ value to Pyle.

| Source type | Pyle value |
| --- | --- |
| `Value` | Unchanged |
| `void` | `none` |
| `bool` | `Bool` |
| integrals | `Int` |
| floating point | `Float` |
| `std::string`, `std::string_view` | `StringRef` |
| `T*` | `NativeObjectRef` with no deleter |
| `std::vector<E>` | `ArrayRef` |
| string maps | `MapRef` with string keys and values |

A pointer converted with `to_value` is non-owning: the GC does not destroy it. Use `to_value_owned` when the VM should take ownership.

## Owning a C++ object

`to_value_owned(vm, ptr)` wraps a pointer and installs a deleter that calls `delete` when the value is collected:

```cpp
auto* player = new Player("Ada", 100);
pyle::Value value = pyle::to_value_owned(vm, player);
```

The object must be allocated with `new` and must not be deleted by the host afterwards. If the object has a `gc_mark(VM&)` member, the binder uses it to mark values reachable from the C++ object:

```cpp
struct Node {
    pyle::Value left;
    pyle::Value right;

    void gc_mark(pyle::VM& vm) {
        vm.mark_value(left);
        vm.mark_value(right);
    }
};
```

Without a marker, `pyle::Value` members of a C++ object are invisible to the GC and may be collected while the C++ side still points at them. Pass a custom marker as the second argument when `gc_mark` is not a member:

```cpp
pyle::to_value_owned(vm, ptr, [](void* p, pyle::VM& vm) {
    static_cast<Node*>(p)->gc_mark(vm);
});
```

`std::shared_ptr<T>` and `std::unique_ptr<T>` are supported by the marker helper.

## Transient strings

`to_transient_string` and `to_transient_string_map` allocate without interning. Use them for large or temporary strings where interning would grow the string table unnecessarily:

```cpp
pyle::Value name = pyle::to_transient_string(vm, std::string("temporary"));
```

## GC roots

The collector can run during a native call that allocates. If you hold a heap value across an allocation, root it with `GCRoot`:

```cpp
pyle::GCRoot guard(vm, heap_idx, pyle::Value::Tag::ArrayRef);
```

`GCRoot` pushes the value onto the GC root stack in its constructor and pops it in its destructor. Use the tag that matches the heap object. `gc_root_push` and `gc_root_pop` are the underlying VM methods.

For bulk allocation where no Pyle code re-enters the VM, `BulkAlloc` disables GC and skips the VM mutex:

```cpp
{
    pyle::BulkAlloc bulk(vm);
    // allocate many values here
}
```

`BulkAlloc` restores the previous GC and mutex state in its destructor. It is only safe in single-threaded native code that does not call back into the VM.

## Controlling the collector

```cpp
vm.gc_collect_now();          // force a collection cycle
vm.set_gc_enabled(false);     // disable automatic collection
bool enabled = vm.is_gc_enabled();
```

Use `set_gc_enabled(false)` for short, allocation-heavy sections where you know the values are rooted. `BulkAlloc` does this for you.

## Example

```cpp
pyle::Value summarize(pyle::VM& vm, pyle::ArgView args) {
    auto names = pyle::from_value<std::vector<std::string>>(vm, args[0]);

    pyle::GCRoot guard(vm, args[0].as_ref, pyle::Value::Tag::ArrayRef);

    pyle::MapType out;
    out[pyle::Value(pyle::Value::Tag::StringRef, vm.intern_string("count"))] =
        pyle::Value(static_cast<int64_t>(names.size()));

    return pyle::to_value(vm, out);
}
```

## Related

- [Classes](/embedding/classes/) for `to_value_owned` in constructors.
- [Calling into Pyle](/embedding/calling/) for `Value` results.
- [Memory & GC](/language/memory/) for the Pyle-side model.
