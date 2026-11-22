---
title: color
description: ANSI terminal color and style constants.
---

```pyle
let color = import("color")
```

`color` exports ANSI escape strings. Concatenate them with text and finish with `color.reset`.

```pyle
let c = import("color")

print(c.red + "red text" + c.reset)
print(c.bold + c.green + "bold green" + c.reset)
print(c.bg_blue + c.white + " blue background " + c.reset)
```

## Foreground colors

`black`, `red`, `green`, `yellow`, `blue`, `magenta`, `cyan`, `white`.

Bright variants: `gray`, `bright_red`, `bright_green`, `bright_yellow`, `bright_blue`, `bright_magenta`, `bright_cyan`, `bright_white`.

## Background colors

`bg_black`, `bg_red`, `bg_green`, `bg_yellow`, `bg_blue`, `bg_magenta`, `bg_cyan`, `bg_white`.

Bright variants: `bg_gray`, `bg_bright_red`, `bg_bright_green`, `bg_bright_yellow`, `bg_bright_blue`, `bg_bright_magenta`, `bg_bright_cyan`, `bg_bright_white`.

## Styles

`bold`, `dim`, `italic`, `underline`, `inverse`, `strikethrough`, `reset`.

## Notes

- The values are plain strings containing ANSI escape sequences. On a terminal that does not understand them, they appear as garbage; check whether output is a TTY if that matters.
- The playground strips ANSI escapes before displaying output, so color examples show plain text there.
- These are constants, not functions.

## Related

- [Built-in Functions](/stdlib/builtins/) for `print` and `printf`.
