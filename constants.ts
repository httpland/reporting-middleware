// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

export const enum ReportingHeader {
  ReportingEndpoints = "reporting-endpoints",
  ReportTo = "report-to",
}

export const enum Msg {
  InvalidURIReference = "invalid <URI-reference> format.",
}

/** Endpoint property name. */
export const enum Property {
  Group = "group",
  Endpoint = "endpoint",
  Priority = "priority",
  MaxAge = "max_age",
  Weight = "weight",
}
