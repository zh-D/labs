# Content Security Policies

Webpack is capable of adding `nonce` to all scripts that it loads.

## Examples

In the entry file:

```javascript
// ...
__webpack_nonce__ = 'c29tZSBjb29sIHN0cmluZyB3aWxsIHBvcCB1cCAxMjM=';
// ...
```

## Enabling CSP

Please note that CSPs are not enabled by default.

A corresponding header `Content-Security-Policy`

or meta tag `<meta http-equiv="Content-Security-Policy" ...>`

needs to be sent with the document to instruct the browser to enable the CSP.

Here's an example of what a CSP header including a CDN white-listed URL might look like:

```javascript
Content-Security-Policy: default-src 'self'; script-src 'self'
https://trusted.cdn.com;
```

For more information on CSP and `nonce` attribute, please refer to **Further Reading** section at the bottom of this page.

## Trusted Types

Webpack is also capable of using Trusted Types to load dynamically constructed scripts, to adhere to CSP [`require-trusted-types-for`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/require-trusted-types-for) directive restrictions. See [`output.trustedTypes`](https://webpack.js.org/configuration/output/#outputtrustedtypes) configuration option.

## Further Reading

- [Nonce purpose explained](https://stackoverflow.com/questions/42922784/what-s-the-purpose-of-the-html-nonce-attribute-for-script-and-style-elements)
- [On the Insecurity of Whitelists and the Future of Content Security Policy](https://ai.google/research/pubs/pub45542)
- [Locking Down Your Website Scripts with CSP, Hashes, Nonces and Report URI](https://www.troyhunt.com/locking-down-your-website-scripts-with-csp-hashes-nonces-and-report-uri/)
- [CSP on MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Trusted Types](https://web.dev/trusted-types)