'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

const SOURCE_LANGUAGE = 'es';
const TRANSLATE_COOKIE = 'googtrans';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 180;
const GOOGLE_TRANSLATE_SRC =
  'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';

const googleLanguageAliases: Record<string, string> = {
  fil: 'tl',
  he: 'iw',
  jv: 'jw',
  nb: 'no',
  nn: 'no',
  'pt-br': 'pt',
  'pt-pt': 'pt',
  zh: 'zh-CN',
  'zh-cn': 'zh-CN',
  'zh-hans': 'zh-CN',
  'zh-hant': 'zh-TW',
  'zh-hk': 'zh-TW',
  'zh-mo': 'zh-TW',
  'zh-sg': 'zh-CN',
  'zh-tw': 'zh-TW',
};

type TranslateElementConstructor = new (
  options: { pageLanguage: string; autoDisplay: boolean },
  elementId: string,
) => void;

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    __clusterGoogleTranslateReady?: boolean;
    __clusterGoogleTranslateTarget?: string;
    google?: {
      translate?: {
        TranslateElement?: TranslateElementConstructor;
      };
    };
  }
}

function normalizeLocale(locale: string | undefined) {
  return locale?.trim().replace('_', '-').toLowerCase() || '';
}

function toGoogleLanguageCode(locale: string) {
  const alias = googleLanguageAliases[locale];

  if (alias) {
    return alias;
  }

  const baseLanguage = locale.split('-')[0];
  return googleLanguageAliases[baseLanguage] || baseLanguage;
}

function getDeviceTargetLanguage() {
  const browserLanguages =
    navigator.languages?.length ? navigator.languages : [navigator.language];

  for (const browserLanguage of browserLanguages) {
    const normalized = normalizeLocale(browserLanguage);

    if (!normalized) {
      continue;
    }

    if (normalized.split('-')[0] === SOURCE_LANGUAGE) {
      return null;
    }

    return toGoogleLanguageCode(normalized);
  }

  return null;
}

function isLocalHostname(hostname: string) {
  return (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)
  );
}

function getCookieDomains(hostname: string) {
  if (!hostname || isLocalHostname(hostname)) {
    return [];
  }

  const normalizedHost = hostname.toLowerCase();
  const domains = [normalizedHost];

  if (normalizedHost.startsWith('www.')) {
    domains.push(normalizedHost.slice(4));
  }

  return domains;
}

function writeTranslateCookie(targetLanguage: string) {
  const value = `/${SOURCE_LANGUAGE}/${targetLanguage}`;
  const baseCookie = `${TRANSLATE_COOKIE}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;

  document.cookie = baseCookie;

  for (const domain of getCookieDomains(window.location.hostname)) {
    document.cookie = `${TRANSLATE_COOKIE}=${value}; domain=.${domain}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  }
}

function selectTargetLanguage(attempt = 0) {
  const targetLanguage = window.__clusterGoogleTranslateTarget;
  const combo = document.querySelector<HTMLSelectElement>('select.goog-te-combo');

  if (targetLanguage && combo) {
    combo.value = targetLanguage;
    combo.dispatchEvent(new Event('change', { bubbles: true }));
    return;
  }

  if (attempt < 20) {
    window.setTimeout(() => selectTargetLanguage(attempt + 1), 250);
  }
}

function bootGoogleTranslate() {
  if (window.__clusterGoogleTranslateReady) {
    return;
  }

  const TranslateElement = window.google?.translate?.TranslateElement;

  if (!TranslateElement) {
    return;
  }

  window.__clusterGoogleTranslateReady = true;
  new TranslateElement(
    {
      pageLanguage: SOURCE_LANGUAGE,
      autoDisplay: false,
    },
    'google_translate_element',
  );
  selectTargetLanguage();
}

export function AutoTranslate() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const targetLanguage = getDeviceTargetLanguage();

    if (!targetLanguage) {
      return;
    }

    writeTranslateCookie(targetLanguage);
    window.__clusterGoogleTranslateTarget = targetLanguage;
    document.documentElement.lang = targetLanguage;
    window.googleTranslateElementInit = bootGoogleTranslate;

    if (window.google?.translate?.TranslateElement) {
      bootGoogleTranslate();
      return;
    }

    setEnabled(true);
  }, []);

  return (
    <>
      <div
        id="google_translate_element"
        className="cluster-translate-element"
        aria-hidden="true"
      />
      {enabled && (
        <Script src={GOOGLE_TRANSLATE_SRC} strategy="afterInteractive" />
      )}
    </>
  );
}
