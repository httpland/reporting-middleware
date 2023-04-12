// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

import { type Middleware, withHeader } from "./deps.ts";
import { stringifyEndpoints, stringifyGroups } from "./utils.ts";
import { ReportingHeader } from "./constants.ts";
import type { EndpointGroup } from "./types.ts";

/** Create `Reporting-Endpoints` header field middleware.
 *
 * @example
 * ```ts
 * import {
 *   type Handler,
 *   reportingEndpoints,
 * } from "https://deno.land/x/reporting_middleware@$VERSION/mod.ts";
 * import { assert } from "https://deno.land/std/testing/asserts.ts";
 *
 * declare const request: Request;
 * declare const handler: Handler;
 *
 * const middleware = reportingEndpoints({
 *   default: "https://test.test/report",
 * });
 * const response = await middleware(request, handler);
 *
 * assert(response.headers.has("reporting-endpoints"));
 * ```
 *
 * @throws {Error} If the endpoints include invalid member.
 */
export function reportingEndpoints(
  endpoints: Record<string, string> | readonly [string, string][],
): Middleware {
  const fieldValue = stringifyEndpoints(endpoints);

  return async (request, next) => {
    const response = await next(request);

    if (response.headers.has(ReportingHeader.ReportingEndpoints)) {
      return response;
    }

    return withHeader(response, ReportingHeader.ReportingEndpoints, fieldValue);
  };
}

/** Create `Report-To` header field middleware.
 *
 * @example
 * ```ts
 * import {
 *   type Handler,
 *   reportTo,
 * } from "https://deno.land/x/reporting_middleware@$VERSION/mod.ts";
 * import { assert } from "https://deno.land/std/testing/asserts.ts";
 *
 * declare const request: Request;
 * declare const handler: Handler;
 *
 * const middleware = reportTo([
 *   {
 *     endpoints: [{ url: "https://test.test/report" }],
 *     max_age: 86400,
 *   },
 * ]);
 * const response = await middleware(request, handler);
 *
 * assert(response.headers.has("reporting-to"));
 * ```
 *
 * @throws {Error} If the {@link EndpointGroup} includes invalid field.
 */
export function reportTo(groups: readonly EndpointGroup[]): Middleware {
  const fieldValue = stringifyGroups(groups);

  return async (request, next) => {
    const response = await next(request);

    if (response.headers.has(ReportingHeader.ReportTo)) return response;

    return withHeader(response, ReportingHeader.ReportTo, fieldValue);
  };
}
