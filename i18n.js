let translations = {};

async function fetchTranslations() {
  try {
    const hostname = window.location.hostname;
    let translationUrl;

    if (hostname.includes("skydeck.ai")) {
      translationUrl =
        "https://skydeckai.github.io/i18n/translations_skydeck.json";
    } else if (hostname.includes("rememberizer.ai")) {
      translationUrl =
        "https://skydeckai.github.io/i18n/translations_rememberizer.json";
    } else {
      throw new Error("Unsupported domain");
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
  console.log(language);
  const url = new URL(window.location);
  const currentPath = url.pathname.replace(/^\/(en|fr|ja|ko|es|it)/, "");
  url.pathname = currentPath;
  url.searchParams.set("lang", language);
  window.history.pushState({}, "", url.href);
  window.location.reload();
}

function updateURL(language) {
  const url = new URL(window.location);
  const currentPath = url.pathname.replace(/^\/(en|fr|ja|ko|es|it)/, "");
  let newPath = language === "en" ? currentPath : `/${language}${currentPath}`;
  url.pathname = newPath;
  url.searchParams.delete("lang");
  window.history.replaceState({}, "", url.pathname + url.search);
}

function updateDropdown(language) {
  const dropdown = document.getElementById("languageDropdown");
  dropdown.value = language;
}

function updateLinks(language) {
  const links = document.querySelectorAll('a[href^="/"]');
  links.forEach((link) => {
    let href = link.getAttribute("href");
    const url = new URL(href, window.location.origin);
    const currentPath = url.pathname.replace(/^\/(en|fr|ja|ko|es|it)/, "");
    url.pathname =
      language === "en" ? currentPath : `/${language}${currentPath}`;
    link.setAttribute("href", url.pathname + url.search);
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
});

const supportedLanguages = ["en", "fr", "ja", "ko", "es", "it"];
