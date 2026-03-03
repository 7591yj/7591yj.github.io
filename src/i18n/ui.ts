export const locales = ["en", "ja"] as const;
export type Locale = (typeof locales)[number];

export const ui = {
  en: {
    "nav.home": "Home",
    "nav.projects": "Projects",
    "nav.blog": "Blog",
    "nav.about": "About",
  },
  ja: {
    "nav.home": "ホーム",
    "nav.projects": "プロジェクト",
    "nav.blog": "ブログ",
    "nav.about": "プロフィール",
  },
} satisfies Record<Locale, Record<string, string>>;

export function useTranslations(locale: string | undefined) {
  const lang = (locale ?? "en") as Locale;
  return function t(key: keyof (typeof ui)[Locale]): string {
    return ui[lang]?.[key] ?? ui["en"][key];
  };
}
