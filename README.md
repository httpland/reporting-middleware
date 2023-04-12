# reporting-middleware

[![deno land](http://img.shields.io/badge/available%20on-deno.land/x-lightgrey.svg?logo=deno)](https://deno.land/x/reporting_middleware)
[![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/deno.land/x/reporting_middleware/mod.ts)
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/httpland/reporting-middleware)](https://github.com/httpland/reporting-middleware/releases)
[![codecov](https://codecov.io/github/httpland/reporting-middleware/branch/main/graph/badge.svg)](https://codecov.io/gh/httpland/reporting-middleware)
[![GitHub](https://img.shields.io/github/license/httpland/reporting-middleware)](https://github.com/httpland/reporting-middleware/blob/main/LICENSE)

[![test](https://github.com/httpland/reporting-middleware/actions/workflows/test.yaml/badge.svg)](https://github.com/httpland/reporting-middleware/actions/workflows/test.yaml)
[![NPM](https://nodei.co/npm/@httpland/reporting-middleware.png?mini=true)](https://nodei.co/npm/@httpland/reporting-middleware/)

HTTP reporting middleware.

Compliant with [Reporting API v1](https://www.w3.org/TR/reporting-1/) and
[Reporting API v0](https://www.w3.org/TR/2018/WD-reporting-1-20180925/).

## Middleware

For a definition of Universal HTTP middleware, see the
[http-middleware](https://github.com/httpland/http-middleware) project.

## reportingEndpoints

Middleware adds the `Reporting-Endpoints` header to the response.

```ts
import {
  type Handler,
  reportingEndpoints,
} from "https://deno.land/x/reporting_middleware@$VERSION/mod.ts";
import { assert } from "https://deno.land/std/testing/asserts.ts";

declare const request: Request;
declare const handler: Handler;

const middleware = reportingEndpoints({
  default: "https://test.test/report",
});
const response = await middleware(request, handler);

assert(response.headers.has("reporting-endpoints"));
```

yield:

```http
Reporting-Endpoints: default="https://test.test/report"
```

### Endpoints

Specifying endpoints is mandatory.

Endpoints must be specified as pairs consisting of key and value.

The key is the endpoint-name and the value is the endpoint-url.

The following formats are supported:

- Record
- Entries

The result of serialization is the same for both formats.

#### Record

Supports record format.

```ts
import {
  reportingEndpoints,
} from "https://deno.land/x/reporting_middleware@$VERSION/middleware.ts";

const middleware = reportingEndpoints({
  default: "https://test.test/report",
  csp: "https://test.test/csp",
});
```

Serialized as an ordered map.

Note that the order of the properties is reflected as is.

#### Entries

Supports entires format (an array of entry).

```ts
import {
  reportingEndpoints,
} from "https://deno.land/x/reporting_middleware@$VERSION/middleware.ts";

const middleware = reportingEndpoints([
  ["default", "https://test.test/report"],
  ["csp", "https://test.test/csp"],
]);
```

### Serialization error

If serialization fails, an error may be thrown.

Cases that throw an error are as follows:

- Key is invalid
  [`<member-key>`](https://www.rfc-editor.org/rfc/rfc8941.html#section-3.2-4)
- Value is invalid
  [`<URI-reference>`](https://www.rfc-editor.org/rfc/rfc3986#section-4.1)

```ts
import { reportingEndpoints } from "https://deno.land/x/reporting_middleware@$VERSION/middleware.ts";
import { assertThrows } from "https://deno.land/std/testing/asserts.ts";

assertThrows(() =>
  reportingEndpoints({ "<member-key>": "<invalid:URI-reference>" })
);
assertThrows(() =>
  reportingEndpoints({ "<invalid:member-key>": "<URI-reference>" })
);
```

### Effects

Middleware may make changes to the following elements of the HTTP message.

- HTTP Headers
  - Reporting-Endpoints

### Conditions

Middleware will execute if all of the following conditions are met:

- `Reporting-Endpoints` header does not exists in response

## API

All APIs can be found in the
[deno doc](https://doc.deno.land/https/deno.land/x/reporting_middleware/mod.ts).

## License

Copyright © 2023-present [httpland](https://github.com/httpland).

Released under the [MIT](./LICENSE) license
