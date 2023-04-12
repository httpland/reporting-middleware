// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

import { type Middleware, withHeader } from "./deps.ts";
import { stringifyEndpoints, stringifyGroups } from "./utils.ts";
import { ReportingHeader } from "./constants.ts";
import type { EndpointGroup } from "./types.ts";

/** Create `Reporting-Endpoints` header field middleware.
 * @throws {Error}
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
 * @throws {Error}
 */
export function reportTo(groups: readonly EndpointGroup[]): Middleware {
  const fieldValue = stringifyGroups(groups);

  return async (request, next) => {
    const response = await next(request);

    if (response.headers.has(ReportingHeader.ReportTo)) return response;

    return withHeader(response, ReportingHeader.ReportTo, fieldValue);
  };
}
