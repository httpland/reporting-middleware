// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

import { type Middleware, withHeader } from "./deps.ts";
import { stringifyEndpoints } from "./utils.ts";
import { ReportingHeader } from "./constants.ts";

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
