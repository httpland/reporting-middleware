// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

import {
  ascii,
  Dictionary,
  isArray,
  isNonNegativeInteger,
  isNumber,
  Item,
  last,
  Parameters,
  String,
  stringifySfv,
} from "./deps.ts";
import { Msg } from "./constants.ts";
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

/** Whether the input is [`<relative-ref>`](https://www.rfc-editor.org/rfc/rfc3986#section-4.2) format or not. */
export function isRelativeRefFormat(input: string): boolean {
  return reRelativeRef.test(input);
}

/** Whether the input [`<URI-reference>`](https://www.rfc-editor.org/rfc/rfc3986#section-4.1) format or not. */
export function isURIReferenceFormat(input: string): boolean {
  return reURL.test(input) || reRelativeRef.test(input);
}

/** Serialize ordered map into string.
 * @throws {Error} If the input include invalid [`<URI-Reference>`]() format.
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
  return [key, new Item([new String(value), new Parameters()])] as [
    string,
    Item,
  ];
}

function _assert(input: string): void {
  assertURIReferenceFormat(input, `${Msg.InvalidURIReference} "${input}"`);
}

function assertNonNegativeInteger(input: number, msg?: string): asserts input {
  if (!isNonNegativeInteger(input)) {
    throw Error(msg);
  }
}

/** Serialize {@link EndpointGroup} of array into string.
 *
 * @throws {Error} If the {@link EndpointGroup} includes invalid field.
 */
export function stringifyGroups(groups: readonly EndpointGroup[]): string {
  groups.forEach(assertValidEndpointGroup);

  return stringifyJsv(groups);
}

function stringifyJSON(input: unknown): string {
  return JSON.stringify(input);
}

function assertValidEndpointGroup(group: EndpointGroup): asserts group {
  nonNegativeInteger(group.max_age, "group.max_age");

  group.endpoints.forEach(assertValidEndpoint);
}

function assertValidEndpoint(endpoint: Endpoint): asserts endpoint {
  nonNegativeInteger(endpoint.priority, `endpoint.priority`);
  nonNegativeInteger(endpoint.weight, `endpoint.weight`);
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

/** Serialize JSON field value into string. */
export function stringifyJsv(input: readonly unknown[]): string {
  /** Specification:
   * 1. generating the JSON representation,
   * 2. stripping all JSON control characters (CR, HTAB, LF), or replacing them by space ("SP") characters,
   * 3. replacing all remaining non-VSPACE characters by the equivalent backslash-escape sequence ([RFC8259], Section 7).
   *
   * The resulting list of strings is transformed into an HTTP field value by combining them using comma (%x2C) plus optional SP as delimiter,
   * and encoding the resulting string into an octet sequence using the US-ASCII character encoding scheme ([RFC0020]).
   */

  const result = input
    .map(stringifyJSON)
    .map(stripControlChar)
    .map(ascii.escapeNonAsciis)
    .join(", ");

  return result;
}

/**
 * ```abnf
 * control-characters = CR / HTAB / LF
 * ```
 */
const reControl = /(?:\\t)|(?:\\r)|(?:\\n)/g;

function stripControlChar(input: string): string {
  return input.replace(reControl, "");
}
