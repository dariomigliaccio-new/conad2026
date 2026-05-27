# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CONAD is an event registration and management web app (conference). The stack is PHP 7.4+ + MySQL 8 on the backend, vanilla JS + HTML on the frontend, with Stripe for payments. A separate Vite + React workspace lives in `app/` (frontend experiments/tools, not the main app).

## Commands

**PHP (main app):**
```sh
composer install                    # install PHP deps (phpspreadsheet)
php -S localhost:8000               # local dev server from repo root
php -l <file.php>                   # syntax-check a PHP file
php test-bootstrap.php              # smoke test DB connection
php test-full-flow.php              # end-to-end smoke test
```

**Vite/React workspace (`app/`):**
```sh
cd app && npm install
cd app && npm run dev               # dev server
cd app && npm run build             # production bundle
cd app && npm run lint              # ESLint
```

## Configuration

Copy `admin/includes/config.local.php.example` → `admin/includes/config.local.php` and fill in DB credentials. Never commit `config.local.php`.

Config can also be provided via environment variables prefixed `CONAD_*` (e.g. `CONAD_DB_HOST`, `CONAD_DB_NAME`, `CONAD_DB_USER`, `CONAD_DB_PASS`, `CONAD_DEBUG`).

## Architecture

### PHP entry points
| File | Purpose |
|------|---------|
| `index.html` | Holding page ("em breve") |
| `inscricao.php` | Multi-step registration form (Steps 1–4) |
| `termos.php` | Terms acceptance (Step 4) |
| `plano.php` | Plan selection (Step 4b) |
| `checkout.php` | Stripe checkout (Step 5) |
| `checkout_success.php` / `checkout_cancel.php` | Post-payment redirect pages |
| `public-*.php` | JSON API endpoints consumed by the frontend JS |
| `admin/` | Admin panel (dashboard, registrations, plans, settings, media, etc.) |

### Registration flow
`inscricao.php` → `termos.php` → `plano.php` → `checkout.php`

The `registrations` table tracks `current_step` (1–5) and `status` (`pending` / `paid` / `canceled`). A plan can be pre-selected via `?plan=<slug>` query param.

### Shared PHP bootstrap
All pages start with `require_once __DIR__ . '/admin/includes/bootstrap.php'` (or a relative path). That file loads:
- `config-loader.php` → `config.php` → optionally `config.local.php`
- `includes/i18n.php` (i18n helpers)
- Sets up session, error reporting, and global helpers (`db()`, `h()`, `conad_error_id()`)

The `db()` function returns a PDO singleton.

### CMS / content
Site copy is stored in two layers merged at runtime:
1. `content/cms-default.json` — shipped defaults
2. `settings` table, key `public_cms_override_json` — admin overrides (deep-merged on top)

Access via `conad_load_public_cms_content(PDO)` in PHP, or `GET /public-content.php` from JS.

### i18n (multilingual: pt-BR, en-US, es-ES)
- Translations live in `content/languages.json`.
- **Frontend**: `js/i18n.js` — call `await i18n.init('pt-BR')`, then `i18n.t('key')`. HTML elements use `data-i18n="key"` attributes.
- **Backend PHP**: `includes/i18n.php` — `t('key')`, `i18n_get_lang()`, `i18n_set_lang('en-US')`.
- **API**: `GET /public-languages.php?lang=pt-BR`

### Database schema
`database/schema.sql` is the canonical schema. Key tables: `admins`, `payment_plans`, `registrations`, `registration_children`, `registration_occupants`, `form_fields`, `congregations`, `settings`.

### Coding conventions
- PHP: `declare(strict_types=1)` in new backend files; functional style; snake_case helpers with `conad_` prefix for public-facing helpers.
- JS: small modules, camelCase. No bundler — files loaded directly via `<script>` tags.
- DB prices stored in **cents** (integer). Use `money_br(int $cents)` for BRL display.
- Admin pages use `admin/includes/layout.php` (header/nav) and `admin/includes/layout-footer.php`.
