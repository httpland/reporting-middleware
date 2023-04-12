// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

/** Endpoint group API. */
export interface EndpointGroup {
  /** Endpoint list. */
  readonly endpoints: readonly Endpoint[];

  /** Endpoint group’s lifetime
   *
   * It must be non-negative integer.
   */
  readonly max_age: number;

  /** Endpoint group name. */
  readonly group?: string;

  /** Whether to enable this endpoint group for all subdomains of the current origin host. */
  readonly include_subdomains?: boolean;
}

/** Endpoint API. */
export interface Endpoint {
  /** The location of the endpoint. */
  readonly url: string;

  /** Number that defines which failover class the endpoint belongs to.
   *
   * It must be non-negative integer.
   */
  readonly priority?: number;

  /** Number that defines load balancing for the failover class that the endpoint belongs to.
   *
   * It must be non-negative integer.
   */
  readonly weight?: number;
}
