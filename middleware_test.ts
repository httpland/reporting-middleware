import { reportingEndpoints } from "./middleware.ts";
import {
  assert,
  assertIsError,
  assertThrows,
  describe,
  equalsResponse,
  it,
  ReportingHeader,
} from "./_dev_deps.ts";

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
