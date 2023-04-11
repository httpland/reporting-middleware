import uriSuites from "./uri.json" assert { type: "json" };
import uriReferenceSuites from "./uri_reference.json" assert { type: "json" };
import {
  assertURIReferenceFormat,
  isURIFormat,
  isURIReferenceFormat,
  stringifyEndpoints,
} from "./utils.ts";
import {
  assertEquals,
  assertFalse,
  assertThrows,
  describe,
  it,
} from "./_dev_deps.ts";

describe("isURIFormat", () => {
  uriSuites.forEach((input) => {
    it(input.raw, () => {
      assertEquals(isURIFormat(input.raw), input.valid);
    });
  });
});

describe("isURIReferenceFormat", () => {
  uriReferenceSuites.forEach((input) => {
    it(input.raw, () => {
      assertEquals(isURIReferenceFormat(input.raw), input.valid);
    });
  });
});

describe("assertURIReferenceFormat", () => {
  uriReferenceSuites.forEach((input) => {
    it(input.raw, () => {
      if (input.valid) {
        assertFalse(assertURIReferenceFormat(input.raw));
      } else {
        assertThrows(() => assertURIReferenceFormat(input.raw));
      }
    });
  });
});

describe("stringifyEndpoints", () => {
  const table: (Record<string, string> | [string, string][])[] = [
    { "": "" },
    { "a": ":" },
    [["a", ":"], ["", ""]],
  ];

  table.forEach((input) => {
    assertThrows(() => stringifyEndpoints(input));
  });
});
