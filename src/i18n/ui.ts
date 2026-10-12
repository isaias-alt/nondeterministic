export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

/** Narrows `Astro.currentLocale` (undefined when i18n routing is off). */
export function getLang(locale: string | undefined): Locale {
  return locales.find((l) => l === locale) ?? defaultLocale;
}

/** Intl locale used to format dates. `lang` and `hreflang` stay plain `es`. */
const dateLocales: Record<Locale, string> = {
  en: "en-US",
  es: "es-419",
};

/** `og:locale` values. Facebook has no `es_419`; `es_LA` is its Latin America code. */
export const ogLocales: Record<Locale, string> = {
  en: "en_US",
  es: "es_LA",
};

/**
 * Label and name of the link that switches TO each language. The label is the
 * language code: the nav is tight at phone width. The name, in that language,
 * is the title and accessible name.
 */
export const languageSwitch: Record<Locale, { label: string; title: string }> = {
  en: { label: "en", title: "Read in English" },
  es: { label: "es", title: "Leer en español" },
};

const en = {
  "nav.posts": "posts",
  "footer.label": "Footer",
  "home.description":
    "Notes on building software. Frontend, backend, and the decisions in between. No guarantees on output order.",
  "series.singular": "Series",
  "series.plural": "Series",
  "series.description":
    "Multi-part deep dives from nondeterministic. Read top to bottom, or jump in wherever.",
  "series.tagline":
    "Multi-part deep dives. Read top to bottom, or jump in wherever.",
  "series.part": "part",
  "series.parts": "parts",
  "series.empty": "None published yet.",
  "post.readingTime": "{n} min read",
  "post.updated": "Updated",
  "post.edit": "Edit on GitHub",
  "post.copy": "copy",
  "post.copied": "copied",
  "og.by": "by",
} as const;

export type UiKey = keyof typeof en;

const es: Record<UiKey, string> = {
  "nav.posts": "posts",
  "footer.label": "Pie de página",
  "home.description":
    "Notas sobre cómo construir software. Frontend, backend y las decisiones del medio. Sin garantías sobre el orden de salida.",
  "series.singular": "Serie",
  "series.plural": "Series",
  "series.description":
    "Análisis a fondo en varias partes de nondeterministic. Léelos de principio a fin, o salta a donde quieras.",
  "series.tagline":
    "Análisis a fondo en varias partes. Léelos de principio a fin, o salta a donde quieras.",
  "series.part": "parte",
  "series.parts": "partes",
  "series.empty": "Aún no hay ninguna publicada.",
  "post.readingTime": "{n} min de lectura",
  "post.updated": "Actualizado el",
  "post.edit": "Editar en GitHub",
  "post.copy": "copiar",
  "post.copied": "copiado",
  "og.by": "por",
};

const ui: Record<Locale, Record<UiKey, string>> = { en, es };

export function t(
  lang: Locale,
  key: UiKey,
  vars?: Record<string, string | number>,
): string {
  let text = ui[lang][key];
  for (const [name, value] of Object.entries(vars ?? {})) {
    text = text.replaceAll(`{${name}}`, String(value));
  }
  return text;
}

// pubDate is a date-only value (YYYY-MM-DD); format in UTC so the calendar
// day doesn't shift with the viewer's local timezone.
const dateOptions = {
  short: { month: "short", day: "2-digit" },
  long: { month: "short", day: "numeric", year: "numeric" },
} as const satisfies Record<string, Intl.DateTimeFormatOptions>;

export function formatDate(
  lang: Locale,
  date: Date,
  style: keyof typeof dateOptions,
): string {
  return (
    new Intl.DateTimeFormat(dateLocales[lang], {
      ...dateOptions[style],
      timeZone: "UTC",
    })
      .formatToParts(date)
      // es-419 joins the short form with a hyphen ("05-ene"); the long form
      // and es-ES use a space ("5 mar 2025", "05 ene"), so normalize to that.
      .map((part) => (part.type === "literal" ? part.value.replace("-", " ") : part.value))
      .join("")
  );
}
