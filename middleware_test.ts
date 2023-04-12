import { reportingEndpoints, reportTo } from "./middleware.ts";
import {
  assert,
  assertIsError,
  assertThrows,
  describe,
  equalsResponse,
  it,
  ReportingHeader,
} from "./_dev_deps.ts";
import { EndpointGroup } from "./types.ts";

describe("reportingEndpoints", () => {
  it("should return same response if the response include header", async () => {
    const middleware = reportingEndpoints({});
    const initResponse = new Response(null, {
      headers: {
        [ReportingHeader.ReportingEndpoints]: "",
      },
    });

    const response = await middleware(new Request("test:"), () => initResponse);

    assert(response === initResponse);
  });

  it("should return response what include reporting-endpoints header", async () => {
    const key = "default";
    const endpoints = "https://test.test";
    const middleware = reportingEndpoints({ [key]: endpoints });

    const response = await middleware(
      new Request("test:"),
      () => new Response(),
    );

    assert(
      await equalsResponse(
        response,
        new Response(null, {
          headers: {
            [ReportingHeader.ReportingEndpoints]: `${key}="${endpoints}"`,
          },
        }),
        true,
      ),
    );
  });

  it("should throw error if the endpoints include invalid value", () => {
    const table: (Record<string, string> | [string, string][])[] = [
      { "": "" },
      { "a": ":" },
      [["a", ":"], ["", ""]],
    ];

    table.forEach((input) => {
      assertThrows(() => reportingEndpoints(input));
    });
  });

  it("should be error message if the value is not URI-reference", () => {
    let err;

    try {
      reportingEndpoints([["a", ":"], ["", ""]]);
    } catch (e) {
      err = e;
    } finally {
      assertIsError(err, Error, `invalid <URI-reference> format. ":"`);
    }
  });

  it("should be error message if the key is invalid", () => {
    let err;

    try {
      reportingEndpoints([["", ""]]);
    } catch (e) {
      err = e;
    } finally {
      assertIsError(err, Error, `invalid <key> format. key of ""`);
    }
  });
});

describe("reportTo", () => {
  it("should return same response if the response include header", async () => {
    const middleware = reportTo([]);
    const initResponse = new Response(null, {
      headers: { [ReportingHeader.ReportTo]: "" },
    });

    const response = await middleware(new Request("test:"), () => initResponse);

    assert(response === initResponse);
  });

  it("should return response what include report-to header", async () => {
    const middleware = reportTo([{
      max_age: 86400,
      endpoints: [{ url: "https://test.test" }],
    }]);

    const response = await middleware(
      new Request("test:"),
      () => new Response(),
    );

    assert(
      await equalsResponse(
        response,
        new Response(null, {
          headers: {
            [ReportingHeader.ReportTo]:
              `{"max_age":86400,"endpoints":[{"url":"https://test.test"}]}`,
          },
        }),
        true,
      ),
    );
  });

  it("should throw error if the endpoint groups include invalid field", () => {
    const table: EndpointGroup[][] = [
      [{ max_age: NaN, endpoints: [] }],
      [{ max_age: -1, endpoints: [] }],
      [{ max_age: 1.1, endpoints: [] }],
      [{ max_age: 0, endpoints: [{ url: "", priority: -1 }] }],
      [{ max_age: 0, endpoints: [{ url: "", weight: -1 }] }],
    ];

    table.forEach((input) => {
      assertThrows(() => reportTo(input));
    });
  });

  it("should be error message if the max_age is invalid", () => {
    let err;

    try {
      reportTo([{ max_age: NaN, endpoints: [] }]);
    } catch (e) {
      err = e;
    } finally {
      assertIsError(
        err,
        Error,
        "group.max_age must be non-negative integer. NaN",
      );
    }
  });

  it("should be error message if the endpoint.priority is invalid", () => {
    let err;

    try {
      reportTo([{ max_age: 0, endpoints: [{ url: "", priority: NaN }] }]);
    } catch (e) {
      err = e;
    } finally {
      assertIsError(
        err,
        Error,
        "endpoint.priority must be non-negative integer. NaN",
      );
    }
  });

  it("should be error message if the endpoint.weight is invalid", () => {
    let err;

    try {
      reportTo([{ max_age: 0, endpoints: [{ url: "", weight: NaN }] }]);
    } catch (e) {
      err = e;
    } finally {
      assertIsError(
        err,
        Error,
        "endpoint.weight must be non-negative integer. NaN",
      );
    }
  });
});
