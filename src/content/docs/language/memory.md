---
title: Memory & GC
description: How values are stored, when the collector runs, and what it costs.
---

Pyle uses a mark-sweep, non-compacting garbage collector. There are no manual `free` calls and no reference counting, so cycles are collected normally.

## Value versus reference types

| Kind | Types | Behavior |
| --- | --- | --- |
| Value | `int`, `float`, `bool`, `none` | Copied on assignment |
| Reference | `string`, `array`, `map`, `struct`, `bytes`, `bytes_builder`, `function`, `closure`, `range`, `coro`, `future`, native objects | Assignment copies the reference |

```pyle
let a = [1, 2]
let b = a
b.append(3)

print(a)    # [1, 2, 3], both names refer to the same array
```

Strings are immutable, so the shared reference is not observable: operations return new strings.

```pyle
let s = "hello"
let t = s
print(t.upper())    # HELLO
print(s)            # hello
```

## Interned strings

String values are interned. Two strings with identical content share one heap allocation, which makes string equality and map keys cheap. Interning also means a long-lived string keeps its allocation alive as long as any reference exists, which is normal.

## When the collector runs

The collector runs automatically during heap allocation. It is a stop-the-world mark-sweep pass: execution pauses while reachable objects are marked and unreachable ones are swept.

For an embedder, the VM also exposes `set_gc_enabled(false)` for setup phases where you know allocation is safe to defer. Re-enable it before running user code, or memory will grow without bound.

## Roots

The VM treats these as roots:

- The value stack and call frames.
- Global slots for every loaded module.
- Open upvalues captured by closures.
- Temporaries held by the VM during a native call.
- Values registered with `GCRoot` by native code.

If native code allocates a heap value and then calls back into Pyle, root the value first:

```cpp
pyle::GCRoot guard(vm, heap_idx, pyle::Value::Tag::MyType);
```

The guard pops the root in its destructor.

For bulk allocation where no Pyle code re-enters the VM, use `BulkAlloc` to disable GC and skip the VM mutex for the duration.

## Cost model

- Allocation is bump-pointer cheap until a collection is needed.
- Collection cost is proportional to the number of live objects.
- Non-compacting means heap indices are stable, which is what makes `GCRoot` and native object handles safe.
- Large arrays and maps are not copied during collection.

## Practical advice

- Prefer reusing arrays with `.clear()` over allocating a new one per frame.
- Use `BytesBuilder` for incremental byte output instead of repeated string concatenation.
- Do not hold raw `HeapIdx` values across calls into Pyle unless they are rooted.
- Avoid deep recursion in scripts; the VM has a call-depth limit and reports a runtime error when it is exceeded.

## Related

- [Bytes & BytesBuilder](/stdlib/bytes/) for binary data.
- [Embedding in C++](/embedding/) for `GCRoot` and `BulkAlloc`.
