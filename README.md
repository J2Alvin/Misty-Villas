# Misty Villas website

Static site in `mistyvillas.in/`. Rooms, rates, photos and contact details all live in
`mistyvillas.in/data.json`; `script.js` builds the page from it.

## Edit without code (free)
1. Go to https://pagescms.org and sign in with GitHub.
2. Pick this repo and branch. The `.pages.yml` file sets up the forms.
3. Change rates, upload/remove photos, edit contact details, then Save. This commits to GitHub.

## Go live (free)
Deploy from this repo on Cloudflare Pages, Netlify or GitHub Pages:
- Build command: none
- Publish directory: `mistyvillas.in`

Each save in the CMS redeploys the site in about a minute. Then point the
`mistyvillas.in` domain DNS at the new host (needs domain registrar access).

## Adding photos
Upload through the CMS (images go to `mistyvillas.in/images`). Keep them under ~300 KB,
about 1200px wide, in WebP/JPG, for fast loading on mobile.
