# Security and deployment

This is a static portfolio. It has no application API, database, login implementation, upload endpoint, analytics, tracking SDK or browser persistence. Access authentication is provided separately by Cloudflare Access. All fonts, images, scripts and styles are hosted on the same origin.

## Deployment

Use Node 22 or newer. Install with `npm ci --ignore-scripts`, run `npm test`, then `npm run deploy`. Wrangler is pinned in package.json and the complete dependency graph and integrity hashes are in package-lock.json. The existing Cloudflare command `npx wrangler deploy` also resolves the installed pinned version, but `npm run deploy` additionally gates deployment on the security checks.

Security headers apply to static responses. Cloudflare Access redirects and provider-generated error pages are outside the static assets configuration. HSTS uses one year on this hostname; subdomains and preload are deliberately excluded to avoid changing unrelated hosts.

## Account and edge controls to verify in the owner's account

- Cloudflare Access must cover the portfolio and preview/version aliases, including documents and images. Preserve its existing intended audience.
- Verify the Access policy actually restricts the intended identities; a sign-in redirect alone does not establish the policy scope.
- Enable phishing-resistant MFA/passkeys for GitHub and Cloudflare and remove unused sessions and tokens.
- Protect main with a ruleset, prevent force pushes after the privacy cleanup, and require the security checks and appropriate reviews. Repository administration is not available through this connection.
- Review Cloudflare edge security, abuse controls and provider logging/retention settings; do not claim WAF or rate-limit settings are enabled without checking the account.
- Run `node scripts/verify-live.mjs https://YOUR-HOSTNAME` after deployment from an authorized environment. It treats Cloudflare Access/sign-in as BLOCKED, not a passing application header check.
- Run `npm audit` regularly and review patched versions before updating the lockfile. Pinned versions do not guarantee future absence of vulnerabilities.

## Privacy cleanup limits

The public source contains only the intended professional profile and contact email. Legacy Word files and obsolete CV assets are excluded from the current tree. The branch is rebuilt on its clean initial README commit to remove former phone-bearing commits from main's ancestry. This is not a guarantee that GitHub deleted unreachable objects, cached commit views, forks, clones or earlier Cloudflare deployments. GitHub Support may be needed for retained objects; previous Cloudflare versions and caches need review in the owner's account. Do not re-merge old clones or branches.

## Reporting

Report a suspected vulnerability privately to mark@allovaitsolutions.co.uk. Do not include credentials or personal data in public issues. No penetration-test or compliance certification is claimed.
