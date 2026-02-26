import type { Project } from "../types";

export const softwareDevelopment: Project[] = [
  {
    title: "BizLenz",
    status: "released",
    subtitle: "AI-powered business proposal analysis tool for the web",
    desc: [
      "Designed and implemented frontend and database architecture",
      "Contributed to important logic implementation and refactoring to the backend",
      "Led a team of three engineers for several months",
    ],
    tech: ["Typescript", "Next.js", "Python", "FastAPI", "PostgreSQL"],
    tags: ["frontend", "backend", "ai"],
    slug: "bizlenz",
    href: "https://github.com/BizLenz",
  },
  {
    title: "modulino",
    status: "in development",
    subtitle:
      "3D-printer farm management/upgrade platform with dedicated hardware",
    desc: [
      "Designed and is developing the frontend",
      "Contributed to the backend architecture with Socket.IO implementation",
      "Designed and implemented required types for the frontend/backend/firmware",
      "Leading the software development team for several months",
      "Managing the project in terms of user experience",
    ],
    tech: ["Typescript", "Svelte", "Socket.IO"],
    tags: ["frontend", "backend", "hardware"],
    images: ["https://s6.imgcdn.dev/YGbuGM.jpg", "https://s6.imgcdn.dev/YGb4bd.jpg"],
    slug: "modulino",
    href: "https://github.com/modulino-lab",
    current: true,
  },
];

export const personalProjects: Project[] = [
  {
    title: "tg-webm-converter",
    status: "released",
    subtitle: "Python CLI Tool for Telegram Sticker Conversion",
    desc: [
      "Convert image/video files to webm format, matching the Telegram sticker requirements",
      "Implemented batch conversion management",
      "Released the tool through pypi",
    ],
    tech: ["Python"],
    tags: ["cli"],
    slug: "tg-webm-converter",
    href: "https://github.com/7591yj/tg-webm-converter",
  },
  {
    title: "fireplace",
    status: "released",
    subtitle: "Simple Social Media Webapp Using React and Firebase",
    desc: ["Released with GitHub Pages"],
    tech: ["Typescript", "React"],
    tags: ["frontend"],
    href: "https://github.com/7591yj/fireplace",
  },
];

export const allProjects = [...softwareDevelopment, ...personalProjects];
