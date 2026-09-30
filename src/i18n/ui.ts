export const locales = ["en", "ja"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

const en = {
  "nav.home": "Home",
  "nav.projects": "Projects",
  "nav.blog": "Blog",
  "nav.about": "About",
  "404.back": "Back to Home",
  "500.back": "Back to Home",
  "projects.selectTech": "Select tech…",
  "projects.techSelected": "{count} selected",
  "projects.clear": "Clear",
  "detail.backBlog": "Back to blog",
  "detail.backProjects": "Back to projects",
  "site.description":
    "Portfolio and blog of 7591yj - software development, design, and research.",
  "shell.tokyo": "Tokyo",
  "shell.work": "Work",
  "shell.writing": "Writing",
  "shell.about": "About",
  "shell.backWork": "All work",
  "shell.backWriting": "All writing",
  "work.title": "Selected work",
  "work.nowBuilding": "Now building",
  "work.project": "Project",
  "work.count": "{count} projects",
  "work.view": "View",
  "work.viewField": "Field view",
  "work.viewIndex": "Index view",
  "work.open": "Open",
  "work.drag": "Drag",
  "writing.title": "Writing",
  "writing.minutes": "{count} min read",
  "writing.contents": "Contents",
  "about.title": "About",
  "error.kicker": "Error",
  "404.message": "There's nothing here.",
  "500.message": "Something went wrong.",
  "meta.date": "Date",
  "meta.year": "Year",
  "meta.status": "Status",
  "meta.link": "Link",
  "meta.tags": "Tags",
  "meta.readTime": "Read time",
  "meta.stack": "Stack",
  "status.released": "Released",
  "status.inDevelopment": "In development",
  "status.planned": "Planned",
  "status.prototype": "Prototype",
  "status.paused": "Paused",
  "status.archived": "Archived",
} as const;

export type UiKey = keyof typeof en;

const ja: Partial<Record<UiKey, string>> = {
  "nav.home": "ホーム",
  "nav.projects": "プロジェクト",
  "nav.blog": "ブログ",
  "nav.about": "プロフィール",
  "404.back": "ホームへ戻る",
  "500.back": "ホームへ戻る",
  "projects.selectTech": "技術を選択…",
  "projects.techSelected": "{count}件選択",
  "projects.clear": "クリア",
  "detail.backBlog": "ブログへ戻る",
  "detail.backProjects": "プロジェクトへ戻る",
  "site.description":
    "7591yjのポートフォリオとブログ - ソフトウェア開発、デザイン、リサーチ",
  "work.project": "プロジェクト",
  "work.view": "表示",
  "work.viewField": "フィールド表示",
  "work.viewIndex": "一覧表示",
  "error.kicker": "エラー",
  "404.message": "ここには何もありません。",
  "500.message": "問題が発生しました。",
  "meta.date": "日付",
  "meta.year": "年",
  "meta.status": "ステータス",
  "meta.link": "リンク",
  "meta.tags": "タグ",
  "meta.stack": "技術",
};

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
  return function t(key: UiKey, vars?: Record<string, string | number>) {
    let text: string = (lang === "ja" ? ja[key] : undefined) ?? en[key];
    for (const [name, value] of Object.entries(vars ?? {}))
      text = text.replace(`{${name}}`, String(value));
    return text;
  };
}
