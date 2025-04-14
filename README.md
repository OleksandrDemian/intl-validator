# intl-validator

A tool for validating internationalization (i18n) translation keys in Next.js projects using next-intl.

## Purpose

This script analyzes your React/Next.js codebase to ensure all translation keys used with `next-intl` are properly defined in your translation files. It helps prevent missing translations in your application by:

1. Scanning all .tsx files in your project
2. Identifying files that use `next-intl` 
3. Extracting all translation namespaces and keys
4. Validating if those keys exist in your translation file

## Installation

```bash
# Install locally in your project
npm install --save-dev /path/to/intl-validator

# Or install globally
npm install -g /path/to/intl-validator
```

## Configuration

Create a `.intl-validator.json` file in the root of your project with the following properties:

```json
{
  "projectRoot": "/absolute/path/to/your/project",
  "exampleTranslationFile": "/absolute/path/to/your/translation.json"
}
```

- `projectRoot`: The absolute path to the root directory of your project containing .tsx files
- `exampleTranslationFile`: The absolute path to a translation file (JSON) that has all the required translations

## Usage

```bash
# If installed locally
npx intl-validator

# If installed globally
intl-validator
```

## How it works

The validator looks for:

1. Imports of `useTranslations` from `next-intl`
2. Namespace declarations (e.g., `const t = useTranslations('namespace')`)
3. Usage of translation keys (e.g., `t('key')`)

It then combines these to form full translation paths (e.g., `namespace.key`) and checks if they exist in your translation file.

## Example

Given a component like:

```tsx
import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('components.fileUploadZone');
  const tButtons = useTranslations('buttons');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
      <button>{tButtons('submit')}</button>
    </div>
  );
}
```

The validator will check for the existence of:
- `components.fileUploadZone.title`
- `components.fileUploadZone.description`
- `buttons.submit`

## Exit Codes

- `0`: All translations are valid
- `1`: Missing translations were found or an error occurred

## Development

```bash
# Build from source
npm run build

# Run the validator
npm run dev
```