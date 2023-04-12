// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

export interface EndpointGroup {
  readonly endpoints: readonly Endpoint[];
  readonly max_age: number;
  readonly group?: string;
  readonly include_subdomains?: boolean;
}

export interface Endpoint {
  readonly url: string;
  readonly priority?: number;
  readonly weight?: number;
}
