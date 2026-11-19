# SharedCart QA

Install the test dependency with `npm install`, copy `qa/.env.example` to `qa/.env`, and export its values before running a command. The credentials are only for disposable, non-admin QA accounts.

`npm run qa:smoke` checks the public page. `npm run qa:e2e` creates and removes an isolated group, while `npm run qa:security` checks security regressions. `npm run qa:full` runs all suites and writes `playwright-report/` plus failure artifacts under `test-results/`.

Every created record begins with `QA-`. Cleanup runs in `finally`; investigate and remove any surviving prefixed records if a remote outage interrupts a test run.

The invitation-method security test intentionally fails until redemption is changed from `GET /api/invite/join` to an authenticated `POST` endpoint.
