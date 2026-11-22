---
title: Bytecode & VM
description: The instruction encoding, opcode set, and execution model.
---

Pyle compiles to bytecode and runs on a stack-based virtual machine. The pipeline is:

```text
Source → Lexer → Tokens → Parser → AST → Compiler → Bytecode Chunk → VM.execute()
```

- The lexer produces tokens with a type, lexeme, and line number.
- The parser is recursive descent and produces a statement AST.
- The compiler is single-pass and emits a `Chunk` containing instructions, a constant pool, and a line table.
- The VM dispatches with computed goto where the compiler supports it, and a switch otherwise.

## Instruction encoding

Each instruction is a `uint32_t`:

```text
(operand << 8) | opcode
```

- The low 8 bits are the opcode.
- The high 24 bits are one unsigned operand, ranging from 0 to 16,777,215.
- There is exactly one operand slot per instruction, and it is always an integer.

What the operand means depends on the opcode:

| Opcode group | Operand meaning |
| --- | --- |
| `LOAD_CONST` | Index into `Chunk::const_pool` |
| Local opcodes | Local slot index, relative to the frame's stack base |
| Global opcodes | Index into the active global slot array |
| Upvalue opcodes | Upvalue slot index |
| `CALL`, `CALL_METHOD` | Argument count |
| `CALL_KW` | Number of keyword pairs; names and values are on the stack |
| `NEW_ARRAY` | Element count |
| `NEW_MAP` | Key/value pair count |
| `GET_FIELD`, `SET_FIELD` | Interned field-name id |
| Forward jumps | Relative distance in instructions from the next instruction |
| `LOOP` | Relative backward distance |
| `CLOSE_UPVALUES` | Stack slot limit |
| `CLOSURE` | Unused; the function value is already on the stack |
| Arithmetic, comparisons, `YIELD`, `HALT`, `POP` | Unused |

Data that does not fit in one operand lives outside the instruction: constants in the constant pool, source lines in the line table, and struct field inline caches in `Chunk::field_ic`.

## Opcodes

### Loads, stores, and slots

| Opcode | Operand | Stack effect | Description |
| --- | --- | --- | --- |
| `LOAD_CONST` | const index | `→ val` | Push a constant |
| `LOAD_LOCAL` | slot | `→ val` | Push a local |
| `SET_LOCAL` | slot | `val →` | Pop into a local |
| `SET_LOCAL_POP` | slot | `val →` | Set a local and pop |
| `INC_LOCAL` | slot | `→` | Increment a local in place |
| `DEC_LOCAL` | slot | `→` | Decrement a local in place |
| `LOAD_GLOBAL_SLOT` | slot | `→ val` | Push a global |
| `SET_GLOBAL_SLOT` | slot | `val →` | Pop into a global |
| `SET_GLOBAL_SLOT_POP` | slot | `val →` | Set a global and pop |
| `DEFINE_GLOBAL_SLOT` | slot | `val →` | Define a new global |
| `APPEND` | slot | `val →` | Append to the array held in a local |

### Upvalues and closures

| Opcode | Operand | Stack effect | Description |
| --- | --- | --- | --- |
| `CLOSURE` | unused | `fn → closure` | Wrap the function value in a closure |
| `LOAD_UPVALUE` | slot | `→ val` | Push a captured variable |
| `SET_UPVALUE` | slot | `val →` | Pop into a captured variable |
| `SET_UPVALUE_POP` | slot | `val →` | Set and pop |
| `CLOSE_UPVALUES` | limit | `→` | Close upvalues at or above the stack limit |

### Fields and indexing

| Opcode | Operand | Stack effect | Description |
| --- | --- | --- | --- |
| `GET_FIELD` | field name | `obj → val` | Read a field or method |
| `SET_FIELD` | field name | `obj, val → val` | Write a field |
| `GET_INDEX` | unused | `obj, key → val` | `obj[key]` |
| `SET_INDEX` | unused | `obj, key, val → val` | `obj[key] = val` |
| `INDEX_GET_LOCAL` | slot | `key → val` | Read `local[key]` |
| `INDEX_SET_LOCAL` | slot | `key, val → val` | Write `local[key]` |
| `INC_INDEX_LOCAL` | slot | `key →` | Increment `local[key]` |
| `DEC_INDEX_LOCAL` | slot | `key →` | Decrement `local[key]` |

### Arithmetic and logic

| Opcode | Stack effect | Description |
| --- | --- | --- |
| `ADD` | `a, b → result` | Addition or string concatenation |
| `SUB` | `a, b → result` | Subtraction |
| `MUL` | `a, b → result` | Multiplication |
| `DIV` | `a, b → result` | Division |
| `MOD` | `a, b → result` | Modulo |
| `NEG` | `a → result` | Negation |
| `NOT` | `a → bool` | Logical not |
| `EQ` | `a, b → bool` | Equality |
| `NEQ` | `a, b → bool` | Inequality |
| `LT` | `a, b → bool` | Less than |
| `LTE` | `a, b → bool` | Less than or equal |
| `GT` | `a, b → bool` | Greater than |
| `GTE` | `a, b → bool` | Greater than or equal |
| `BAND` | `a, b → result` | Bitwise and |
| `BOR` | `a, b → result` | Bitwise or |
| `BXOR` | `a, b → result` | Bitwise xor |
| `SHL` | `a, b → result` | Shift left |
| `SHR` | `a, b → result` | Arithmetic shift right |
| `BNOT` | `a → result` | Bitwise not |

### Control flow and calls

| Opcode | Operand | Stack effect | Description |
| --- | --- | --- | --- |
| `JUMP` | offset | `→` | Unconditional forward jump |
| `JUMP_IF_FALSE` | offset | `cond →` | Jump if falsy |
| `JUMP_IF_TRUE` | offset | `cond →` | Jump if truthy |
| `POP_JUMP_IF_FALSE` | offset | `cond →` | Pop and jump if falsy |
| `POP_JUMP_IF_TRUE` | offset | `cond →` | Pop and jump if truthy |
| `JUMP_IF_NOT_ARRAY` | offset | `val → val` | Jump if the value is not an array |
| `LOOP` | offset | `→` | Backward jump |
| `GET_ITER` | unused | `val → iter` | Create an iterator |
| `FOR_ITER` | offset | `iter → val/none` | Advance or jump to the loop exit |
| `NEW_RANGE` | unused | `start, end → range` | Create a range |
| `CALL` | argc | `fn, args... → result` | Call a function |
| `CALL_METHOD` | argc | `obj, name, args... → result` | Call a method |
| `CALL_KW` | pairs | `fn, key_vals... → result` | Call with keyword arguments |
| `RETURN` | unused | `val →` | Return from a function |
| `POP` | unused | `val →` | Discard a value |
| `NEW_ARRAY` | count | `items... → array` | Build an array |
| `NEW_MAP` | pairs | `keys/values... → map` | Build a map |
| `YIELD` | unused | `val →` | Suspend a coroutine |
| `HALT` | unused | `val →` | End execution with a result |

## Frames and calls

A call pushes a frame containing the function, the instruction pointer, the stack base, and the upvalue list. Locals live on the value stack above the base. `RETURN` unwinds the frame and leaves the result on the caller's stack.

The VM checks call depth and reports a runtime error instead of overflowing the native stack.

## Disassembly

Run the interpreter with `-d` or `--dissassamble` to print the compiled bytecode before executing:

```sh
pyle -d script.pyl
```

The dump lists each instruction with its operand and the source line it came from.

## Why bytecode

- Compilation is separate from execution, so syntax errors are reported before any code runs.
- The instruction set is small and regular, which keeps the VM compact.
- Locals are slot-addressed rather than name-looked-up, so variable access is a direct index.
- Global access is also slot-based after compilation.
- Inline caches accelerate field access on struct instances.

## Related

- [Embedding in C++](/embedding/) for `execute(source, disassemble, name)`.
- [Limitations](/reference/limitations/) for language features that do not exist.
