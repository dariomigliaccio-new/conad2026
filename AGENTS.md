# Repository Guidelines

## Project Structure & Module Organization
This repository is primarily a PHP web app with static frontend assets.

- Root: public pages and API-like endpoints (`index.html`, `inscricao.php`, `public-*.php`, `checkout*.php`).
- `admin/`: admin panel pages and handlers; shared bootstrap/config lives in `admin/includes/`.
- `includes/`: cross-cutting helpers used outside admin (for example `includes/i18n.php`).
- `js/`, `css/`, `images/`, `content/`: frontend scripts, styles, media, and CMS/i18n JSON data.
- `database/schema.sql`: database schema source.
- `app/`: separate Vite + React workspace (tooling/frontend experiments).
- `vendor/`: Composer dependencies; do not edit manually.

## Build, Test, and Development Commands
- `composer install`: install PHP dependencies at repository root.
- `php -S localhost:8000`: run local PHP server from repo root.
- `php -l inscricao.php`: quick syntax check for edited PHP files.
- `php test-bootstrap.php` / `php test-full-flow.php`: run available smoke test scripts.
- `cd app && npm install`: install JS dependencies for the Vite workspace.
- `cd app && npm run dev`: start Vite dev server.
- `cd app && npm run build`: create production bundle.
- `cd app && npm run lint`: run ESLint.

## Coding Style & Naming Conventions
- PHP: follow existing functional style, prefer `declare(strict_types=1);` in new backend files.
- Use clear snake_case for PHP helper functions (`conad_load_public_cms_content` pattern).
- JavaScript: keep modules small; use camelCase for variables/functions.
- Match existing indentation per file; do not reformat unrelated blocks.
- Keep configuration examples in `*.example` files; never commit secrets in `config.local.php`.

## Testing Guidelines
No PHPUnit suite is configured. Use targeted smoke tests plus manual verification.

- Name ad-hoc tests as `test-<feature>.php` at repository root.
- Validate changed flows through corresponding public/admin pages.
- For DB-related changes, verify against `database/schema.sql` and admin health pages (`admin/health.php`).

## Commit & Pull Request Guidelines
Git history is not available in this workspace snapshot, so no local convention can be inferred. Use:

- Commit format: `type(scope): imperative summary` (for example, `fix(inscricao): validate intl phone`).
- Keep commits focused on one concern.
- PRs should include: purpose, impacted files/routes, manual test steps, and screenshots for UI/admin changes.
- Reference related issue/task IDs when available.
