// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

import {
  Dictionary,
  isArray,
  isNonNegativeInteger,
  isNumber,
  Item,
  last,
  Parameters,
  String,
  stringifyJfv,
  stringifySfv,
} from "./deps.ts";
import { Msg, Property } from "./constants.ts";
import type { Endpoint, EndpointGroup } from "./types.ts";

/** Generated from `_abnf.ts` */
const reURL =
  /^[A-Za-z](([A-Za-z])|(\d)|([+.-]))*:((\/{2}(?:(((([A-Za-z])|(\d)|([._~-])))|(%[\dA-Fa-f]{2})|([!$&'()*+,;=])|:)*@)?((\[(((((?:[\dA-Fa-f]{1,4}:){6}(([\dA-Fa-f]{1,4}:[\dA-Fa-f]{1,4})|(((\d)|([1-9]\d)|(1\d{2})|(2[0-4]\d)|(25[0-5]))\.((\d)|([1-9]\d)|(1\d{2})|(2[0-4]\d)|(25[0-5]))\.((\d)|([1-9]\d)|(1\d{2})|(2[0-4]\d)|(25[0-5]))\.((\d)|([1-9]\d)|(1\d{2})|(2[0-4]\d)|(25[0-5])))))|(:{2}(?:[\dA-Fa-f]{1,4}:){5}(([\dA-Fa-f]{1,4}:[\dA-Fa-f]{1,4})|(((\d)|([1-9]\d)|(1\d{2})|(2[0-4]\d)|(25[0-5]))\.((\d)|([1-9]\d)|(1\d{2})|(2[0-4]\d)|(25[0-5]))\.((\d)|([1-9]\d)|(1\d{2})|(2[0-4]\d)|(25[0-5]))\.((\d)|([1-9]\d)|(1\d{2})|(2[0-4]\d)|(25[0-5])))))|((?:[\dA-Fa-f]{1,4})?:{2}(?:[\dA-Fa-f]{1,4}:){4}(([\dA-Fa-f]{1,4}:[\dA-Fa-f]{1,4})|(((\d)|([1-9]\d)|(1\d{2})|(2[0-4]\d)|(25[0-5]))\.((\d)|([1-9]\d)|(1\d{2})|(2[0-4]\d)|(25[0-5]))\.((\d)|([1-9]\d)|(1\d{2})|(2[0-4]\d)|(25[0-5]))\.((\d)|([1-9]\d)|(1\d{2})|(2[0-4]\d)|(25[0-5])))))|((?:(?:[\dA-Fa-f]{1,4}:){0,1}[\dA-Fa-f]{1,4})?:{2}(?:[\dA-Fa-f]{1,4}:){3}(([\dA-Fa-f]{1,4}:[\dA-Fa-f]{1,4})|(((\d)|([1-9]\d)|(1\d{2})|(2[0-4]\d)|(25[0-5]))\.((\d)|([1-9]\d)|(1\d{2})|(2[0-4]\d)|(25[0-5]))\.((\d)|([1-9]\d)|(1\d{2})|(2[0-4]\d)|(25[0-5]))\.((\d)|([1-9]\d)|(1\d{2})|(2[0-4]\d)|(25[0-5])))))|((?:(?:[\dA-Fa-f]{1,4}:){0,2}[\dA-Fa-f]{1,4})?:{2}(?:[\dA-Fa-f]{1,4}:){2}(([\dA-Fa-f]{1,4}:[\dA-Fa-f]{1,4})|(((\d)|([1-9]\d)|(1\d{2})|(2[0-4]\d)|(25[0-5]))\.((\d)|([1-9]\d)|(1\d{2})|(2[0-4]\d)|(25[0-5]))\.((\d)|([1-9]\d)|(1\d{2})|(2[0-4]\d)|(25[0-5]))\.((\d)|([1-9]\d)|(1\d{2})|(2[0-4]\d)|(25[0-5])))))|((?:(?:[\dA-Fa-f]{1,4}:){0,3}[\dA-Fa-f]{1,4})?:{2}[\dA-Fa-f]{1,4}:(([\dA-Fa-f]{1,4}:[\dA-Fa-f]{1,4})|(((\d)|([1-9]\d)|(1\d{2})|(2[0-4]\d)|(25[0-5]))\.((\d)|([1-9]\d)|(1\d{2})|(2[0-4]\d)|(25[0-5]))\.((\d)|([1-9]\d)|(1\d{2})|(2[0-4]\d)|(25[0-5]))\.((\d)|([1-9]\d)|(1\d{2})|(2[0-4]\d)|(25[0-5])))))|((?:(?:[\dA-Fa-f]{1,4}:){0,4}[\dA-Fa-f]{1,4})?:{2}(([\dA-Fa-f]{1,4}:[\dA-Fa-f]{1,4})|(((\d)|([1-9]\d)|(1\d{2})|(2[0-4]\d)|(25[0-5]))\.((\d)|([1-9]\d)|(1\d{2})|(2[0-4]\d)|(25[0-5]))\.((\d)|([1-9]\d)|(1\d{2})|(2[0-4]\d)|(25[0-5]))\.((\d)|([1-9]\d)|(1\d{2})|(2[0-4]\d)|(25[0-5])))))|((?:(?:[\dA-Fa-f]{1,4}:){0,5}[\dA-Fa-f]{1,4})?:{2}[\dA-Fa-f]{1,4})|((?:(?:[\dA-Fa-f]{1,4}:){0,6}[\dA-Fa-f]{1,4})?:{2})))|(v[\dA-Fa-f]+\.(((([A-Za-z])|(\d)|([._~-])))|([!$&'()*+,;=])|:)+))])|(((\d)|([1-9]\d)|(1\d{2})|(2[0-4]\d)|(25[0-5]))\.((\d)|([1-9]\d)|(1\d{2})|(2[0-4]\d)|(25[0-5]))\.((\d)|([1-9]\d)|(1\d{2})|(2[0-4]\d)|(25[0-5]))\.((\d)|([1-9]\d)|(1\d{2})|(2[0-4]\d)|(25[0-5])))|((((([A-Za-z])|(\d)|([._~-])))|(%[\dA-Fa-f]{2})|([!$&'()*+,;=]))*))(?::\d*)?(?:\/(((([A-Za-z])|(\d)|([._~-])))|(%[\dA-Fa-f]{2})|([!$&'()*+,;=])|([:@]))*)*)|(\/(?:(((([A-Za-z])|(\d)|([._~-])))|(%[\dA-Fa-f]{2})|([!$&'()*+,;=])|([:@]))+(?:\/(((([A-Za-z])|(\d)|([._~-])))|(%[\dA-Fa-f]{2})|([!$&'()*+,;=])|([:@]))*)*)?)|((((([A-Za-z])|(\d)|([._~-])))|(%[\dA-Fa-f]{2})|([!$&'()*+,;=])|([:@]))+(?:\/(((([A-Za-z])|(\d)|([._~-])))|(%[\dA-Fa-f]{2})|([!$&'()*+,;=])|([:@]))*)*)|)(?:\?(((((([A-Za-z])|(\d)|([._~-])))|(%[\dA-Fa-f]{2})|([!$&'()*+,;=])|([:@])))|([/?]))*)?(?:#(((((([A-Za-z])|(\d)|([._~-])))|(%[\dA-Fa-f]{2})|([!$&'()*+,;=])|([:@])))|([/?]))*)?$/;
const reRelativeRef =
  /^(?:\/{2}(?:(?:[A-Za-z]|\d|[._~-]|%[\dA-Fa-f]{2}|[!$&'()*+,;=]|:)*@)?(?:\[(?:(?:[\dA-Fa-f]{1,4}:){6}(?:[\dA-Fa-f]{1,4}:[\dA-Fa-f]{1,4}|(?:(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5]))|:{2}(?:[\dA-Fa-f]{1,4}:){5}(?:[\dA-Fa-f]{1,4}:[\dA-Fa-f]{1,4}|(?:(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5]))|(?:[\dA-Fa-f]{1,4})?:{2}(?:[\dA-Fa-f]{1,4}:){4}(?:[\dA-Fa-f]{1,4}:[\dA-Fa-f]{1,4}|(?:(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5]))|(?:(?:[\dA-Fa-f]{1,4}:){0,1}[\dA-Fa-f]{1,4})?:{2}(?:[\dA-Fa-f]{1,4}:){3}(?:[\dA-Fa-f]{1,4}:[\dA-Fa-f]{1,4}|(?:(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5]))|(?:(?:[\dA-Fa-f]{1,4}:){0,2}[\dA-Fa-f]{1,4})?:{2}(?:[\dA-Fa-f]{1,4}:){2}(?:[\dA-Fa-f]{1,4}:[\dA-Fa-f]{1,4}|(?:(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5]))|(?:(?:[\dA-Fa-f]{1,4}:){0,3}[\dA-Fa-f]{1,4})?:{2}[\dA-Fa-f]{1,4}:(?:[\dA-Fa-f]{1,4}:[\dA-Fa-f]{1,4}|(?:(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5]))|(?:(?:[\dA-Fa-f]{1,4}:){0,4}[\dA-Fa-f]{1,4})?:{2}(?:[\dA-Fa-f]{1,4}:[\dA-Fa-f]{1,4}|(?:(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5]))|(?:(?:[\dA-Fa-f]{1,4}:){0,5}[\dA-Fa-f]{1,4})?:{2}[\dA-Fa-f]{1,4}|(?:(?:[\dA-Fa-f]{1,4}:){0,6}[\dA-Fa-f]{1,4})?:{2}|v[\dA-Fa-f]+\.(?:[A-Za-z]|\d|[._~-]|[!$&'()*+,;=]|:)+)]|(?:(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])|(?:[A-Za-z]|\d|[._~-]|%[\dA-Fa-f]{2}|[!$&'()*+,;=])*)(?::\d*)?(?:\/(?:[A-Za-z]|\d|[._~-]|%[\dA-Fa-f]{2}|[!$&'()*+,;=]|[:@])*)*|\/(?:(?:[A-Za-z]|\d|[._~-]|%[\dA-Fa-f]{2}|[!$&'()*+,;=]|[:@])+(?:\/(?:[A-Za-z]|\d|[._~-]|%[\dA-Fa-f]{2}|[!$&'()*+,;=]|[:@])*)*)?|(?:[A-Za-z]|\d|[._~-]|%[\dA-Fa-f]{2}|[!$&'()*+,;=]|@)+(?:\/(?:[A-Za-z]|\d|[._~-]|%[\dA-Fa-f]{2}|[!$&'()*+,;=]|[:@])*)*|)(?:\?(?:[A-Za-z]|\d|[._~-]|%[\dA-Fa-f]{2}|[!$&'()*+,;=]|[:@]|[/?])*)?(?:#(?:[A-Za-z]|\d|[._~-]|%[\dA-Fa-f]{2}|[!$&'()*+,;=]|[:@]|[/?])*)?$/;

/** Whether the input is [`<URI>`](https://www.rfc-editor.org/rfc/rfc3986#section-3) format or not. */
export function isURIFormat(input: string): boolean {
  return reURL.test(input);
}

/** Whether the input [`<URI-reference>`](https://www.rfc-editor.org/rfc/rfc3986#section-4.1) format or not. */
export function isURIReferenceFormat(input: string): boolean {
  return reURL.test(input) || reRelativeRef.test(input);
}

/** Serialize ordered map into string.
 * @throws {Error} If the input include invalid [`<URI-Reference>`](https://www.rfc-editor.org/rfc/rfc3986#section-4.1) format.
 */
export function stringifyEndpoints(
  endpoints: Record<string, string> | readonly (readonly [string, string])[],
): string {
  const entries = isArray(endpoints) ? endpoints : Object.entries(endpoints);

  entries.map<string>(last).forEach(_assert);

  const nodes = entries.map(entry2Dict);
  const dictionary = new Dictionary(nodes);
  const fieldValue = stringifySfv(dictionary);

  return fieldValue;
}

/** Assert the input is [`<URI-reference>`](https://www.rfc-editor.org/rfc/rfc3986#section-4.1) format. */
export function assertURIReferenceFormat(
  input: string,
  msg?: string,
): asserts input {
  if (!isURIReferenceFormat(input)) throw Error(msg);
}

function entry2Dict(
  [key, value]: readonly [key: string, value: string],
): [string, Item] {
  return [key, new Item([new String(value), new Parameters()])];
}

function _assert(input: string): void {
  assertURIReferenceFormat(input, `${Msg.InvalidURIReference} "${input}"`);
}

function assertNonNegativeInteger(input: number, msg?: string): asserts input {
  if (!isNonNegativeInteger(input)) throw Error(msg);
}

/** Serialize {@link EndpointGroup} of array into string.
 *
 * @throws {Error} If the {@link EndpointGroup} includes invalid field.
 */
export function stringifyGroups(groups: readonly EndpointGroup[]): string {
  groups.forEach(assertValidEndpointGroup);

  return stringifyJfv(groups);
}

export function assertValidEndpointGroup(group: EndpointGroup): asserts group {
  nonNegativeInteger(group.max_age, `${Property.Group}.${Property.MaxAge}`);

  group.endpoints.forEach(assertValidEndpoint);
}

export function assertValidEndpoint(endpoint: Endpoint): asserts endpoint {
  nonNegativeInteger(
    endpoint[Property.Priority],
    `${Property.Endpoint}.${Property.Priority}`,
  );
  nonNegativeInteger(
    endpoint[Property.Weight],
    `${Property.Endpoint}.${Property.Weight}`,
  );
}

function nonNegativeInteger(
  input: number | undefined,
  name: string,
): asserts input {
  isNumber(input) && assertNonNegativeInteger(
    input,
    `${name} must be non-negative integer. ${input}`,
  );
}
