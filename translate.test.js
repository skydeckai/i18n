const { JSDOM } = require("jsdom");

function setupDOM(html) {
  const dom = new JSDOM(html, { url: "http://localhost" });
  global.document = dom.window.document;
  global.window = dom.window;
  global.navigator = dom.window.navigator;
  global.Node = dom.window.Node;
  return dom;
}

describe("Testing i18n Webflow script", () => {
  let script;
  beforeEach(() => {
    setupDOM(`
      <html>
        <body>
          <script id="i18nWebflowScript" src="http://localhost?translationUrl=/translations.json"></script>
          <select id="languageDropdown"></select>
        </body>
      </html>
    `);
    script = require("./translate.js");
  });

  afterEach(() => {
    jest.resetModules();
  });

  test("getScriptURLParameters returns correct URL parameters", () => {
    const params = script.getScriptURLParameters();
    expect(params.get("translationUrl")).toBe("/translations.json");
  });

  test("fetchTranslations throws error on missing translationUrl", async () => {
    document.getElementById("i18nWebflowScript").src = "http://localhost";
    console.error = jest.fn(); // Mock console.error

    await script.fetchTranslations();

    expect(console.error).toHaveBeenCalledWith(
      "Error fetching translations:",
      expect.any(Error)
    );
  });

  test("hashText generates consistent hash", async () => {
    const text = "Hello, World!";
    const hash = await script.hashText(text);
    expect(hash).toBe(
      "dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986f"
    );
  });

  test("removeAriaHiddenAttributes removes aria-hidden attribute", () => {
    document.body.innerHTML = `<div aria-hidden="true">Test</div>`;
    const div = document.querySelector("div");

    script.removeAriaHiddenAttributes(div);

    expect(div.hasAttribute("aria-hidden")).toBe(false);
  });

  test("translateTextNodes updates text nodes for a given language", async () => {
    script.translations.fr = {
      dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986f:
        "Bonjour le monde!",
    };

    const div = document.createElement("div");
    div.textContent = "Hello, World!";
    document.body.appendChild(div);

    await script.translateTextNodes(div, "fr");

    expect(div.textContent).toBe("Bonjour le monde!");
  });

  test("translatePage does not translate when language is 'en'", async () => {
    const translateTextNodes = jest.spyOn(script, "translateTextNodes");
    await script.translatePage("en");
    expect(translateTextNodes).not.toHaveBeenCalled();
  });

  test("isLanguageSupported returns true for supported language", () => {
    expect(script.isLanguageSupported("fr")).toBe(true);
  });

  test("isLanguageSupported returns false for unsupported language", () => {
    expect(script.isLanguageSupported("de")).toBe(false);
  });
});
