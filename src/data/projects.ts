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
    tech: [
      "Next.js",
      "Typescript",
      "Python",
      "FastAPI",
      "PostgreSQL",
    ],
    tags: ["frontend", "backend", "ai"],
  },
  {
    title: "modulino",
    status: "inDev",
    subtitle:
      "3D-printer farm management/upgrade platform with dedicated hardware",
    desc: [
      "Designed and is developing the frontend",
      "Contributed to the backend architecture with Socket.IO implementation",
      "Designed and implemented required types for the frontend/backend/firmware",
      "Leading the software development team for several months",
      "Managing the project in terms of user experience",
    ],
    tech: ["Svelte", "Socket.IO", "protobuf"],
    tags: ["frontend", "backend", "hardware"],
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
  },
  {
    title: "fireplace",
    status: "released",
    subtitle: "Simple Social Media Webapp Using React and Firebase",
    desc: ["Released with GitHub Pages"],
    tech: ["React", "Firebase"],
    tags: ["frontend"],
  },
];

export const allProjects = [...softwareDevelopment, ...personalProjects];
