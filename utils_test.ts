import uriSuites from "./uri.json" assert { type: "json" };
import uriReferenceSuites from "./uri_reference.json" assert { type: "json" };
import {
  assertURIReferenceFormat,
  assertValidEndpoint,
  assertValidEndpointGroup,
  isURIFormat,
  isURIReferenceFormat,
  stringifyEndpoints,
  stringifyGroups,
  stringifyJsv,
} from "./utils.ts";
import {
  assert,
  assertEquals,
  assertFalse,
  assertIsError,
  assertThrows,
  describe,
  type Endpoint,
  type EndpointGroup,
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

describe("assertValidEndpoint", () => {
  it("should return void if input is valid", () => {
    const table: Endpoint[] = [
      { url: "" },
      { url: "", priority: 0 },
      { url: "", priority: 1 },
      { url: "", weight: 0 },
      { url: "", weight: 1 },
      { url: "", weight: 0, priority: 0 },
    ];

    table.forEach((input) => {
      assertFalse(assertValidEndpoint(input));
    });
  });
  it("should throw error if input include invalid field", () => {
    const table: Endpoint[] = [
      { url: "", priority: NaN },
      { url: "", priority: -1 },
      { url: "", priority: 1.1 },
      { url: "", weight: NaN },
      { url: "", weight: -1 },
      { url: "", weight: 1.1 },
    ];

    table.forEach((input) => {
      assertThrows(() => assertValidEndpoint(input));
    });
  });

  it("should be error message if priority is invalid", () => {
    let err;

    try {
      assertValidEndpoint({ priority: -1, url: "" });
    } catch (e) {
      err = e;
    } finally {
      assertIsError(
        err,
        Error,
        "endpoint.priority must be non-negative integer. -1",
      );
    }
  });

  it("should be error message if weight is invalid", () => {
    let err;

    try {
      assertValidEndpoint({ weight: -1, url: "" });
    } catch (e) {
      err = e;
    } finally {
      assertIsError(
        err,
        Error,
        "endpoint.weight must be non-negative integer. -1",
      );
    }
  });
});

describe("assertValidEndpointGroup", () => {
  it("should return void if input is valid", () => {
    const table: EndpointGroup[] = [
      {
        endpoints: [],
        max_age: 0,
        group: undefined,
        include_subdomains: undefined,
      },
      {
        endpoints: [],
        max_age: 0,
        group: "",
        include_subdomains: true,
      },
    ];

    table.forEach((input) => {
      assertFalse(assertValidEndpointGroup(input));
    });
  });

  it("should throw error if input include invalid field", () => {
    const table: EndpointGroup[] = [
      { max_age: NaN, endpoints: [] },
      { max_age: -1, endpoints: [] },
      { max_age: 1.1, endpoints: [] },
      { max_age: 0, endpoints: [{ url: "", priority: -1 }] },
    ];

    table.forEach((input) => {
      assertThrows(() => assertValidEndpointGroup(input));
    });
  });

  it("should be error message if max_age is invalid", () => {
    let err;

    try {
      assertValidEndpointGroup({ max_age: -1, endpoints: [] });
    } catch (e) {
      err = e;
    } finally {
      assertIsError(
        err,
        Error,
        "group.max_age must be non-negative integer. -1",
      );
    }
  });
});

describe("stringifyGroups", () => {
  it("should return serialized string", () => {
    const table: [EndpointGroup[], string][] = [
      [[], ""],
      [[{ endpoints: [], max_age: 0 }], `{"endpoints":[],"max_age":0}`],
      [
        [{ endpoints: [], max_age: 0 }, { endpoints: [], max_age: 0 }],
        `{"endpoints":[],"max_age":0}, {"endpoints":[],"max_age":0}`,
      ],
      [
        [{ endpoints: [{ url: "", priority: 0, weight: 0 }], max_age: 0 }, {
          endpoints: [],
          max_age: 0,
          group: "default",
          include_subdomains: true,
        }],
        `{"endpoints":[{"url":"","priority":0,"weight":0}],"max_age":0}, {"endpoints":[],"max_age":0,"group":"default","include_subdomains":true}`,
      ],
    ];

    table.forEach(([input, expected]) => {
      assertEquals(stringifyGroups(input), expected);
    });
  });

  it("should throw error if the input is invalid", () => {
    const table: EndpointGroup[][] = [
      [{ max_age: -1, endpoints: [] }],
    ];

    table.forEach((input) => {
      assertThrows(() => stringifyGroups(input));
    });
  });
});
