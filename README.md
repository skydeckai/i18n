# Translation Script

## Introduction
This project provides a language translation feature for a website using JavaScript. It dynamically translates text nodes and attributes based on the specified language.

## Features
- Fetches translations from a specified URL.
- Updates text nodes with translations.
- Changes language dynamically via a dropdown.
- Updates URL and links to reflect the selected language.

## Usage
1. Add the following script to your webpage, make sure the script tag includes the id `translationScript`.
```html
<script id="translationScript" src="https://skydeckai.github.io/i18n/translate.js?translationUrl=<your_translation_file_url>"></script>
```

2. Specify the `translationUrl` in the script tag's URL parameters. For example:
```html
<script id="translationScript" src="https://skydeckai.github.io/i18n/translate.js?translationUrl=https://skydeckai.github.io/i18n/translations/skydeck.json"></script>
```



