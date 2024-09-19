let translations = {};

function getScriptURLParameters() {
  const scriptElement = document.getElementById("i18nWebflowScript");

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
  const data = encoder.encode(text.trim());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function removeAriaHiddenAttributes(node) {
  if (node.hasAttribute && node.hasAttribute("aria-hidden")) {
    node.removeAttribute("aria-hidden");
  }
  node.childNodes.forEach((child) => removeAriaHiddenAttributes(child));
}

async function translateTextNodes(node, language) {
  if (node.nodeType === Node.ELEMENT_NODE) {
    removeAriaHiddenAttributes(node);

    const hasTextNodeChild = Array.from(node.childNodes).some(
      (child) => child.nodeType === Node.TEXT_NODE && child.textContent.trim()
    );

    if (hasTextNodeChild) {
      const innerHTML = Array.from(node.childNodes)
        .map((child) => child.outerHTML || child.textContent)
        .join("")
        .trim();
        
      const hash = await hashText(innerHTML);
      if (translations[language] && translations[language][hash]) {
        node.innerHTML = translations[language][hash];
        return;
      }
    }
  }

  if (node.nodeType === Node.ELEMENT_NODE && node.hasAttribute("value")) {
    const valueContent = node.getAttribute("value");
    if (valueContent) {
      const hash = await hashText(valueContent.trim());
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

async function translateMetaTags(language) {
  if (!translations[language]) return;

  const titleElement = document.querySelector("title");
  if (titleElement) {
    const titleHash = await hashText(titleElement.textContent.trim());
    if (translations[language][titleHash]) {
      titleElement.textContent = translations[language][titleHash];
    }
  }

  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    const descriptionHash = await hashText(
      metaDescription.getAttribute("content").trim()
    );
    if (translations[language][descriptionHash]) {
      metaDescription.setAttribute(
        "content",
        translations[language][descriptionHash]
      );
    }
  }

  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) {
    const ogTitleHash = await hashText(ogTitle.getAttribute("content").trim());
    if (translations[language][ogTitleHash]) {
      ogTitle.setAttribute("content", translations[language][ogTitleHash]);
    }
  }

  const ogDescription = document.querySelector(
    'meta[property="og:description"]'
  );
  if (ogDescription) {
    const ogDescriptionHash = await hashText(
      ogDescription.getAttribute("content").trim()
    );
    if (translations[language][ogDescriptionHash]) {
      ogDescription.setAttribute(
        "content",
        translations[language][ogDescriptionHash]
      );
    }
  }
}

function isLanguageSupported(language) {
  return supportedLanguages.some((supportedLanguage) => {
    return supportedLanguage.value === language;
  });
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

function updateTextDirection(language) {
  const body = document.body;
  if (language === "ar") {
    body.style.direction = "rtl";
    body.style.textAlign = "right";
  } else {
    body.style.direction = "ltr";
    body.style.textAlign = "left";
  }
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

function addHreflangAndCanonicalTags(currentLanguage) {
  const head = document.head;

  document
    .querySelectorAll('link[rel="alternate"], link[rel="canonical"]')
    .forEach((el) => el.remove());

  const baseUrl = window.location.origin;

  supportedLanguages.forEach((language) => {
    const hreflangLink = document.createElement("link");
    hreflangLink.rel = "alternate";
    hreflangLink.hreflang = language.value;
    hreflangLink.href = `${baseUrl}${window.location.pathname}?lang=${language.value}`;
    head.appendChild(hreflangLink);
  });

  const canonicalLink = document.createElement("link");
  canonicalLink.rel = "canonical";
  canonicalLink.href = `${baseUrl}${window.location.pathname}?lang=${currentLanguage}`;
  head.appendChild(canonicalLink);
}


document.addEventListener("DOMContentLoaded", async () => {
  const languageSelector = document.createElement("div");
  languageSelector.className = "language-selector";

  const dropdown = document.createElement("select");
  dropdown.id = "languageDropdown";
  dropdown.onchange = changeLanguage;

  supportedLanguages.forEach((language) => {
    const option = document.createElement("option");
    option.value = language.value;
    option.textContent = language.text;
    dropdown.appendChild(option);
  });

  languageSelector.appendChild(dropdown);
  document.body.appendChild(languageSelector);

  const style = document.createElement("style");
  style.textContent = `
    .language-selector {
      position: fixed;
      bottom: 0;
      left: 0;
      width: 10%;
      padding: 10px;
      text-align: center;
      z-index: 1000;
    }
    .language-selector select {
      padding: 8px;
      font-size: 16px;
      border: 1px solid #aaa;
      border-radius: 4px;
      -webkit-appearance: none;
      background-image: url(data:image/svg+xml,%3Csvg%20width%3D%2264px%22%20height%3D%2264px%22%20viewBox%3D%22-102.4%20-102.4%201228.80%201228.80%22%20class%3D%22icon%22%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22%23aaaaaa%22%20stroke%3D%22%23aaaaaa%22%20stroke-width%3D%2222.528%22%3E%3Cg%20id%3D%22SVGRepo_bgCarrier%22%20stroke-width%3D%220%22%3E%3C%2Fg%3E%3Cg%20id%3D%22SVGRepo_tracerCarrier%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3C%2Fg%3E%3Cg%20id%3D%22SVGRepo_iconCarrier%22%3E%3Cpath%20d%3D%22M903.232%20256l56.768%2050.432L512%20768%2064%20306.432%20120.768%20256%20512%20659.072z%22%20fill%3D%22%23aaaaaa%22%3E%3C%2Fpath%3E%3C%2Fg%3E%3C%2Fsvg%3E);
      background-repeat: no-repeat;
      background-position: right 7px center;
      background-size: 12px;
      width: 100px;
    }
  `;

  document.head.appendChild(style);

  await fetchTranslations();

  const urlParams = new URLSearchParams(window.location.search);
  const language = isLanguageSupported(urlParams.get("lang"))
    ? urlParams.get("lang")
    : "en";

  updateDropdown(language);

  updateTextDirection(language);

  const slider = document.querySelector(".w-slider");

  if (slider) {
    slider.style.direction = "ltr";
  }

  if (language !== "en") {
    await translatePage(language);
    await translateMetaTags(language);
  }

  updateLinks(language);
  updateURL(language);
  addHreflangAndCanonicalTags(language);
});

window.addEventListener("popstate", async (event) => {
  window.location.reload();
});

const supportedLanguages = [
  { value: "en", text: "English" },
  { value: "fr", text: "Français" },
  { value: "ja", text: "日本語" },
  { value: "ko", text: "한국어" },
  { value: "es", text: "Español" },
  { value: "de", text: "Deutsch" },
  { value: "zh-cn", text: "简体中文" },
  { value: "zh-hk", text: "繁體中文" },
  { value: "pt", text: "Português" },
  { value: "ar", text: "العربية" },
];

module.exports = {
  getScriptURLParameters,
  fetchTranslations,
  hashText,
  removeAriaHiddenAttributes,
  translatePage,
  isLanguageSupported,
  translateTextNodes,
  translations,
};
