import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://may1224.github.io/May-Astro-Paper/",
    title: "AstroMay",
    description: "记录前端学习、工程实践与个人成长的中文技术博客。",
    author: "AstroMay",
    profile: "",
    ogImage: "default-og.jpg",
    lang: "zh-CN",
    timezone: "Asia/Shanghai",
    dir: "ltr",
  },
  posts: {
    perPage: 6,
    perIndex: 4,
    scheduledPostMargin: 15 * 60 * 1000,
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: false,
    showArchives: true,
    showBackButton: true,
    editPost: {
      enabled: false,
    },
    search: "pagefind",
  },
  socials: [],
  shareLinks: [
    {
      name: "mail",
      url: "mailto:?subject=分享一篇文章&body=",
      linkTitle: "通过邮件分享",
    },
  ],
});
