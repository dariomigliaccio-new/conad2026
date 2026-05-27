# Sistema Multilíngue (i18n)

Este projeto suporta 3 idiomas: **Português (pt-BR)**, **Inglês (en-US)** e **Espanhol (es-ES)**.

## Arquivos Principais

### 1. **content/languages.json**
Arquivo central com todas as traduções:
```json
{
  "pt-BR": { "nav.home": "Início", ... },
  "en-US": { "nav.home": "Home", ... },
  "es-ES": { "nav.home": "Inicio", ... }
}
```

### 2. **js/i18n.js** (Frontend)
Helper JavaScript para traduzir na página pública:
```javascript
// Carregar traduções
await i18n.init('pt-BR');

// Traduzir uma chave
const text = i18n.t('nav.home'); // "Início"

// Com variáveis
const msg = i18n.t('greeting', { name: 'João' });
```

Uso com HTML:
```html
<!-- Traduzir automaticamente -->
<p data-i18n="nav.home"></p>

<!-- Traduzir atributo -->
<input data-i18n-attr="placeholder" data-i18n-key="common.email">
```

### 3. **includes/i18n.php** (Backend)
Helper PHP para usar em páginas do admin:
```php
// Carregar uma tradução
echo t('admin.dashboard'); // "Dashboard"

// Com variáveis
echo t('greeting', ['name' => 'João']);

// Obter idioma atual
$lang = i18n_get_lang(); // "pt-BR"

// Mudar idioma
i18n_set_lang('en-US');
```

### 4. **public-languages.php**
API endpoint que serve traduções como JSON:
```
GET /public-languages.php?lang=pt-BR
```
Retorna:
```json
{ "nav.home": "Início", "nav.about": "Sobre", ... }
```

### 5. **Language Selector UI**
Componente visual nos headers:
- **Público**: Menu suspenso com bandeiras e idiomas no header de cada página HTML
- **Admin**: Seletor compacto no header do admin
- Salva a escolha em `localStorage` automaticamente

## Como Usar

### Frontend (HTML)
1. Incluir `js/i18n.js` no `<head>`:
```html
<script src="js/i18n.js" defer></script>
```

2. Adicionar language selector no header (já incluído em todos os HTMLs)

3. Usar `data-i18n` para traduzir elementos:
```html
<h1 data-i18n="hero.title"></h1>
```

4. Chamar `i18n.translatePage()` para traduzir:
```javascript
await i18n.init('en-US');
i18n.translatePage();
```

### Backend (PHP)
1. Incluir helper no arquivo:
```php
require_once __DIR__ . '/includes/i18n.php';
```

2. Usar a função `t()`:
```php
<?php echo t('admin.dashboard'); ?>
```

3. Obter idioma:
```php
$current = i18n_get_lang(); // "pt-BR"
```

## Adicionando Novas Traduções

1. Editar `content/languages.json`
2. Adicionar a chave em **TODOS** os 3 idiomas:
```json
{
  "pt-BR": {
    ...
    "new.key": "Novo texto",
    ...
  },
  "en-US": {
    ...
    "new.key": "New text",
    ...
  },
  "es-ES": {
    ...
    "new.key": "Nuevo texto",
    ...
  }
}
```

3. No HTML, usar:
```html
<p data-i18n="new.key"></p>
```

Ou no PHP:
```php
<?php echo t('new.key'); ?>
```

## Estrutura de Chaves

Chaves seguem padrão `namespace.subkey`:
- `nav.*` - Navegação
- `hero.*` - Seção hero
- `plans.*` - Planos
- `contact.*` - Contato
- `registration.*` - Inscrição
- `common.*` - Elementos comuns (buttons, labels)
- `admin.*` - Admin interface

## Cache e Performance

- Arquivo `languages.json` é cacheado por 24 horas no servidor
- `localStorage` guarda a preferência de idioma no navegador
- Tradu ções são carregadas uma única vez por sessão no JavaScript

## Integração com CMS

O CMS (`public-content.php`) usa chaves JSON que podem ser traduzidas via `languages.json`. Se uma chave existir em ambos, o i18n tem precedência.

## Troubleshooting

**"Language not found"**: Verificar se `content/languages.json` existe e contém a chave `pt-BR`, `en-US` ou `es-ES`.

**Traduções não aparecem**: Confirmar que `data-i18n` está no HTML e `i18n.translatePage()` foi chamado após `i18n.init()`.

**Admin mostra erro no selector**: Verificar se `layout.php` está incluindo `layout-footer.php` que tem o script.
