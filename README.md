# Translation files for SkyDeck and Rememberizer

This directory is used to store translation files for the SkyDeck and Rememberizer websites. These files help in managing and reusing translations, reducing the need for repeated API calls and improving the efficiency of the translation process.

## Purpose

- **Translation Caching**: Store translations of the text extracted from the SkyDeck and Rememberizer websites to avoid redundant API requests and reduce translation costs.
- **Performance Enhancement**: Speed up the translation process by utilizing pre-translated content.

## File Structure

- `translations_<project>.json`: Each project has its own cache file to store translations for different languages.

### Managing Cache Files

- Cache files are named as `translations_<project>.json`, where `<project>` is the name of the project (e.g., `skydeck`, `rememberizer`).
- You can inspect these JSON files to view or edit translations manually if needed.
