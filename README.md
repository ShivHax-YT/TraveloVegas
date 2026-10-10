# TraveloVegas
Travelling to Las Vegas, you've come to the right place, here's everything you need to know about Vegas!

## Build

```sh
npm install
npm run build   # writes dist/
npm run dev     # serves dist/ at http://localhost:4321
npm run shots   # screenshots into screens/latest/
```

Environment variables for `npm run build`:

- `SITE_URL`: the site's public URL, used for canonical links, Open Graph URLs and the sitemap. Defaults to `https://travelovegas.com/`.
- `NOINDEX=1`: preview mode. Adds `<meta name="robots" content="noindex">` to every page, `X-Robots-Tag: noindex` for `/*` in `_headers`, and `Disallow: /` in `robots.txt`. Use it for preview deployments; leave it unset for production.

Example preview build: `NOINDEX=1 SITE_URL=https://preview.example.pages.dev npm run build`
