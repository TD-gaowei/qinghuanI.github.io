const nav = [
  {
    text: "首页",
    link: "/",
  },
  {
    text: "标签",
    link: "/tag/",
  },
  {
    text: "关于我",
    link: "/about/",
  },
];

module.exports = {
  title: "学习概念而不是语言", // Title for the site. This will be displayed in the navbar.
  theme: "@vuepress/theme-blog",
  port: 3002,
  base: "/",
  themeConfig: {
    // Please keep looking down to see the available options.
    nav,
    dateFormat: "YYYY-MM-DD",
    footer: {
      contact: [
        {
          type: "github",
          link: "https://github.com/qinghuanI",
        },
      ],
      copyright: [
        {
          text: "Privacy Policy",
          link: "https://policies.google.com/privacy?hl=en-US",
        },
        {
          text: "Copyright© 2019-present qinghuanI",
        },
      ],
    },
    globalPagination: {
      prevText: "上一页", // Text for previous links.
      nextText: "下一页", // Text for next links.
      lengthPerPage: "5", // Maximum number of posts per page.
      layout: "Pagination",
    },
    feed: {
      canonical_base: "https://qinghuanI.github.io/my-blog",
      rss: false,
      atom: false,
      json: false,
    },
    serviceWorker: true,
    updatePopup: true,
  },
  plugins: [],
  head: [["link", { rel: "shortcut icon", type: "image/x-icon", href: "favicon.jpeg" }]],
};
