---
title: http
description: HTTP client and server. Ships with the pyle interpreter, not libpyle.
---

```pyle
let http = import("http")
```

:::caution
`http` is part of the `pyle` interpreter, not `libpyle`. It is not available in a library-only embedder or in the browser playground.
:::

## Client

One-shot functions cover the common methods:

```pyle
let http = import("http")

let res = http.get("https://example.com/api", {
    headers: {"accept": "application/json"},
    timeout: 5.0,
})

print(res.status)
print(res.ok)
print(res.body)
```

| Method | Returns | Description |
| --- | --- | --- |
| `get(url: string, options: map?)` | `Response` | GET request |
| `post(url: string, options: map?)` | `Response` | POST request |
| `put(url: string, options: map?)` | `Response` | PUT request |
| `patch(url: string, options: map?)` | `Response` | PATCH request |
| `delete(url: string, options: map?)` | `Response` | DELETE request |
| `head(url: string, options: map?)` | `Response` | HEAD request |
| `options(url: string, options: map?)` | `Response` | OPTIONS request |

Each method also has an async variant returning a `Future`, such as `http.get_async(url, options?)`.

### Response

| Field | Type | Description |
| --- | --- | --- |
| `status` | `int` | Integer status code |
| `body` | `string` | Response body as a string |
| `headers` | `map` | Map of headers; duplicate keys become arrays |
| `ok` | `bool` | True for 2xx responses |

### Options

All options are optional.

| Key | Description |
| --- | --- |
| `headers` | Map of header name to value |
| `body` | String body for POST, PUT, PATCH, and DELETE |
| `content_type` | Defaults to `"text/plain"`; a `Content-Type` header wins |
| `timeout` | Seconds; defaults to 30 |
| `follow_redirects` | Bool; defaults to true |
| `verify_ssl` | Bool; defaults to true |
| `proxy` | `"host:port"` |
| `form` | Array of `{name, value}` or `{name, path}` for multipart uploads |

```pyle
let res = http.post(url, {
    headers: {"authorization": "Bearer " + token},
    body: json.stringify(payload),
    content_type: "application/json",
})
```

### Async and cancellation

```pyle
let f = http.get_async("https://example.com/slow")
if f.cancel() {
    print("request aborted")
}
```

`http.cancel()` stops all in-flight requests. To cancel one request, call `cancel()` on its `Future`; it returns `false` when the future has no cancel hook or is already done.

### Client struct

`http.Client(base_url)` creates a client with a base URL. The request methods take a path relative to that base.

## Server

```pyle
let http = import("http")

let server = http.Server("127.0.0.1", 8090)

server.get("/hello", fn(req) {
    return "hi"
})

server.post("/echo", fn(req) {
    return {
        status: 201,
        headers: {"content-type": "application/json"},
        body: req.body,
    }
})

server.mount("/static", "public")
server.run()
```

| Method | Returns | Description |
| --- | --- | --- |
| `Server(host: string?, port: int?)` | `Server` | Create a server; defaults to `0.0.0.0:8080` |
| `get(pattern: string, handler: function)` | `none` | Register a GET route |
| `post(pattern: string, handler: function)` | `none` | Register a POST route |
| `put(pattern: string, handler: function)` | `none` | Register a PUT route |
| `patch(pattern: string, handler: function)` | `none` | Register a PATCH route |
| `delete(pattern: string, handler: function)` | `none` | Register a DELETE route |
| `head(pattern: string, handler: function)` | `none` | Register a HEAD route |
| `options(pattern: string, handler: function)` | `none` | Register an OPTIONS route |
| `mount(prefix: string, directory: string)` | `none` | Serve a directory; call before `run` |
| `set_keep_alive(max_requests: int, timeout_secs: int?)` | `none` | Tune keep-alive; call before `run` |
| `run()` | `none` | Block and serve |
| `serve_async()` | `Future` | Serve on a coroutine; combine with `waitfor(server.stopped)` |
| `stop()` | `none` | Stop the server |
| `port()` | `int` | Server port |

### Requests

| Field | Type | Description |
| --- | --- | --- |
| `method` | `string` | HTTP method |
| `path` | `string` | Request path |
| `query` | `map` | Map of query parameters |
| `headers` | `map` | Map of headers with lowercased keys |
| `cookies` | `map` | Map of cookies |
| `body` | `string` | Request body as a string |
| `captures` | `array` | Regex capture groups from the route pattern |
| `remote_addr` | `string` | Client address |
| `cookie(name: string)` | `string?` | One cookie value, or `none` |

Route patterns are regular expressions matched against the path. Capture groups land in `req.captures`.

### Responses

A handler may return:

- `none` or a string, sent as `text/plain`
- A map `{status, headers, body}`

A handler panic becomes a 500 response.

```pyle
server.get("/users/(\\d+)", fn(req) {
    let id = req.captures[0]
    return http.html("<h1>user " + id + "</h1>")
})
```

`http.html(body, status?)` is a shorthand for a response map with an HTML content type. `http.set_cookie(name, value, options)` builds a `Set-Cookie` header. Options include `path`, `domain`, `max_age`, `expires`, `http_only`, `secure`, and `same_site`.

## Notes

- `run()` serves on a single worker thread, so an idle keep-alive connection can block other requests until the keep-alive timeout. `serve_async()` uses a 16-thread pool.
- TLS and crypto support come from mbedtls, which is why `http` is not part of `libpyle`.

## Related

- [json](/stdlib/json/) for request and response payloads.
- [crypto](/stdlib/crypto/) for tokens and signatures.
