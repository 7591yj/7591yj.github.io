import {
  EMAIL,
  LOCATION_FROM,
  LOCATION_NOW,
  NAME,
  PROFILE_IMAGE,
} from "../../consts.ts";

export const AboutContent = {
  name: NAME,
  profileImage: PROFILE_IMAGE,
  shortDesc:
    "Junior software developer with a passion for building scalable and maintainable applications.",
  iconsMeta: [
    {
      icon: "/assets/cake.svg",
      alt: "Born in",
      content: "07.20.2002",
    },
    {
      icon: "/assets/at.svg",
      alt: "Mail Me at",
      content: EMAIL,
      href: `mailto:${EMAIL}`,
    },
    {
      icon: "/assets/map-pin-house.svg",
      alt: "Where I am from",
      content: LOCATION_FROM,
      href: `https://www.google.com/maps/search/?api=1&query=${LOCATION_FROM}`,
    },
    {
      icon: "/assets/map-pin.svg",
      alt: "Where I am",
      content: LOCATION_NOW,
      href: `https://www.google.com/maps/search/?api=1&query=${LOCATION_NOW}`,
    },
  ],
  educations: [
    {
      name: "Inha University",
      location: "Incheon, South Korea",
      role: "Student",
      period: "2021.03 - 2027.02 (expected)",
      desc: ["Major in Computer Science and Engineering"],
    },
    {
      name: "Chuo University",
      location: "Tokyo, Japan",
      role: "Exchange Student",
      period: "2025.09-2026.08 (expected)",
      desc: ["Major in Information and System Engineering"],
    },
  ],
  certificates: [
    {
      date: "07.13.2021",
      name: "Driver's License, Type 1, Normal",
      issuer: "Jeonbuk Provincial Police Agency",
    },
    {
      date: "08.13.2024",
      name: "JLPT N2",
      issuer: "The Japan Foundation",
    },
    {
      date: "01.26.2025",
      name: "TOEIC, 925",
      issuer: "Korea TOEIC Committee",
    },
    {
      date: "05.24.2025",
      name: "TOPCIT, 677",
      issuer: "Ministry of Science and ICT, Korea",
    },
  ],
  clubs: [
    {
      period: "03.2021\n-08.2021",
      name: "IGRUS",
      topic: "SW Dev",
      role: "Member",
      href: "https://www.instagram.com/igrus_inha/",
    },
    {
      period: "03.2024\n-08.2024",
      name: "IGRUS",
      topic: "SW Dev",
      role: "Member",
      href: "https://www.instagram.com/igrus_inha/",
    },
    {
      period: "03.2024\n-08.2025",
      name: "Seeds",
      topic: "Web Dev",
      role: "Staff",
      href: "https://jelly-locust-cea.notion.site/Seeds-1beac07ca4e98043bbe9e81ccf29e806",
    },
  ],
  awards: [
    {
      date: "11.12.2023",
      name: "Chung-Ang University x SEOULLAB PARTNERS '2023 START-LAB",
      award: "Grand Prize",
    },
    {
      date: "01.18.2025",
      name: "2025 GreenTech Globalthon",
      award: "Best Startup Pitch Award",
    },
    {
      date: "11.19.2025",
      name: "2025 Hanium Dream-Up Contest (Creative Challenge Track)",
      award:
        "Encouragement Award, Final Evaluation (Selected as Outstanding Project in Preliminary Round)",
    },
  ],
};
