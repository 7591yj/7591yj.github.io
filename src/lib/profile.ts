import { EMAIL, SOCIAL } from "../consts";
import type { Locale } from "../i18n/ui";

export interface ProfileEntry {
  when: string;
  title: string;
  detail?: string;
  aside?: string;
  href?: string;
}

export interface Profile {
  kicker: string;
  statement: { text: string; em?: boolean }[];
  facts: { label: string; value: string; href?: string }[];
  linksLabel: string;
  sections: { title: string; entries: ProfileEntry[] }[];
}

const links = {
  chuo: "https://www.chuo-u.ac.jp/",
  inha: "https://www.inha.ac.kr/",
  iccetw:
    "https://www.researchgate.net/publication/413585599_Illumination-Adaptive_Part_Detection_for_Automated_FDM_3D_Printing_Dataset_Collection",
  iceic:
    "https://www.researchgate.net/publication/400239914_Automated_Korean-English_Bilingual_Highlighted_Text_Extraction_Using_HSV_Segmentation",
  showcase1:
    "https://www.chuo-u.ac.jp/academics/faculties/advanced/departments/infotech/news/2026/01/83597/",
  showcase2:
    "https://www.chuo-u.ac.jp/academics/faculties/advanced/departments/infotech/news/2026/07/87343/",
  seeds:
    "https://jelly-locust-cea.notion.site/Seeds-1beac07ca4e98043bbe9e81ccf29e806",
  igrus: "https://www.instagram.com/igrus_inha/",
};

const paperTitles = {
  iccetw:
    "Illumination-Adaptive Part Detection for Automated FDM 3D Printing Dataset Collection",
  iceic:
    "Automated Korean-English Bilingual Highlighted Text Extraction Using HSV Segmentation",
};

export const profileLinks = [
  { label: "GitHub", href: SOCIAL.github },
  { label: "Codeberg", href: SOCIAL.codeberg },
  { label: "LinkedIn", href: SOCIAL.linkedin },
];

const en: Profile = {
  kicker: "Profile",
  statement: [
    { text: "I hope to keep making things " },
    { text: "worth coming back to", em: true },
    { text: "." },
  ],
  facts: [
    { label: "Name", value: "Yeongjin Kim" },
    { label: "Based", value: "Tokyo, Japan" },
    { label: "From", value: "Jeonju, South Korea" },
    { label: "Born", value: "2002.07.20" },
    { label: "Email", value: EMAIL, href: `mailto:${EMAIL}` },
  ],
  linksLabel: "Elsewhere",
  sections: [
    {
      title: "Education",
      entries: [
        {
          when: "2025.09 — 2026.08",
          title: "Chuo University",
          detail: "Information and System Engineering · Exchange student",
          aside: "Tokyo, Japan",
          href: links.chuo,
        },
        {
          when: "2021.03 — 2027.02",
          title: "Inha University",
          detail: "Computer Science and Engineering · Expected 2027",
          aside: "Incheon, South Korea",
          href: links.inha,
        },
      ],
    },
    {
      title: "Papers",
      entries: [
        {
          when: "2026",
          title: paperTitles.iccetw,
          detail:
            "IEEE ICCE-TW 2026, Taoyuan · Seungyun Choi, Seungjun Lee, Yeongjin Kim, Namjoon Kim, Hyukjae Lee",
          aside: "Published",
          href: links.iccetw,
        },
        {
          when: "2026",
          title: paperTitles.iceic,
          detail: "ICEIC 2026, Macau · SeungJun Lee, Yeongjin Kim et al.",
          aside: "Published",
          href: links.iceic,
        },
      ],
    },
    {
      title: "Awards",
      entries: [
        {
          when: "2026.07.18",
          title: "CG, VR & Image Processing Project Showcase",
          detail: "Software Project on CG, VR and Image Processing 2",
          aside: "Grand Prize",
          href: links.showcase2,
        },
        {
          when: "2025.11.19",
          title: "2025 Hanium Dream-Up Contest",
          detail:
            "Creative Challenge Track · Final evaluation; selected as an outstanding project in the preliminary round",
          aside: "Encouragement Award",
        },
        {
          when: "2025.11.12",
          title: "CG, VR & Image Processing Project Showcase",
          detail: "Software Project on CG, VR and Image Processing 1",
          aside: "Grand Prize",
          href: links.showcase1,
        },
        {
          when: "2025.01.18",
          title: "2025 GreenTech Globalthon",
          aside: "Best Startup Pitch",
        },
        {
          when: "2023.11.12",
          title: "START-LAB 2023",
          detail: "Chung-Ang University × SEOULLAB PARTNERS",
          aside: "Grand Prize",
        },
      ],
    },
    {
      title: "Certificates",
      entries: [
        {
          when: "2025.05.24",
          title: "TOPCIT, 677",
          aside: "Ministry of Science and ICT, Korea",
        },
        {
          when: "2025.01.26",
          title: "TOEIC, 925",
          aside: "Korea TOEIC Committee",
        },
        { when: "2024.08.13", title: "JLPT N2", aside: "The Japan Foundation" },
        {
          when: "2021.07.13",
          title: "Driver's License, Type 1 Normal",
          aside: "Jeonbuk Provincial Police Agency",
        },
      ],
    },
    {
      title: "Clubs",
      entries: [
        {
          when: "2024.03 — 2025.08",
          title: "Seeds",
          detail: "Web development",
          aside: "Staff",
          href: links.seeds,
        },
        {
          when: "2024.03 — 2024.08",
          title: "IGRUS",
          detail: "Software development",
          aside: "Member",
          href: links.igrus,
        },
        {
          when: "2021.03 — 2021.08",
          title: "IGRUS",
          detail: "Software development",
          aside: "Member",
          href: links.igrus,
        },
      ],
    },
  ],
};

const ja: Profile = {
  kicker: "プロフィール",
  statement: [
    { text: "また" },
    { text: "使いたくなる", em: true },
    { text: "ものをつくり続けたい。" },
  ],
  facts: [
    { label: "氏名", value: "金 栄鎮 (KIM YEONGJIN)" },
    { label: "現在地", value: "東京都、日本" },
    { label: "出身地", value: "全州市、韓国" },
    { label: "生年月日", value: "2002.07.20" },
    { label: "メール", value: EMAIL, href: `mailto:${EMAIL}` },
  ],
  linksLabel: "リンク",
  sections: [
    {
      title: "学歴",
      entries: [
        {
          when: "2025.09 — 2026.08",
          title: "中央大学",
          detail: "情報工学科 · 交換留学生",
          aside: "東京都、日本",
          href: links.chuo,
        },
        {
          when: "2021.03 — 2027.02",
          title: "仁荷大学校",
          detail: "情報通信工学科 · 2027年卒業予定",
          aside: "仁川市、韓国",
          href: links.inha,
        },
      ],
    },
    {
      title: "論文",
      entries: [
        {
          when: "2026",
          title: paperTitles.iccetw,
          detail:
            "IEEE ICCE-TW 2026、台湾・桃園 · Seungyun Choi, Seungjun Lee, Yeongjin Kim, Namjoon Kim, Hyukjae Lee",
          aside: "発表済",
          href: links.iccetw,
        },
        {
          when: "2026",
          title: paperTitles.iceic,
          detail:
            "ICEIC 2026、中国・マカオ · SeungJun Lee, Yeongjin Kim et al.",
          aside: "発表済",
          href: links.iceic,
        },
      ],
    },
    {
      title: "受賞",
      entries: [
        {
          when: "2026.07.18",
          title: "画像・映像コンテンツ演習 成果発表会",
          detail: "画像・映像コンテンツ演習2",
          aside: "最優秀賞",
          href: links.showcase2,
        },
        {
          when: "2025.11.19",
          title: "2025 ハニウム ドリームアップ コンテスト",
          detail: "創造的チャレンジ部門 · 予選にて優秀プロジェクトに選出",
          aside: "奨励賞（本審査）",
        },
        {
          when: "2025.11.12",
          title: "画像・映像コンテンツ演習 成果発表会",
          detail: "画像・映像コンテンツ演習1",
          aside: "最優秀賞",
          href: links.showcase1,
        },
        {
          when: "2025.01.18",
          title: "2025 GreenTech グローバルソン",
          aside: "最優秀スタートアップピッチ賞",
        },
        {
          when: "2023.11.12",
          title: "START-LAB 2023",
          detail: "中央大学（韓国） × SEOULLAB PARTNERS",
          aside: "最優秀賞",
        },
      ],
    },
    {
      title: "資格",
      entries: [
        {
          when: "2025.05.24",
          title: "TOPCIT、677点",
          aside: "科学技術情報通信部（韓国）",
        },
        {
          when: "2025.01.26",
          title: "TOEIC、925点",
          aside: "韓国TOEICコミッティ",
        },
        {
          when: "2024.08.13",
          title: "日本語能力試験 N2",
          aside: "国際交流基金",
        },
        {
          when: "2021.07.13",
          title: "普通自動車第一種運転免許",
          aside: "全羅北道地方警察庁",
        },
      ],
    },
    {
      title: "サークル",
      entries: [
        {
          when: "2024.03 — 2025.08",
          title: "Seeds",
          detail: "ウェブ開発",
          aside: "スタッフ",
          href: links.seeds,
        },
        {
          when: "2024.03 — 2024.08",
          title: "IGRUS",
          detail: "ソフトウェア開発",
          aside: "メンバー",
          href: links.igrus,
        },
        {
          when: "2021.03 — 2021.08",
          title: "IGRUS",
          detail: "ソフトウェア開発",
          aside: "メンバー",
          href: links.igrus,
        },
      ],
    },
  ],
};

export function getProfile(locale: Locale): Profile {
  return locale === "ja" ? ja : en;
}
