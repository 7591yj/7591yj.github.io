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
    "projects.selectTech": "Select tech…",
    "projects.techSelected": "{count} selected",
    "projects.clear": "Clear",
    "detail.backBlog": "Back to blog",
    "detail.backProjects": "Back to projects",
    "meta.date": "DATE",
    "meta.year": "YEAR",
    "meta.status": "STATUS",
    "meta.link": "LINK",
    "meta.tags": "TAGS",
    "status.released": "Released",
    "status.inDevelopment": "In development",
    "status.planned": "Planned",
    "status.prototype": "Prototype",
    "status.paused": "Paused",
    "status.archived": "Archived",
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
    "projects.selectTech": "技術を選択…",
    "projects.techSelected": "{count}件選択",
    "projects.clear": "クリア",
    "detail.backBlog": "ブログへ戻る",
    "detail.backProjects": "プロジェクトへ戻る",
    "meta.date": "日付",
    "meta.year": "年",
    "meta.status": "ステータス",
    "meta.link": "リンク",
    "meta.tags": "タグ",
    "status.released": "リリース済み",
    "status.inDevelopment": "開発中",
    "status.planned": "計画中",
    "status.prototype": "試作",
    "status.paused": "一時停止",
    "status.archived": "アーカイブ",
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
