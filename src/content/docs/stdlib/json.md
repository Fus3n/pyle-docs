---
title: json
description: Parse and serialize JSON. Ships with the pyle interpreter, not libpyle.
---

```pyle
let json = import("json")
```

:::caution
`json` is part of the `pyle` interpreter, not `libpyle`. A library-only embedder must register it explicitly, and the browser playground does not include it.
:::

## API

| Function | Returns | Description |
| --- | --- | --- |
| `parse(text: string)` | `map | array | string | int | float | bool | none` | Parse a JSON string; returns a value or `none` on invalid input |
| `stringify(value)` | `string` | Compact JSON string |

```pyle
let json = import("json")

let data = json.parse("{\"name\":\"Ada\",\"age\":36,\"tags\":[\"math\",\"code\"]}")
print(data.name)        # Ada
print(data.tags[0])     # math

data.age = 37
print(json.stringify(data))
# {"name":"Ada","age":37,"tags":["math","code"]}
```

## Mapping

| JSON | Pyle |
| --- | --- |
| object | map |
| array | array |
| string | string |
| number without a fraction | int |
| number with a fraction or exponent | float |
| `true` / `false` | bool |
| `null` | none |

Parsed objects become maps, so dot reads work (`data.title`). Dot writes also work (`data.title = "x"`).

## Notes

- `json.stringify` emits `null` for `none`.
- Struct instances raise `TypeError: Cannot serialize type 'struct' to JSON.` Convert them to a map first.
- Invalid input to `json.parse` returns `none` rather than raising. Check the result.

```pyle
let parsed = json.parse(maybe_json)
if parsed == none {
    print("invalid json")
}
```

## Related

- [worker](/stdlib/worker/) uses JSON to move tasks across process boundaries.
- [http](/stdlib/http/) returns JSON bodies as strings; parse them with `json.parse`.
