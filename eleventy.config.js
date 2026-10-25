const fs = require("fs");

const SITE_URL = "https://mistyvillas.in";
const readData = () => JSON.parse(fs.readFileSync("mistyvillas.in/data.json", "utf8"));
const rupee = (n) => "₹" + Number(n).toLocaleString("en-IN");
const abs = (p) => SITE_URL + encodeURI(decodeURI(p || ""));
// JSON for <script type="application/ld+json">: escape "<" so text can never close the tag.
const safeJson = (o) => JSON.stringify(o, null, 2).replace(/</g, "\\u003c");

function buildFaq(data) {
  const site = data.site || {};
  const rooms = data.rooms || [];
  const extra = site.extra_person_charge;
  const items = [...(data.faq || [])];

  const roomLines = rooms.map((r) => `${r.name} ${rupee(r.price)} (up to ${r.max_guests} guests)`);
  if (roomLines.length) {
    const low = Math.min(...rooms.map((r) => Number(r.price)).filter(Boolean));
    items.splice(1, 0, {
      q: "How much do rooms at Misty Villas cost?",
      a:
        `Rooms start at ${rupee(low)} per night. Current rates per room per night: ${roomLines.join("; ")}.` +
        (extra ? ` Each extra person is ${rupee(extra)}.` : "") +
        " Please call or WhatsApp to confirm availability.",
    });
  }
  const phones = [site.phone_primary_display, site.phone_secondary_display].filter(Boolean).join(" or ");
  items.push({
    q: "How do I book a room?",
    a: `Call ${phones} or message us on WhatsApp${site.contact_person ? ` and ask for ${site.contact_person}` : ""}. We will confirm availability and rates for your dates.`,
  });
  return items;
}

function buildHomeSchema(data, faq) {
  const site = data.site || {};
  const rooms = data.rooms || [];
  const images = [site.hero_image, ...(data.experiences || []).flatMap((e) => (e.photos || []).slice(0, 2).map((p) => p.image))]
    .filter(Boolean)
    .slice(0, 6)
    .map(abs);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LodgingBusiness",
        "@id": SITE_URL + "/#resort",
        name: "Misty Villas",
        alternateName: "Misty Villas Panchalimedu",
        url: SITE_URL + "/",
        description: site.about,
        image: images,
        logo: SITE_URL + "/images/misty_logo.png",
        telephone: site.phone_primary,
        email: "surjoyce@gmail.com",
        priceRange: "₹₹",
        currenciesAccepted: "INR",
        petsAllowed: true,
        address: {
          "@type": "PostalAddress",
          streetAddress: "Panchalimedu Hills",
          addressLocality: "Kuttikanam",
          addressRegion: "Kerala",
          postalCode: "685532",
          addressCountry: "IN",
        },
        geo: { "@type": "GeoCoordinates", latitude: 9.54191, longitude: 76.96074 },
        hasMap: "https://www.google.com/maps/search/?api=1&query=9.54191,76.96074",
        sameAs: [site.instagram_url].filter(Boolean),
        amenityFeature: (data.amenities || []).map((name) => ({
          "@type": "LocationFeatureSpecification",
          name,
          value: true,
        })),
        aggregateRating: { "@type": "AggregateRating", ratingValue: "4.7", reviewCount: "136" },
        containsPlace: rooms.map((r) => ({
          "@type": "HotelRoom",
          name: r.name,
          description: (r.features || []).join(". "),
          occupancy: { "@type": "QuantitativeValue", maxValue: Number(r.max_guests) },
          image: (r.photos || []).slice(0, 3).map((p) => abs(p.image)),
          offers: {
            "@type": "Offer",
            price: Number(r.price),
            priceCurrency: "INR",
            url: SITE_URL + "/#rooms",
            availability: "https://schema.org/InStock",
          },
        })),
      },
      {
        "@type": "WebSite",
        "@id": SITE_URL + "/#website",
        url: SITE_URL + "/",
        name: "Misty Villas Panchalimedu",
        inLanguage: "en-IN",
        publisher: { "@id": SITE_URL + "/#resort" },
      },
      {
        "@type": "FAQPage",
        mainEntity: faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };
}

module.exports = function (eleventyConfig) {
  // Hand-written assets are copied as-is. The homepage itself is built from index.njk.
  eleventyConfig.addPassthroughCopy({
    "mistyvillas.in/styles.css": "styles.css",
    "mistyvillas.in/script.js": "script.js",
    "mistyvillas.in/images": "images",
  });

  // Everything below comes from data.json, so CMS edits update the whole site.
  eleventyConfig.addGlobalData("site", () => readData().site);
  eleventyConfig.addGlobalData("rooms", () => readData().rooms || []);
  eleventyConfig.addGlobalData("experiences", () => readData().experiences || []);
  eleventyConfig.addGlobalData("testimonials", () => readData().testimonials || { items: [] });
  eleventyConfig.addGlobalData("amenities", () => readData().amenities || []);
  eleventyConfig.addGlobalData("faqItems", () => buildFaq(readData()));
  eleventyConfig.addGlobalData("homeSchemaJson", () => {
    const data = readData();
    return safeJson(buildHomeSchema(data, buildFaq(data)));
  });
  eleventyConfig.addGlobalData("lowest_price", () => {
    const prices = (readData().rooms || []).map((r) => Number(r.price)).filter(Boolean);
    return prices.length ? Math.min(...prices) : null;
  });

  // Pages marked "Draft" in the CMS are left out of the live build.
  eleventyConfig.addPreprocessor("drafts", "md", (data) => {
    if (data.draft) return false;
  });

  // When hosted under a sub-path (github.io/Misty-Villas/), prefix root-relative links.
  const prefix = (process.env.PATH_PREFIX || "").replace(/\/$/, "");
  eleventyConfig.addTransform("pathPrefix", function (content) {
    if (!prefix || !(this.page.outputPath || "").endsWith(".html")) return content;
    return content.replace(/(href|src)="\/(?!\/)/g, `$1="${prefix}/`);
  });

  eleventyConfig.addFilter("dateDisplay", (d) =>
    new Date(d).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })
  );
  eleventyConfig.addFilter("monthYear", (d) =>
    new Date(d).toLocaleDateString("en-IN", { year: "numeric", month: "long" })
  );
  eleventyConfig.addFilter("rupee", rupee);
  eleventyConfig.addFilter("paras", (s) =>
    String(s || "").split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean)
  );
  eleventyConfig.addFilter("dateIso", (d) => new Date(d).toISOString().slice(0, 10));
  eleventyConfig.addFilter("urlSafe", (p) => String(p || "").replace(/ /g, "%20"));
  eleventyConfig.addFilter("take", (arr, n) => (arr || []).slice(0, n));

  return {
    dir: { input: "mistyvillas.in", output: "_site", includes: "_includes" },
    templateFormats: ["md", "njk"],
    markdownTemplateEngine: false,
    htmlTemplateEngine: "njk",
  };
};
