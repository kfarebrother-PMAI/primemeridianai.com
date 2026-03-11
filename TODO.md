# Website — Deployment To-Do

## Done

- [x] **Create GitHub repo** — public repo `primemeridianai.com` under kfarebrother-PMAI (made public for free GitHub Pages)
- [x] **Push website code** — all pages committed and pushed to main
- [x] **Configure Claude Code access** — Claude can push to the website repo from the AIOS workspace
- [x] **Add headshot photo** — v4 (white shirt, office background) on About page
- [x] **Configure DNS** — A records (185.199.108-111.153) + CNAME (www → kfarebrother-PMAI.github.io) in Squarespace DNS. MX records untouched.
- [x] **Enable GitHub Pages** — deployed from main branch, CNAME set to primemeridianai.com
- [x] **Mini-audit page** — changed to "Coming soon" placeholder (full survey + AI-generated report needs backend infrastructure)

## Waiting

- [ ] **SSL certificate** — GitHub is provisioning a Let's Encrypt cert for primemeridianai.com. Can take up to 30 mins. Once live, enable HTTPS enforcement.
- [ ] **Choose dark theme** — preview file at `preview-themes.html` (3 options: Night Sky Navigator, Deep Ocean, Starfield). Apply chosen theme to style.css.

## Before Launch

- [ ] **Apply dark theme** — update style.css with chosen colour scheme, adjust all pages as needed
- [ ] **Enable HTTPS enforcement** — once certificate is issued, run: `gh api repos/kfarebrother-PMAI/primemeridianai.com/pages -X PUT -F "https_enforced=true" -F "source[branch]=main" -F "source[path]=/"`
- [ ] **Test all pages** — responsive on mobile, links work, Calendly embed loads, nav toggle works
- [ ] **Favicon** — add favicon.ico or SVG favicon
- [ ] **OG images** — create and add social sharing images for each page
- [ ] **Logo / wordmark** — decide on text-only or designed logo, update nav
- [ ] **Set up GoatCounter** — create account, add tracking script to all pages
- [ ] **Set up Google Analytics** — create GA4 property, add gtag.js to all pages, connect to DataOS pipeline (new collector: `collect_ga.py` → `data/data.db`)

## Mini-Audit (Next Week)

- [ ] **Design survey questions** — structured questions for the self-audit, tailored by business type
- [ ] **Set up private server** — hosted environment that can run Claude-powered analysis
- [ ] **Build survey form** — on /mini-audit page, stores responses in a database
- [ ] **Build report generation pipeline** — pull survey responses → AI analysis → personalised report
- [ ] **Email delivery** — notify user when their report is ready
- [ ] **Consider moving site hosting** — to the private server if it makes sense

## Optional / Later

- [ ] Links page (/links) — link-in-bio for YouTube
- [ ] Blog / Insights page — add when YouTube content exists to embed
- [ ] Add pricing to AI Audit page — after first 2-3 audits delivered
- [ ] PI insurance line — add to data handling section when insurance is in place
