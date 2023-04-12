import uriSuites from "./uri.json" assert { type: "json" };
import uriReferenceSuites from "./uri_reference.json" assert { type: "json" };
import {
  assertURIReferenceFormat,
  isURIFormat,
  isURIReferenceFormat,
  stringifyEndpoints,
  stringifyJsv,
} from "./utils.ts";
import {
  assert,
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

const reVCHAR = /^[\x21-\x7E]*$/;

describe("stringifySfv", () => {
  it("should only VCHAR", () => {
    const table: unknown[][] = [
      ["a"],
      ["abc"],
      ["\t"],
      ["\t\r\n"],
      ["\x00"],
      ["\x01"],
      ["\x02"],
      ["\x03"],
      ["あいう"],
      [{
        "destination": "Münster",
        "price": 123,
        "currency": "€",
      }],
    ];

    table.forEach((input) => {
      assert(reVCHAR.test(stringifyJsv(input)));
    });
  });
  it("should serialize non-ascii escaped string", () => {
    const table: [unknown[], string][] = [
      [["a"], `"a"`],
      [["a"], `"a"`],
      [["abc"], `"abc"`],
      [["a\tb"], `"ab"`],
      [["\u2028"], `"\\u2028"`],
      [["\u2029"], `"\\u2029"`],
      [["\f"], `"\\f"`],
      [["\b"], `"\\b"`],
      [[`"`], String.raw`"\""`],
      [["\x5C"], String.raw`"\\"`],
      [["/"], String.raw`"/"`],
      [[`"`], `"\\""`],
      [
        [{
          "destination": "Münster",
          "price": 123,
          "currency": "€",
        }],
        String
          .raw`{"destination":"M\u00fcnster","price":123,"currency":"\u20ac"}`,
      ],
      [
        ["http://test.test"],
        `"http://test.test"`,
      ],
      [
        ["http://test.test", "test"],
        `"http://test.test", "test"`,
      ],
      [
        [{}, {}],
        `{}, {}`,
      ],
    ];

    table.forEach(([input, expected]) => {
      assertEquals(stringifyJsv(input), expected);
    });
  });
});
