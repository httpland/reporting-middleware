import {
  either,
  maybe,
  sequence,
  suffix,
} from "https://esm.sh/compose-regexp@0.7.1?pin=v114";
import { optimize } from "https://esm.sh/regexp-tree@0.1.24?pin=114";

const ALPHA = /[a-zA-Z]/;
const DIGIT = /\d/;
const HEXDIG = /[\dA-Fa-f]/;

/**
 * ```abfn
 * scheme = ALPHA *( ALPHA / DIGIT / "+" / "-" / "." )
 * ```
 */
const scheme = sequence(
  ALPHA,
  suffix("*", either(ALPHA, DIGIT, /[+.-]/)),
);

/**
 * ```abnf
 * unreserved = ALPHA / DIGIT / "-" / "." / "_" / "~"
 * ```
 */
const unreserved = either(ALPHA, DIGIT, /[._~-]/);

/**
 * ```abnf
 * h16 = 1*4HEXDIG
 * ```
 */
const h16 = suffix([1, 4], HEXDIG);

/**
 * ```abnf
 * pct-encoded = "%" HEXDIG HEXDIG
 * ```
 */
const pctEncoded = sequence("%", HEXDIG, HEXDIG);

/**
 * ```abnf
 * sub-delims = "!" / "$" / "&" / "'" / "(" / ")"
 *              / "*" / "+" / "," / ";" / "="
 * ```
 */
const subDelims = /[!$&'()*+,;=]/;

// function either(...args: readonly (RegExp | string)[]): RegExp {
//   const str = args.map((regex) =>
//     typeof regex === "string"
//       ? escapeStringRegexp(regex)
//       : `(?:${regex.source})`
//   ).join("|");

//   return new RegExp(`(${str})`);
// }

/**
 * ```abnf
 * pchar  = unreserved / pct-encoded / sub-delims / ":" / "@"
 * ```
 */
const pchar = either(unreserved, pctEncoded, subDelims, /[:@]/);

/**
 * ```abnf
 * segment = *pchar
 * ```
 */
const segment = suffix("*", pchar);

/**
 * ```abnf
 * segment-nz = 1*pchar
 * ```
 */
const segmentNz = suffix("+", pchar);

/**
 * ```abnf
 * userinfo = *( unreserved / pct-encoded / sub-delims / ":" )
 * ```
 */
const userInfo = suffix("*", either(unreserved, pctEncoded, subDelims, ":"));

/**
 * ```abnf
 * port = *DIGIT
 * ```
 */
const port = suffix("*", DIGIT);

/**
 * ```abnf
 * dec-octet = DIGIT                   ; 0-9
 *             / %x31-39 DIGIT         ; 10-99
 *             / "1" 2DIGIT            ; 100-199
 *             / "2" %x30-34 DIGIT     ; 200-249
 *             / "25" %x30-35          ; 250-255
 * ```
 */
const dec_octet = either(
  DIGIT,
  sequence(/[\x31-\x39]/, DIGIT),
  sequence("1", suffix(2, DIGIT)),
  sequence("2", /[\x30-\x34]/, DIGIT),
  sequence("25", /[\x30-\x35]/),
);

/**
 * ```abnf
 *  IPv4address = dec-octet "." dec-octet "." dec-octet "." dec-octet
 * ```
 */
const IPv4address = sequence(
  dec_octet,
  ".",
  dec_octet,
  ".",
  dec_octet,
  ".",
  dec_octet,
);

/**
 * ```abnf
 * ls32 = ( h16 ":" h16 ) / IPv4address
 * ```
 */
const ls32 = either(sequence(h16, ":", h16), IPv4address);

/**
 * ```abnf
 * IPv6address = 6( h16 ":" ) ls32
 *               / "::" 5( h16 ":" ) ls32
 *               / [               h16 ] "::" 4( h16 ":" ) ls32
 *               / [ *1( h16 ":" ) h16 ] "::" 3( h16 ":" ) ls32
 *               / [ *2( h16 ":" ) h16 ] "::" 2( h16 ":" ) ls32
 *               / [ *3( h16 ":" ) h16 ] "::"    h16 ":"   ls32
 *               / [ *4( h16 ":" ) h16 ] "::"              ls32
 *               / [ *5( h16 ":" ) h16 ] "::"              h16
 *               / [ *6( h16 ":" ) h16 ] "::"
 * ```
 */
const IPv6Address = either(
  sequence(suffix(6, h16, ":"), ls32),
  sequence("::", suffix(5, h16, ":"), ls32),
  sequence(maybe(h16), "::", suffix(4, h16, ":"), ls32),
  sequence(
    maybe(suffix([0, 1], h16, ":"), h16),
    "::",
    suffix(3, h16, ":"),
    ls32,
  ),
  sequence(
    maybe(suffix([0, 2], h16, ":"), h16),
    "::",
    suffix(2, h16, ":"),
    ls32,
  ),
  sequence(maybe(suffix([0, 3], h16, ":"), h16), "::", h16, ":", ls32),
  sequence(maybe(suffix([0, 4], h16, ":"), h16), "::", ls32),
  sequence(maybe(suffix([0, 5], h16, ":"), h16), "::", h16),
  sequence(maybe(suffix([0, 6], h16, ":"), h16), "::"),
);

/**
 * ```abnf
 * IPvFuture = "v" 1*HEXDIG "." 1*( unreserved / sub-delims / ":" )
 * ```
 */
const IpvFuture = sequence(
  "v",
  suffix("+", HEXDIG),
  ".",
  suffix("+", either(unreserved, subDelims, ":")),
);

/**
 * ```abnf
 * IP-literal = "[" ( IPv6address / IPvFuture  ) "]"
 * ```
 */
const IPLiteral = sequence("[", either(IPv6Address, IpvFuture), "]");

/**
 * ```abnf
 * reg-name = *( unreserved / pct-encoded / sub-delims )
 * ```
 */
const reg_name = suffix("*", either(unreserved, pctEncoded, subDelims));

/**
 * ```abnf
 * host = IP-literal / IPv4address / reg-name
 * ```
 */
const host = either(IPLiteral, IPv4address, reg_name);

/**
 * ```abfn
 * authority = [ userinfo "@" ] host [ ":" port ]
 * ````
 */
const authority = sequence(maybe(userInfo, "@"), host, maybe(":", port));

/**
 * ```abfn
 * path-abempty = *( "/" segment )
 * ```
 */
const pathAbempty = suffix("*", "/", segment);

/**
 * ```abnf
 * path-absolute = "/" [ segment-nz *( "/" segment ) ]
 * ```
 */
const pathAbsolute = sequence("/", maybe(segmentNz, suffix("*", "/", segment)));

/**
 * ```abnf
 * path-rootless = segment-nz *( "/" segment )
 * ```
 */
const pathRootless = sequence(segmentNz, suffix("*", "/", segment));

/**
 * ```abnf
 * path-empty = 0<pchar>
 * ```
 */
const pathEmpty = "";

/**
 * ```abfn
 * hier-part = "//" authority path-abempty
 *             / path-absolute
 *             / path-rootless
 *             / path-empty
 * ```
 */
const hierPart = either(
  sequence("//", authority, pathAbempty),
  pathAbsolute,
  pathRootless,
  "",
);

// function either(...args: (string | RegExp)[]): RegExp {
//   const string = args.map((f) => typeof f === "string" ? f : `(${f.source})`)
//     .join("|");

//   return new RegExp(`(${string})`);
// }

/**
 * ```abnf
 * query  = *( pchar / "/" / "?" )
 * ```
 */
const query = suffix("*", either(pchar, /[/?]/));

/**
 * ```abfn
 * fragment = *( pchar / "/" / "?" )
 * ```
 */
const fragment = suffix("*", either(pchar, /[/?]/));

/**
 * ```abnf
 * segment-nz-nc = 1*( unreserved / pct-encoded / sub-delims / "@" )
                 ; non-zero-length segment without any colon ":"
 * ```
 */
const segmentNzNc = suffix("+", either(unreserved, pctEncoded, subDelims, "@"));

/**
 * ```abnf
 * path-noscheme = segment-nz-nc *( "/" segment )
 * ```
 */
const pathNoScheme = sequence(segmentNzNc, suffix("*", "/", segment));

/**
 * ```abnf
 * relative-part = "//" authority path-abempty
 *                 / path-absolute
 *                 / path-noscheme
 *                 / path-empty
 * ```
 */
const relativePart = either(
  sequence("//", authority, pathAbempty),
  pathAbsolute,
  pathNoScheme,
  pathEmpty,
);

/**
 * ```abfn
 * relative-ref = relative-part [ "?" query ] [ "#" fragment ]
 * ```
 */
const relativeRef = sequence(
  relativePart,
  maybe("?", query),
  maybe("#", fragment),
);

/**
 * ```abnf
 * URI = scheme ":" hier-part [ "?" query ] [ "#" fragment ]
 * ```
 */
const URI = sequence(
  scheme,
  ":",
  hierPart,
  maybe("?", query),
  maybe("#", fragment),
);

if (import.meta.main) {
  console.log("URI: ", optimize(sequence(/^/, URI, /$/)).toRegExp());
  console.log(
    "relative-ref ",
    optimize(sequence(/^/, relativeRef, /$/)).toRegExp(),
  );
}
