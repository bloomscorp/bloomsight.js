# Migrating a project from Bloomsight to blooms.ai

This library talks to **two** backends, and which one it uses is decided by a
single config field.

| | Where it lives | What selects it |
|---|---|---|
| **B1** — the standalone Bloomsight server | everything in `src/` except `src/b2/` | the default |
| **B2** — Bloomsight inside blooms.ai | `src/b2/` | `target: 'blooms-ai'` |

**Upgrading the library is not a migration.** With no `target`, a project keeps
hitting the same URLs with the same payloads it always did. Nothing about B1's
code was changed to add B2, so a version bump cannot alter how an existing site
behaves.

## Step 1 — bump the library, change nothing else

```html
<script src="https://cdn.jsdelivr.net/npm/@bloomscorp/bloomsight.js@0.8.0/umd/production.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@bloomscorp/bloomsight.js@0.8.0/umd/dom.js"></script>
```

> ⚠️ **The CDN URL form changed in 0.8.0.** It used to be
> `cdn.jsdelivr.net/gh/bloomscorp/bloomsight.js@v0.7.0/...`, served from the git
> tag. From 0.8.0 the bundle is published to npm and jsDelivr serves it from
> there — `/npm/@bloomscorp/bloomsight.js@0.8.0/...`, no `v` on the version.
>
> Old `gh/` URLs keep working for the versions that already have them, so no
> site breaks. But **`gh/...@v0.8.0` does not exist** — `umd/` is no longer
> committed to git. Since every site is re-embedding anyway, use the npm form.

For an Angular project there is no script tag; bump the dependency instead:

```
npm install @bloomscorp/bloomsight.js@^0.8.0
```

```js
init({
  propertyToken: '65d72f0b5e990c6028790156',
  isDevelopmentMode: false,
});
// → still B1, exactly as before
```

**`@bloomscorp/ngx-bloomsight` needs no release at all.** It declares
`@bloomscorp/bloomsight.js` as a *peer* dependency with the range
`>=0.7.0 <1.0.0`, which `0.8.0` already satisfies — so the Angular app bumps the
SDK itself and the wrapper is untouched. It also forwards the whole config
object into `init()`, so `target` flows through on its own.

## Step 2 — flip the project, when it is ready

```js
init({
  propertyToken: '65d72f0b5e990c6028790156',   // unchanged, never regenerate it
  isDevelopmentMode: false,
  target: 'blooms-ai',                          // ← the migration
});
```

That is the whole change. The property token stays the same, and
`resolveSimpleEvent` / `resolveDataEvent` call sites stay the same.

### Config reference

| Field | Default | Notes |
|---|---|---|
| `target` | `'bloomsight'` | `'blooms-ai'` moves **events only** |
| `apiBase` | `https://z.bloomscorp.com` | B2 only. Point one project at staging first |
| `onError(err)` | — | Every B2 failure, with the server's own code |
| `debug` | `false` | Full logging without `isDevelopmentMode` |

## What changes when a project is on B2

**Email does not move.** `sendEmail` always goes to the standalone server,
whatever `target` says. Email is migrated separately, later.

**Page views are not collected.** blooms.ai has no page-view endpoint, so
`pageViewObserver()` is a no-op under B2 rather than an error — the Angular
wrapper's automatic `NavigationEnd` wiring keeps working untouched.

**Events carry more.** B2 sends `occurredAt` (when the event happened, not when
it arrived) and a real `sessionId`, instead of B1's `newSession` boolean.

**Geo is resolved server-side.** B2 omits `ipAddress`, `city`, `region` and
`countryCode`; blooms.ai derives all four from the request's edge headers. So B2
never calls `/service/get-my-ip` — one fewer request per session, and better
data.

**Beacons survive navigation.** B2 sends with `keepalive: true`, so an event
fired from a link that navigates away is no longer cancelled.

**The bot check no longer latches.** B1 sets `config.stopAll = true` the first
time it sees a bot user agent, which disables tracking for the rest of the page.
B2 skips that one event instead.

**Failures are visible.** This is the important one for whoever runs a cutover.
B1 reports failures with a `console.log` that only appears in development mode,
so a misconfigured site looks identical to a working one: the page behaves
normally and no data arrives. B2 always calls `onError`, logs everything in
`debug` mode, and otherwise warns **once per distinct failure code** so a broken
cutover is visible in the console without flooding it.

**The property pre-flight no longer kills the SDK.** B1 hard-stops everything
when its property lookup does not match. B2 only warns: the server authenticates
every beacon against the website's allowed origins anyway, so it is the authority
— and a client-side kill switch on information the client cannot be trusted about
only makes mistakes harder to diagnose.

## Codes you are likely to see in `onError`

| Code | Meaning |
|---|---|
| `ORIGIN_REJECTED` | The page's origin is not allowed for this website. Add it to the website's allowed origins in blooms.ai |
| `UNKNOWN_PROPERTY` | The property token does not exist in blooms.ai — it has not been imported yet |
| `EVENT_PROPERTY_MISMATCH` | The event token belongs to a different website |
| `EVENT_ARCHIVED` | The event was archived and no longer accepts data |
| `PROPERTY_HOST_MISMATCH` | Advisory. The page is on a host this website is not registered for |
| `PROPERTY_PAUSED` | Advisory. The website is paused, so nothing is stored |
| `NETWORK_FAILURE` / `BAD_RESPONSE` | Could not reach blooms.ai, or it did not return JSON |

## Rolling back

Remove `target` and redeploy. Events written to blooms.ai in the meantime stay
there; the standalone server never lost anything.

## When the migration is finished

Once no project targets B1, `src/` can be collapsed down to `src/b2/` and this
file deleted. Note that this retires the *layer*, not the *server*: sites pin a
version tag on jsDelivr, so a bundle built against B1 keeps calling B1 forever.
The standalone server retires only when nothing deployed points at it.

## Tests

`test/b2/target-routing.spec.ts` exists to protect one guarantee: **with no
`target`, the library must behave exactly as B1 did.** It asserts both halves —
default traffic goes to the B1 host with B1's field names, and
`target: 'blooms-ai'` goes to the native blooms.ai endpoints with B2's — plus the
payload differences, the `apiBase` override, the page-view no-op, and that email
stays on B1 either way.

```
npx vitest run test/b2/target-routing.spec.ts
```
