---
title: Structs
description: Fixed-shape types with fields, methods, constructors, and static methods.
---

Structs are Pyle's user-defined types. They have a fixed shape declared in the header, methods that receive `self` automatically, and optional constructors.

## Declaration

```pyle
struct Point(x, y) {}
```

Fields must be listed in the struct header. You cannot add fields after construction.

```pyle
let p = Point(1, 2)
print(p.x)    # 1
print(p.y)    # 2
```

Constructors accept positional or keyword arguments:

```pyle
let a = Point(1, 2)
let b = Point(x: 1, y: 2)
let c = Point(y: 2, x: 1)
```

A struct without `_init` is a data-only type, similar to a dataclass.

## Methods

Instance methods receive `self` as an implicit first parameter.

```pyle
struct Rect(w, h) {
    fn area() {
        return self.w * self.h
    }

    fn scale(factor) {
        self.w *= factor
        self.h *= factor
    }
}

let r = Rect(3, 4)
print(r.area())    # 12
r.scale(2)
print(r.area())    # 48
```

Methods can use expression bodies:

```pyle
struct Rect(w, h) {
    fn area() => self.w * self.h
}
```

## Constructors

`_init` is the constructor. It runs after the default field initialization and always returns `self`.

```pyle
struct Player(name, health, pos) {
    fn _init(n) {
        self.name = n
        self.health = 100
        self.pos = Point(x: 0, y: 0)
    }
}

let player = Player("Ada")
print(player.health)    # 100
```

`_init` receives the same arguments as the constructor call. An explicit `return self` is allowed; returning any other value is ignored and replaced with `self`.

```pyle
struct Counter(value) {
    fn _init(start) {
        self.value = start
    }
}

let c = Counter(10)
```

## Static methods

`static fn` methods do not receive `self`. Call them on the struct type.

```pyle
struct Rect(w, h) {
    fn area() => self.w * self.h

    static fn square(size) {
        return Rect(size, size)
    }
}

let s = Rect.square(5)
print(s.area())    # 25
```

## Private members

Fields and methods starting with `_` are private. They are accessible only through `self` inside the struct.

```pyle
struct Account(balance, _pin) {
    fn _init(balance, pin) {
        self.balance = balance
        self._pin = pin
    }

    fn check(pin) => pin == self._pin
}

let account = Account(100, 1234)
print(account.check(1234))    # true
# print(account._pin) would be a compile error
```

`_init` is the conventional constructor name. Other special methods such as `_add`, `_sub`, `_mul`, `_div`, `_eq`, and `_str` are reserved for operator overloading, but only `_init` is currently honored. `==` compares struct instances by identity, and using `+` raises `TypeError`.

## Field access and mutation

Fields are read and written with dot access.

```pyle
struct Point(x, y) {}

let p = Point(1, 2)
p.x = 10
print(p.x)
```

The shape is fixed. Assigning to a field that was not declared raises `NameError`.

```pyle
struct Point(x, y) {}
let p = Point(1, 2)
# p.z = 3    # NameError
```

## Reference semantics

Struct instances are reference types. Assigning one to another variable copies the reference, not the data.

```pyle
struct Point(x, y) {}

let a = Point(1, 2)
let b = a
b.x = 10

print(a.x)    # 10
```

Equality is identity-based for structs. Two instances with the same field values are not equal unless they are the same object.

## Nested structs

Structs can contain other structs.

```pyle
struct Point(x, y) {}

struct Segment(start, end) {
    fn length_squared() {
        let dx = self.end.x - self.start.x
        let dy = self.end.y - self.start.y
        return dx * dx + dy * dy
    }
}

let s = Segment(
    start: Point(0, 0),
    end: Point(3, 4)
)

print(s.length_squared())    # 25
```

## Next steps

- [Enums](/language/enums/)
- [Modules & Imports](/language/modules/)
- [Type Hints](/language/type-hints/)
