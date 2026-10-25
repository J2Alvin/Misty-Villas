module.exports = {
  layout: "page.njk",
  tags: ["pages"],
  eleventyComputed: {
    permalink: (data) =>
      `/${data.page.fileSlug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}/`,
  },
};
