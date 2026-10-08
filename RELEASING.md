# Releasing `@bloomscorp/bloomsight.js`

## How it reaches users

Two channels, both fed by **one `npm publish`**:

| Channel | What it serves | Who uses it |
|---|---|---|
| **npm** — `@bloomscorp/bloomsight.js` | `dist/` (CJS, ESM, `.d.ts`) **and** `umd/` | bundled apps, Angular via `ngx-bloomsight` |
| **jsDelivr** — `cdn.jsdelivr.net/npm/@bloomscorp/bloomsight.js@<version>/umd/production.js` | the published tarball's `umd/` | the plain-HTML customer sites |

Up to and including 0.7.0, jsDelivr served from the **git tag**
(`/gh/bloomscorp/bloomsight.js@v0.7.0/...`), which is why `umd/` was committed.
From 0.8.0 it is served from **npm**, `umd/` is gitignored, and the two channels
can no longer drift. Old `/gh/` URLs still resolve for the versions that have
them, so nothing already deployed breaks.

## Releasing

```bash
npm run release
```

That is the whole local procedure. `release-it` will:

1. run the gates — `git pull`, `npm run lint`, `npm run test`, `npm run build`, `npm run bundle`
2. work out the next version from the conventional commits since the last tag
   (`feat:` → minor, `fix:` → patch, `BREAKING CHANGE:` → major)
3. update `CHANGELOG.md`
4. commit `chore: release vX.Y.Z`, tag `vX.Y.Z`, and push both

Pushing the tag triggers **`.github/workflows/release.yml`**, which does the
rest: typecheck, test, build, bundle, check the tag matches `package.json`,
verify the tarball really contains `dist/` and `umd/`, `npm publish --provenance`,
and create the GitHub release.

It needs a clean working tree — commit or stash anything in progress first.

### Requirements

- You are on `main` and up to date.
- The repository secret **`NPM_TOKEN`** exists: an npm granular token with read
  and write on `@bloomscorp/bloomsight.js`. Automation tokens bypass npm 2FA,
  which is what lets CI publish at all.
- Nothing else. `GITHUB_TOKEN` is provided to Actions automatically — which is
  why the GitHub release lives in CI rather than locally, where it always failed
  for want of a token.

### Afterwards

```bash
npm view @bloomscorp/bloomsight.js version
curl -sI https://cdn.jsdelivr.net/npm/@bloomscorp/bloomsight.js@X.Y.Z/umd/production.js | head -1
```

jsDelivr caches on first request, so give the CDN URL a moment.

## Why it is split this way

`npm publish` and the GitHub release are the two things that used to go wrong:

- `.release-it.json` has always had `npm.publish: false`, so **every** release
  needed a manual `npm publish` that nothing checked. Forget it and npm serves
  an older version than the git tag claims.
- `github.release: true` needed a token that was never configured, so
  `release-it` committed and tagged and *then* failed, leaving a half-finished
  release to reason about. v0.7.0 was cut by hand for this reason.

Both now happen in CI, triggered by the tag, with the one credential that has to
be managed stored as a repository secret.

## Versioning

Conventional commits drive it, so the commit message matters:

| Prefix | Effect |
|---|---|
| `feat:` | minor — 0.7.0 → 0.8.0 |
| `fix:` | patch — 0.8.0 → 0.8.1 |
| `docs:` `perf:` `build:` | appear in the changelog |
| `chore:` `test:` `refactor:` | no release |
| `BREAKING CHANGE:` in the body | major |

`commitlint` enforces the format on commit via husky.

## If something goes wrong

**The release workflow failed after tagging.** The tag is pushed but nothing is
published. Fix the problem, then either re-run the workflow from the Actions tab,
or delete and re-push the tag:

```bash
git tag -d vX.Y.Z && git push origin :refs/tags/vX.Y.Z
# fix, commit, then:
git tag vX.Y.Z && git push origin vX.Y.Z
```

**It published but the version is wrong.** npm versions are immutable and
`unpublish` is heavily restricted — release the next patch instead. Never try to
replace a published version.

**jsDelivr serves a stale file.** It caches aggressively but keys on the exact
version in the URL, so a new version is never stale. Only an unversioned or
range URL (`@0.8` or `@latest`) can be, and customer sites should always pin an
exact version.

## Publishing the Angular wrapper

Usually you do not have to. `@bloomscorp/ngx-bloomsight` declares the SDK as a
**peer** dependency at `>=0.7.0 <1.0.0`, so any 0.x release is picked up by the
consuming app bumping the SDK itself. The wrapper only needs its own release
when its own code changes, or when the SDK goes to 1.0.0 and the range has to
widen.
