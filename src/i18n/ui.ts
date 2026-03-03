export const locales = ["en", "ja"] as const;
export type Locale = (typeof locales)[number];

export const ui = {
  en: {
    "nav.home": "Home",
    "nav.projects": "Projects",
    "nav.blog": "Blog",
    "nav.about": "About",
    "404.message": "Page Not Found",
    "404.back": "Back to Home",
    "500.message": "Internal Server Error",
    "500.back": "Back to Home",
  },
  ja: {
    "nav.home": "ホーム",
    "nav.projects": "プロジェクト",
    "nav.blog": "ブログ",
    "nav.about": "プロフィール",
    "404.message": "ページが見つかりません",
    "404.back": "ホームへ戻る",
    "500.message": "内部サーバーエラー",
    "500.back": "ホームへ戻る",
  },
} satisfies Record<Locale, Record<string, string>>;

// Astro.currentLocale is undefined; infer from the URL path
export function detectLocale(pathname: string): Locale {
  const nonDefault = locales.filter((l) => l !== "en");
  return (
    nonDefault.find(
      (l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`,
    ) ?? "en"
  );
}

export function useTranslations(locale: string | undefined) {
  const lang = (locale ?? "en") as Locale;
  return function t(key: keyof (typeof ui)[Locale]): string {
    return ui[lang]?.[key] ?? ui["en"][key];
  };
}
