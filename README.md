# Misty Villas website

Source lives in `mistyvillas.in/`. The homepage is hand-built (`index.html`, `script.js`,
`styles.css`) and reads rooms, rates, photos and contacts from `data.json`.
New pages and travel guides are Markdown files built with Eleventy into `_site/`.

## Edit without code (free)
1. Go to https://pagescms.org, sign in with GitHub, open this repo on branch `main`.
2. **Site & contact details**: rates, room photos, phone numbers, homepage photos.
3. **New pages**: About, FAQ, Gallery... live at `/page-title/`.
4. **Travel guides / blog**: live at `/guides/guide-title/`, listed at `/guides/`.
5. New pages start as **Draft**. Untick Draft and Save to publish.
6. Saving commits to GitHub, which redeploys the site in about a minute.

Pages are not in the top menu. Link them by pasting the address (for example
`/about/`) in another page, WhatsApp or Instagram.

## Deploy (GitHub Pages, free)
- Repo Settings > Pages > Source: **GitHub Actions** (one-time).
- Every push to `main` (including CMS saves) runs `.github/workflows/deploy.yml`, builds with Eleventy and publishes.
- Check progress under the repo's **Actions** tab.
- Once `mistyvillas.in` points at GitHub Pages, delete the `PATH_PREFIX` line in the workflow.

## Preview locally
`npm install`, then `npm start`.

## Photos
Upload through the CMS. Aim for under ~300 KB and about 1200px wide (WebP or JPG).

## SEO and AI visibility
- The homepage is built as plain HTML (rooms, rates, FAQ, about text), so search engines and AI tools can read it.
- Edit rates, about text, facilities and FAQ in Pages CMS under "Site & contact details". Rate and booking answers in the FAQ, the rates table, structured data and `llms.txt` all update automatically.
- Generated on every build: `sitemap.xml`, `robots.txt`, `llms.txt`.
