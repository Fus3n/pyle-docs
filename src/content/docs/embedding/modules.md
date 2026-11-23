---
title: Native Modules
description: Group functions, constants, and classes into a module that Pyle imports by name.
---

A native module is a map of exported values. Pyle imports it with `import("name")` and accesses the exports as fields.

## Registering a module

`register_module` associates a name with a factory. The factory runs the first time the module is imported and the result is cached.

```cpp
pyle::register_module(interpreter.vm, "mathx", [](pyle::VM& vm) {
    return pyle::NativeModule(vm, "mathx")
        .function<&square>("square")
        .function<&cube>("cube")
        .build();
});
```

```pyle
let mathx = import("mathx")
print(mathx.square(3))    # 9
print(mathx.cube(3))      # 27
```

`NativeModule` is a builder. Every method returns a reference, so calls chain. Call `build()` at the end to produce the module map.

## Exports

| Method | Exports |
| --- | --- |
| `raw_function(name, NativeFn)` | A raw native function |
| `function<Fn>(name)` | A free function with automatic conversion |
| `constant(name, value)` | A string, number, bool, array, or string map |
| `int_constant(name, value)` | An integer constant |
| `add_constants({ {name, value}, ... })` | Several integer constants |
| `native_object(name, T*)` | An owned native object |
| `class_binder(binder)` | A `ClassBinder` or `SharedClassBinder` constructor |
| `class_type(binder)` | Alias for `class_binder` |

```cpp
pyle::NativeModule(vm, "config")
    .int_constant("version_major", 1)
    .int_constant("version_minor", 0)
    .constant("display_name", std::string("My App"))
    .add_constants({ {"flag_a", 1}, {"flag_b", 2} })
    .function<&compute>("compute")
    .raw_function("inspect", [](pyle::VM& vm, pyle::ArgView args) -> pyle::Value {
        return pyle::Value();
    });
```

## Functions in modules

`function<Fn>` uses the same deduction as [Free Functions](/embedding/functions/), so it accepts `Ret(Args...)`, `Ret(VM&, Args...)`, and `Ret(VM&, ArgView)`.

```cpp
double clamp(double v, double lo, double hi) {
    return v < lo ? lo : (v > hi ? hi : v);
}

pyle::NativeModule(vm, "mathx")
    .function<&clamp>("clamp")
    .build();
```

## Classes in modules

Attach a class binder with `class_binder`. The binder's name becomes the export key.

```cpp
auto player_binder = pyle::ClassBinder<Player>(vm, "Player")
    .constructor<std::string, int>()
    .method<&Player::status>("status");

pyle::NativeModule(vm, "game")
    .class_binder(player_binder)
    .build();
```

```pyle
let game = import("game")
let p = game.Player("Ada", 100)
```

The binder can be declared globally or exported through a module, but not both. If you call `register_globally()` and also attach the binder to a module, the class is available in both places.

## Native objects

`native_object` exports an existing C++ object by pointer and takes ownership of it:

```cpp
auto* config = new AppConfig();
pyle::NativeModule(vm, "config")
    .native_object("settings", config)
    .build();
```

The object is destroyed when the module value is collected. Use `custom_getter` and `custom_method` on a class binder when you need to expose fields and methods rather than a bare pointer.

## Module caching

A module factory runs once per name. Subsequent imports return the same map. The VM marks loaded modules during GC, so their values stay alive.

```pyle
let a = import("mathx")
let b = import("mathx")
print(a == b)    # true, the same module map
```

## Import paths

Native modules are resolved by name before the filesystem. Script imports search `import_paths`, which defaults to `./`. Add directories with `add_import_path`:

```cpp
interpreter.vm.add_import_path("scripts/");
interpreter.vm.add_import_path("lib/");
```

```pyle
let helpers = import("helpers")      # found in scripts/ or lib/
let cfg = import("config/utils")     # searches subdirectories
```

## Module factories and GC

`NativeModule` disables GC while it builds, then re-enables it. The factory runs on the VM thread; use `vm.get_mutex()` if you call into a module from another thread.

## Related

- [Free Functions](/embedding/functions/) for the function deduction rules.
- [Classes](/embedding/classes/) for class binders.
- [Values & Conversions](/embedding/values/) for constants and native objects.
- [Modules & Imports](/language/modules/) for the Pyle-side behavior.
