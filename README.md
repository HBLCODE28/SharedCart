# SharedCart

A PHP and browser-based shared shopping-cart application with authentication, profiles, administration, and a Progressive Web App shell.

## Structure

- `htdocs/` — application files deployed to the web server.
- `htdocs/api/` — PHP API endpoints and helpers.
- `schema.sql` and `migration-share.sql` — database setup and migration scripts.
- `qa/` — Playwright end-to-end, security, and accessibility checks.

## Local quality checks

```bash
npm ci
npm run qa:smoke
npm run qa:full
```

Use a local PHP-capable web server configured with `htdocs/` as its document root. Configure any environment-specific database and mail settings outside Git.

## Security

Do not commit credentials, production configuration, user uploads, or generated test reports.

## License

No license has been selected yet. Do not redistribute this project without the owner’s permission.
