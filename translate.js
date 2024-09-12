let translations = {};

function getScriptURLParameters() {
  const scriptElement = document.getElementById("translationScript");

  if (!scriptElement) {
    console.error("Script element not found");
    return new URLSearchParams();
  }

  const scriptSrc = scriptElement.src;
  const url = new URL(scriptSrc);

  return new URLSearchParams(url.search);
}

async function fetchTranslations() {
  try {
    const scriptParams = getScriptURLParameters();
    const translationUrl = scriptParams.get("translationUrl");

    if (!translationUrl) {
      throw new Error("Translation URL not specified in script URL");
    }

    const response = await fetch(translationUrl);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    translations = await response.json();
  } catch (error) {
    console.error("Error fetching translations:", error);
  }
}

async function hashText(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function translateTextNodes(node, language) {
  if (node.nodeType === Node.TEXT_NODE) {
    const textContent = node.textContent;
    if (textContent) {
      const hash = await hashText(textContent);
      if (translations[language] && translations[language][hash]) {
        node.textContent = translations[language][hash];
        return;
      }
    }
  }

  if (node.nodeType === Node.ELEMENT_NODE && node.hasAttribute("value")) {
    const valueContent = node.getAttribute("value");
    if (valueContent) {
      const hash = await hashText(valueContent);
      if (translations[language] && translations[language][hash]) {
        node.setAttribute("value", translations[language][hash]);
        return;
      }
    }
  }

  node.childNodes.forEach((child) => translateTextNodes(child, language));
}

async function translatePage(language) {
  if (language === "en") return;
  const elements = document.querySelectorAll("body *");
  for (const element of elements) {
    if (element.nodeName !== "SCRIPT" && element.nodeName !== "STYLE") {
      await translateTextNodes(element, language);
    }
  }
}

function isLanguageSupported(language) {
  return supportedLanguages.includes(language);
}

async function changeLanguage() {
  const dropdown = document.getElementById("languageDropdown");
  const selectedLanguage = dropdown.value;
  await setLanguage(selectedLanguage);
}

async function setLanguage(language) {
  const url = new URL(window.location);
  url.searchParams.set("lang", language);
  window.history.pushState({}, "", url.href);
  window.location.reload();
}

function updateURL(language) {
  const url = new URL(window.location);
  url.searchParams.set("lang", language);
  window.history.replaceState({}, "", url.href);
}

function updateDropdown(language) {
  const dropdown = document.getElementById("languageDropdown");
  dropdown.value = language;
}

function updateLinks(language) {
  const links = document.querySelectorAll('a[href^="/"], a[href^="?"]');
  links.forEach((link) => {
    let href = link.getAttribute("href");
    const isQueryOnly = href.startsWith("?");

    const baseUrl = isQueryOnly ? window.location.pathname : "";
    const url = new URL(href, window.location.origin + baseUrl);

    url.searchParams.set("lang", language);

    const newHref = isQueryOnly ? url.search : url.pathname + url.search;

    link.setAttribute("href", newHref);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  await fetchTranslations();
  const urlParams = new URLSearchParams(window.location.search);
  const language = isLanguageSupported(urlParams.get("lang"))
    ? urlParams.get("lang")
    : "en";
  updateDropdown(language);
  if (language !== "en") {
    await translatePage(language);
  }
  updateLinks(language);
  updateURL(language);
});

window.addEventListener("popstate", async (event) => {
  await fetchTranslations();
  const urlParams = new URLSearchParams(window.location.search);
  const language = isLanguageSupported(urlParams.get("lang"))
    ? urlParams.get("lang")
    : "en";
  updateDropdown(language);
  if (language !== "en") {
    await translatePage(language);
  }
  updateLinks(language);
  updateURL(language);
  window.location.reload();
});

const supportedLanguages = ["en", "fr", "ja", "ko", "es", "it"];
