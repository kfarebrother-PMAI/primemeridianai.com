# Website — Deployment To-Do

> **Design standard:** All website work MUST follow the `frontend-design` plugin (`.claude/plugins/marketplaces/claude-code-plugins/plugins/frontend-design/skills/frontend-design/SKILL.md`). Key rules: no generic AI aesthetics, intentional motion/animation, atmospheric depth (gradients, textures), distinctive typography, meaningful hover states. Review the SKILL.md before any visual changes.

## Done

- [x] **Create GitHub repo** — public repo `primemeridianai.com` under kfarebrother-PMAI (made public for free GitHub Pages)
- [x] **Push website code** — all pages committed and pushed to main
- [x] **Configure Claude Code access** — Claude can push to the website repo from the AIOS workspace
- [x] **Add headshot photo** — v4 (white shirt, office background) on About page
- [x] **Configure DNS** — A records (185.199.108-111.153) + CNAME (www → kfarebrother-PMAI.github.io) in Squarespace DNS. MX records untouched.
- [x] **Enable GitHub Pages** — deployed from main branch, CNAME set to primemeridianai.com
- [x] **SSL certificate** — Let's Encrypt cert issued for primemeridianai.com + www, expires 2026-06-09
- [x] **Choose dark theme** — Night Sky Navigator selected from preview-themes.html
- [x] **Apply dark theme** — Night Sky Navigator colour scheme applied to style.css and all pages
- [x] **Enable HTTPS enforcement** — HTTPS enforced via GitHub Pages API
- [x] **Logo / wordmark** — globe + compass star logo added to nav and footer
- [x] **Remove preview-themes.html** — removed from live site
- [x] **Favicon** — favicon.ico, favicon-32.png, apple-touch-icon.png all added and referenced on every page
- [x] **Pricing on AI Audit page** — three tiers deployed (£3,500 / £5,000 / £7,000+) with inclusions and no-risk guarantee
- [x] **Mini-Map lead magnet** — interactive scatter plot tool live at /mini-map. Replaces old mini-audit concept. API backend (FastAPI), Brevo email, Attio CRM integration all working.
- [x] **Mini-audit redirect** — /mini-audit.html now redirects to /mini-map.html (clean deprecation)
- [x] **Calendly embed** — discovery call booking live on /book page
- [x] **Apollo website tracking** — consent-gated via cookie-consent.js (PECR-compliant). Loads after explicit user consent.
- [x] **Privacy notice** — published at /privacy. ICO registered (ZC109473). GDPR compliance complete.

## Sprint 1 (w/c 7 Apr) — Outreach Launch Blockers

- [ ] **Test all pages** — responsive on mobile, links work, Calendly embed loads, nav toggle works
- [ ] **OG images** — create and add social sharing images for each page (gap: no og:image on any page, hurts LinkedIn/social sharing)
- [ ] **Google Analytics** — create GA4 property, add gtag.js to all pages. Connect to DataOS pipeline later (new collector: `collect_ga.py` → `data/data.db`)
- [ ] **Visual polish pass** — review all pages for consistency, spacing, mobile responsiveness before outreach drives traffic

## Calendly Configuration

- [ ] **Connect personal calendar** — link personal Google/iCal calendar so personal appointments block discovery call slots
- [ ] **Prevent double-booking** — ensure Calendly checks all connected calendars before offering slots
- [ ] **Availability** — set working hours, days available for calls, and timezone
- [ ] **Limits and buffers** — minimum notice period, buffer time between meetings, max calls per day/week
- [ ] **Invitee form / qualification** — add screening questions (company size, what they're looking for, etc.)
- [ ] **Notifications and reminders** — set up email/SMS reminders for both host and invitee to improve attendance
- [ ] **Confirmation page** — customise the post-booking confirmation page with next steps / what to expect

## Integration Reminders

> **Apollo Website Tracking:** Intent page labels are configured in Apollo (Settings → Inbound → Website Tracking). If you add, remove, or rename pages, update the Apollo intent settings to match. Current mapping:
> - `/ai-audit` → High | `/book` → High | `/mini-map` → High
> - `/` → Medium
> - `/about` → Low | `/privacy` → Low

## Optional / Later

- [ ] Links page (/links) — link-in-bio for YouTube. Build when first video is published.
- [ ] Blog / Insights page — add when YouTube content exists to embed
- [ ] PI insurance line — add to data handling section when insurance is in place
- [ ] GoatCounter — alternative to GA if lighter tracking preferred. Deprioritised in favour of GA4.
