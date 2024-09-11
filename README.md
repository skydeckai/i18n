# Translation Script

## Introduction
This project provides a language translation feature for a website using JavaScript. It dynamically translates text nodes and attributes based on the specified language.

## Features
- Fetches translations from a specified URL.
- Updates text nodes with translations.
- Changes language dynamically via a dropdown.
- Updates URL and links to reflect the selected language.

## Usage
1. Add the `translate.js` script to your webpage.
2. Specify the `translationUrl` in the script tag's URL parameters.
3. Add a language dropdown with the id `languageDropdown`.

Example:
```html
<script src="https://skydeckai.github.io/translate.js?translationUrl=path/to/translations.json"></script>
<select id="languageDropdown">
  <option value="en">English</option>
  <option value="fr">French</option>
  <option value="ja">Japanese</option>
  <option value="ko">Korean</option>
  <option value="es">Spanish</option>
  <option value="it">Italian</option>
</select>
```
