# Mark Cook portfolio

Static WebGL2 portfolio and matching two-page CV. Source assets live in `public/`. The CV includes OPEN Health and Neptune Europe experience. No external fonts, analytics or application data collection.

## Deploy to Cloudflare Workers

- Install command: `npm ci --ignore-scripts`
- Build command: `npm test`
- Deploy command: `npm run deploy`
- Worker name: `mcportfolio`

Wrangler and its dependencies are pinned by package.json and package-lock.json. Cloudflare's normal automatic npm install uses the lockfile; `.npmrc` disables package lifecycle scripts. Runtime code has no npm dependencies. The existing `npx wrangler deploy` command resolves the pinned locally installed Wrangler, but `npm run deploy` adds checks.

Run `npm test` before every release. Run `node scripts/verify-live.mjs https://YOUR-HOSTNAME` to check deployed response headers. Cloudflare Access requires an authorized session for application-response validation; an authentication redirect does not count as a pass.

Read SECURITY.md for account controls and privacy-history limitations. The active history has been rebuilt to remove former phone-bearing commits; older clones must not be merged back.
