# Pyle documentation

The documentation site for [Pyle](https://github.com/Fus3n/pyle), an embeddable scripting language for C++17.

The site has three parts:

- A custom landing page at `/`.
- Starlight documentation under `/getting-started/`, `/language/`, `/stdlib/`, and `/reference/`.
- A browser playground at `/playground/` that runs the real `libpyle` compiled to WebAssembly.

## Stack

- [Astro](https://astro.build) with [Starlight](https://starlight.astro.build) for the docs.
- CodeMirror 6 for the playground editor.
- A custom Shiki grammar and themes for Pyle code blocks.
- Emscripten + CMake for the WebAssembly build.
- GitHub Pages for hosting.

## Build

```sh
git submodule update --init --depth 1
npm install
npm run wasm
npm run build
```

`npm run wasm` needs emsdk. Set `EMSDK` or activate emsdk first:

```sh
EMSDK=/path/to/emsdk npm run wasm
```
