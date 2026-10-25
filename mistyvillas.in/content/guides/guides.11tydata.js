module.exports = {
  layout: "guide.njk",
  tags: ["guides"],
  eleventyComputed: {
    permalink: (data) =>
      `/guides/${data.page.fileSlug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}/`,
  },
};
