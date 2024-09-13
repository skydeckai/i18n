# Webflow Page Translator

This script enables translation of Webflow pages using translation files hosted in a specified URL. It updates the page content dynamically based on the selected language.

## Features

- Fetches translations from a specified URL.
- Supports multiple languages.
- Updates text nodes and element attributes with translations.
- Provides a language selector dropdown.

## Setup

1. **Include the Script**: Ensure the script is included in your HTML with `id="i18nWebflowScript"`.

2. **Translation Files**: Host your translation files and add its url to the `translationUrl` parameter.

Example:
   ```html
   <script id="i18nWebflowScript" src="https://skydeckai.github.io/i18n/translate.js?translationUrl=https://skydeckai.github.io/i18n/translations/skydeck.json"></script>
   ```

## Usage
1. **Language Selection**: A language dropdown is automatically added, locating at the bottom left of the page. Use it to switch between supported languages.
2. **URL Parameter**: The script uses the `lang` URL parameter to determine the current language. It updates the URL and page content accordingly.

## Adding Translations
- Use the [i18n Webflow](https://github.com/skydeckai/i18n-webflow) script to create translation files before deploying them with this script.