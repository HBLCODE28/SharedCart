# SharedCart

**Shared shopping lists for households, flatmates, and teams.**

SharedCart is a mobile-friendly PHP web application for keeping a group shopping list in sync. Create a group, invite people, add what is needed, and let everyone see when an item has been picked up.

## What it does

- Create shopping groups from an empty list or a quick-start template.
- Invite people with a link or QR code; group managers can approve join requests.
- Add items with quantities, optional images, suggestions, and staple-item support.
- Mark items as bought, track group activity, and keep members notified.
- Capture or choose a kitchen image to help build a list.
- Use the Progressive Web App shell with offline action syncing and retry controls.
- Manage accounts, groups, reports, moderation, audit data, and system health from an administrator dashboard.
- Offer a Hebrew-first, right-to-left interface with English administration labels where relevant.

## How a shared list flows

1. A member creates a group—optionally starting with a household, weekly-shopping, or Friday-meal template.
2. They share an invitation link or QR code with the people who should participate.
3. Members add items and quantities; the list keeps a record of activity and can notify affected members.
4. When someone buys an item, they mark it complete so the group has one current view of what remains.

## Technology

| Area | Used in this project |
| --- | --- |
| Application | PHP, browser JavaScript, HTML, CSS |
| Data | MySQL/MariaDB via PDO |
| Client experience | Progressive Web App manifest and service worker |
| Icons | Tabler Icons sprite |
| Quality checks | Playwright and axe-core |

## Project layout

```text
.
├── htdocs/              Web root: pages, styles, client code, and the API
│   ├── api/             Router, helpers, and feature-specific API routes
│   ├── index.html       Main shared-list experience
│   ├── admin.html       Administrator interface
│   └── sw.js            Service worker
├── docs/                Repository documentation assets
├── qa/                  Playwright test helpers and guidance
├── schema.sql           Initial database schema
└── migration-share.sql  Migration for the sharing-related schema
```

## Local setup

### Prerequisites

- PHP with PDO and a MySQL-compatible database driver
- MySQL or MariaDB
- Node.js and npm (for the quality checks)

### Configure the application

1. Create a database and import [`schema.sql`](schema.sql). Apply [`migration-share.sql`](migration-share.sql) when upgrading an existing installation.
2. Create the configuration file required by `htdocs/api/index.php` outside this repository. It must provide the database connection and any mail settings used by the application.
3. Configure a PHP-capable web server with `htdocs/` as its document root.
4. Open the site in a browser and create an account.

Configuration, credentials, uploads, and generated reports are intentionally excluded from Git. Do not commit them.

## Quality checks

Install dependencies, copy `qa/.env.example` to `qa/.env`, provide disposable non-administrator test-account values, then run:

```bash
npm ci
npm run qa:smoke
npm run qa:e2e
npm run qa:security
# or run every suite
npm run qa:full
```

See [`qa/README.md`](qa/README.md) for the test-data policy and the known invitation-method security test.

## Deployment notes

- Deploy the contents of `htdocs/` as the public web root.
- Keep PHP configuration, database credentials, mail credentials, user uploads, and runtime logs out of the repository.
- Serve the application over HTTPS in production, especially when using the service worker, camera access, and authentication flows.
- Restrict the administrator interface to authorized accounts and review its system-health findings routinely.

## Security

The application includes authentication, content moderation, audit records, request limiting, reports, and a system-health/security dashboard. These features complement—not replace—secure server configuration, secret management, TLS, database least privilege, and regular dependency updates.

## License

No license has been selected. All rights reserved; do not redistribute without the owner’s permission.
