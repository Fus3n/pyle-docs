---
title: Classes
description: Bind C++ classes, methods, fields, and constructors to Pyle.
---

`ClassBinder<T>` exposes a C++ type to Pyle as a struct-like class. Pyle code can construct it, call methods, and read or write members.

## Global class

```cpp
struct Vec2 {
    double x;
    double y;
};

pyle::ClassBinder<Vec2>(interpreter.vm, "Vec2")
    .constructor<double, double>()
    .member<double, &Vec2::x>("x")
    .member<double, &Vec2::y>("y")
    .register_globally();
```

```pyle
let v = Vec2(1.0, 2.0)
printf("{} {}", v.x, v.y)
v.x = 10.0
```

`register_globally()` declares the constructor as a global. Without it, the binder is only available if you export it through a module.

## Constructors

`constructor<Args...>()` allocates the C++ object with `new T(args...)` and takes ownership. The object is destroyed when the Pyle value is collected.

```cpp
pyle::ClassBinder<Player>(interpreter.vm, "Player")
    .constructor<std::string, int>();
```

For custom allocation, use `custom_constructor`:

```cpp
pyle::ClassBinder<Player>(interpreter.vm, "Player")
    .custom_constructor([](pyle::VM& vm, pyle::ArgView args) -> pyle::Value {
        auto* p = new Player();
        return pyle::to_value_owned(vm, p);
    });
```

The custom constructor receives the VM and raw arguments, so it can raise errors, allocate with a custom allocator, or wrap an existing object.

## Methods

`method<MemFn>(name)` binds a member function. The member function can take ordinary arguments, a leading `VM&`, or a raw `ArgView`:

```cpp
struct Player {
    void damageBy(int damage);
    std::string status() const;
    void apply(pyle::VM& vm, pyle::ArgView args);
};

pyle::ClassBinder<Player>(interpreter.vm, "Player")
    .constructor<std::string, int>()
    .method<&Player::damageBy>("damageBy")
    .method<&Player::status>("status")
    .method<&Player::apply>("apply");
```

Const and non-const member functions are both supported. A method that returns `void` returns `none`. Exceptions thrown by the method become `RuntimeError` in Pyle.

## Members

`member<FieldType, &T::field>(name)` creates both a getter and a setter:

```cpp
pyle::ClassBinder<Player>(interpreter.vm, "Player")
    .constructor<std::string, int>()
    .member<std::string, &Player::name>("name")
    .member<int, &Player::health>("health");
```

```pyle
let p = Player("Ada", 100)
print(p.name)
p.health = 80
```

The setter expects one argument and returns it, so `p.health = 80` is a normal assignment. Use `custom_getter` and `custom_setter` when the field is not a direct member or when you need custom logic.

## Static methods

`static_method<Fn>(name)` binds a free function as a static method on the class. It is called as `ClassName.method(...)` and does not receive an instance.

```cpp
pyle::Player make_player(const std::string& name) {
    return pyle::Player(name, 100);
}
```

```cpp
pyle::ClassBinder<Player>(interpreter.vm, "Player")
    .constructor<std::string, int>()
    .static_method<&make_player>("spawn");
```

```pyle
let p = Player.spawn("Ada")
```

## Custom methods, getters, and setters

When the automatic deduction does not fit, register a raw `NativeMethodFn`:

```cpp
pyle::ClassBinder<Player>(interpreter.vm, "Player")
    .constructor<std::string, int>()
    .custom_method("heal", [](pyle::VM& vm, pyle::HeapIdx self, pyle::ArgView args) -> pyle::Value {
        auto& obj = vm.get_heap_object(self);
        auto* p = static_cast<Player*>(std::get<pyle::NativeObject>(obj.data).ptr);
        int64_t amount = pyle::from_value<int64_t>(vm, args[0]);
        p->health += amount;
        return pyle::Value(p->health);
    })
    .custom_getter("alive", [](pyle::VM& vm, pyle::HeapIdx self, pyle::ArgView) -> pyle::Value {
        auto& obj = vm.get_heap_object(self);
        auto* p = static_cast<Player*>(std::get<pyle::NativeObject>(obj.data).ptr);
        return pyle::Value(p->health > 0);
    });
```

`NativeMethodFn` is `Value(*)(VM&, HeapIdx, ArgView)`. The `HeapIdx` identifies the native object instance.

## Shared classes

`SharedClassBinder<T>` is the same idea for types held as `std::shared_ptr<T>`. The native object stores a `std::shared_ptr<T>`, so the C++ side keeps ownership and the GC tracks the object.

```cpp
pyle::SharedClassBinder<Player>(interpreter.vm, "Player")
    .constructor<std::string, int>()
    .method<&Player::damageBy>("damageBy")
    .member<int, &Player::health>("health")
    .register_globally();
```

`SharedClassBinder` supports `method`, `getter`, `member`, `custom_constructor`, `custom_method`, `custom_getter`, `custom_setter`, and `register_globally`. It does not have a `static_method` shortcut; use `custom_method` for static-style calls.

Constructors for shared classes should allocate a `std::shared_ptr<T>`. Use `custom_constructor`:

```cpp
pyle::SharedClassBinder<Player>(interpreter.vm, "Player")
    .custom_constructor([](pyle::VM& vm, pyle::ArgView args) -> pyle::Value {
        auto sp = std::make_shared<Player>("Ada", 100);
        return pyle::to_value_owned(vm, new std::shared_ptr<Player>(std::move(sp)));
    });
```

## Ownership and lifetime

The default `constructor<Args...>()` calls `new T(...)` and `to_value_owned`, which installs a deleter. When the Pyle value is collected, the deleter runs and destroys the C++ object.

If the type has a `gc_mark(VM&)` member, `to_value_owned` uses it to mark values referenced by the C++ object. This is required when a C++ object holds `pyle::Value` members that the GC must see:

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

For a custom marker, pass it as the second argument:

```cpp
pyle::to_value_owned(vm, ptr, [](void* p, pyle::VM& vm) {
    static_cast<Node*>(p)->gc_mark(vm);
});
```

See [Values & Conversions](/embedding/values/) for the full ownership rules and GC roots.

## Exporting a class from a module

Do not call `register_globally()`. Build a module and attach the binder:

```cpp
auto player_binder = pyle::ClassBinder<Player>(interpreter.vm, "Player")
    .constructor<std::string, int>()
    .method<&Player::damageBy>("damageBy")
    .method<&Player::status>("status");

pyle::register_module(interpreter.vm, "game", [&](pyle::VM& vm) {
    return pyle::NativeModule(vm, "game")
        .class_binder(player_binder)
        .build();
});
```

```pyle
let game = import("game")
let p = game.Player("Ada", 100)
p.damageBy(10)
print(p.status())
```

See [Native Modules](/embedding/modules/) for the full module API.

## Related

- [Free Functions](/embedding/functions/) for plain functions.
- [Native Modules](/embedding/modules/) for exporting classes and functions together.
- [Values & Conversions](/embedding/values/) for `to_value_owned` and GC roots.
