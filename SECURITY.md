# Security

This is a static-first marketing/directory site: no accounts, no passwords, no
payments, no database. The main risks are therefore injection into rendered
pages, abuse of the one write endpoint, and header/transport misconfiguration.

## Headers

Set for every route in `next.config.ts`:

| Header | Value |
| --- | --- |
| `Content-Security-Policy` | Locked to `'self'` plus an explicit allowlist for Google AdSense and OpenStreetMap tiles. `object-src 'none'`, `frame-ancestors 'none'`, `base-uri 'self'`, `form-action 'self'`, `upgrade-insecure-requests`. |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` (clickjacking, alongside `frame-ancestors`) |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | Camera, microphone, payment, USB and sensors denied |
| `Cross-Origin-Opener-Policy` | `same-origin` |
| `Cross-Origin-Resource-Policy` | `same-origin` |

`X-Powered-By` is disabled.

### Known CSP trade-off

`script-src` includes `'unsafe-inline'`. Next.js injects inline hydration
scripts and Google AdSense injects inline ad code; a nonce-based policy would
require middleware-generated nonces on every request, which forces dynamic
rendering and gives up static generation for a directory whose value is speed.
The mitigation is that no user-supplied content is ever interpolated into a
script context, and all first-party JavaScript is bundled from `'self'`.

## Injection

- All page content is rendered through React, which escapes by default.
- `dangerouslySetInnerHTML` is used in exactly one place, `components/JsonLd.tsx`,
  and only with `JSON.stringify` output whose `<` characters are escaped to
  their unicode form, so a listing name can never close the script tag.
- Search queries are decoded, stripped of angle brackets and length-capped
  (`app/search/[query]/page.tsx`) before being rendered or used.
- Listing data is normalised at import time rather than trusted at render time.

## The one write endpoint: `/api/contact`

- Accepts `POST` with `application/json` only; `GET` returns 405.
- Body capped at 8 KB, each field length-capped, control characters stripped.
- Email validated; name and message have minimum lengths.
- Hidden honeypot field: submissions that fill it are accepted and discarded.
- Per-IP rate limit of 3 requests per minute (in-process; pair with an edge or
  WAF rule for multi-instance deployments).
- Forwards to `CONTACT_WEBHOOK_URL` only. No secrets are exposed to the client
  and nothing is written to disk.

## Outbound links

Every external link uses `rel="noopener noreferrer nofollow"` with
`target="_blank"`, which prevents reverse tabnabbing and keeps link equity from
leaking to unvetted business websites.

## Privacy-affecting behaviour

- Geolocation is requested only on an explicit button press, used in-browser to
  sort listings, and never transmitted or stored.
- Map tiles load from OpenStreetMap only after the visitor opens a map view.
  This is disclosed in the privacy policy.

## Deployment checklist

1. Serve over HTTPS only, with HTTP redirected to HTTPS (HSTS is preloaded).
2. Set `CONTACT_WEBHOOK_URL` if the contact form should reach an inbox.
3. Put a WAF or edge rate limit in front of `/api/*` if the site attracts abuse.
4. Keep dependencies patched: `npm audit` and `npm outdated` on a schedule.
5. Re-run `npm run build` after every data import so pages and the sitemap match.

## Reporting

Security reports: use the contact page, or email the address in `lib/site.ts`.
