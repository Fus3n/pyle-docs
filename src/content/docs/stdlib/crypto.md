---
title: crypto
description: Hashing, HMAC, Base64, PBKDF2, and random bytes. CLI-only.
---

```pyle
let crypto = import("crypto")
```

:::caution
`crypto` is part of the `pyle` interpreter, not `libpyle`. It is backed by mbedtls and is not available in a library-only embedder or in the browser playground.
:::

## Hashing

| Function | Returns | Description |
| --- | --- | --- |
| `sha256(data: string \| bytes)` | `bytes` | SHA-256 digest as `Bytes` |
| `sha256_hex(data: string \| bytes)` | `string` | SHA-256 digest as a hex string |
| `sha1(data: string \| bytes)` | `bytes` | SHA-1 digest as `Bytes` |
| `sha1_hex(data: string \| bytes)` | `string` | SHA-1 digest as a hex string |
| `md5(data: string \| bytes)` | `bytes` | MD5 digest as `Bytes` |
| `md5_hex(data: string \| bytes)` | `string` | MD5 digest as a hex string |
| `hmac_sha256(key: string \| bytes, data: string \| bytes)` | `bytes` | HMAC-SHA256 as `Bytes` |
| `hmac_sha256_hex(key: string \| bytes, data: string \| bytes)` | `string` | HMAC-SHA256 as a hex string |

`data` and `key` accept a string or `Bytes`.

```pyle
let crypto = import("crypto")

print(crypto.sha256_hex("hello"))
print(crypto.hmac_sha256_hex("secret", "payload"))
```

SHA-1 and MD5 are legacy algorithms. Use SHA-256 for new designs.

## Base64

| Function | Returns | Description |
| --- | --- | --- |
| `base64_encode(data: string \| bytes)` | `string` | Standard alphabet with padding |
| `base64_decode(s: string)` | `bytes` | Decode; raises on invalid input |
| `base64url_encode(data: string \| bytes)` | `string` | URL-safe alphabet, no padding |
| `base64url_decode(s: string)` | `bytes` | Decode unpadded URL-safe input |

```pyle
let encoded = crypto.base64_encode("hello")
print(encoded)                 # aGVsbG8=

let decoded = crypto.base64_decode(encoded)
print(decoded.to_string())     # hello
```

The URL-safe variants are the ones to use for JWT segments and query parameters.

## Random bytes

`crypto.random(n)` returns `n` cryptographically random bytes from a CTR-DRBG. `n` must be between 0 and 65536.

```pyle
let nonce = crypto.random(16)
print(crypto.to_hex(nonce))
```

## Key derivation

`crypto.pbkdf2(password, salt, iterations, length)` derives `length` bytes with PBKDF2-HMAC-SHA256. Iterations must be between 1 and 10,000,000; length must be between 1 and 1024.

```pyle
let key = crypto.pbkdf2("password", crypto.random(16), 210000, 32)
```

## Hex

`crypto.to_hex(data)` returns a lowercase hex string from a string or `Bytes`.

```pyle
print(crypto.to_hex(Bytes([0, 15, 255])))    # 000fff
```

## Related

- [Bytes & BytesBuilder](/stdlib/bytes/) for binary data.
- [http](/stdlib/http/) for sending digests and tokens.
