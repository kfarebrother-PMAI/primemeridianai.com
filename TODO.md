# Website — Deployment To-Do

## Done

- [x] **Create GitHub repo** — public repo `primemeridianai.com` under kfarebrother-PMAI (made public for free GitHub Pages)
- [x] **Push website code** — all pages committed and pushed to main
- [x] **Configure Claude Code access** — Claude can push to the website repo from the AIOS workspace
- [x] **Add headshot photo** — v4 (white shirt, office background) on About page
- [x] **Configure DNS** — A records (185.199.108-111.153) + CNAME (www → kfarebrother-PMAI.github.io) in Squarespace DNS. MX records untouched.
- [x] **Enable GitHub Pages** — deployed from main branch, CNAME set to primemeridianai.com
- [x] **Mini-audit page** — changed to "Coming soon" placeholder (full survey + AI-generated report needs backend infrastructure)
- [x] **SSL certificate** — Let's Encrypt cert issued for primemeridianai.com + www, expires 2026-06-09
- [x] **Choose dark theme** — Night Sky Navigator selected from preview-themes.html
- [x] **Apply dark theme** — Night Sky Navigator colour scheme applied to style.css and all pages
- [x] **Enable HTTPS enforcement** — HTTPS enforced via GitHub Pages API

## Before Launch

- [ ] **Test all pages** — responsive on mobile, links work, Calendly embed loads, nav toggle works
- [ ] **Favicon** — add favicon.ico or SVG favicon
- [ ] **OG images** — create and add social sharing images for each page
- [x] **Logo / wordmark** — globe + compass star logo added to nav and footer
- [ ] **Set up GoatCounter** — create account, add tracking script to all pages
- [ ] **Set up Google Analytics** — create GA4 property, add gtag.js to all pages, connect to DataOS pipeline (new collector: `collect_ga.py` → `data/data.db`)
- [x] **Remove preview-themes.html** — removed from live site

## Calendly Configuration

- [ ] **Connect personal calendar** — link personal Google/iCal calendar so personal appointments block discovery call slots
- [ ] **Prevent double-booking** — ensure Calendly checks all connected calendars before offering slots
- [ ] **Availability** — set working hours, days available for calls, and timezone
- [ ] **Limits and buffers** — minimum notice period, buffer time between meetings, max calls per day/week
- [ ] **Invitee form / qualification** — add screening questions (company size, what they're looking for, etc.)
- [ ] **Notifications and reminders** — set up email/SMS reminders for both host and invitee to improve attendance
- [ ] **Confirmation page** — customise the post-booking confirmation page with next steps / what to expect

## Mini-Audit (Next Week)

- [ ] **Design survey questions** — structured questions for the self-audit, tailored by business type
- [ ] **Set up private server** — hosted environment that can run Claude-powered analysis
- [ ] **Build survey form** — on /mini-audit page, stores responses in a database
- [ ] **Build report generation pipeline** — pull survey responses → AI analysis → personalised report
- [ ] **Email delivery** — notify user when their report is ready
- [ ] **Consider moving site hosting** — to the private server if it makes sense

## Integration Reminders

> **Apollo Website Tracking:** Intent page labels are configured in Apollo (Settings → Inbound → Website Tracking). If you add, remove, or rename pages, update the Apollo intent settings to match. Current mapping:
> - `/ai-audit` → High | `/book` → High | `/mini-audit` → High
> - `/` → Medium
> - `/about` → Low | `/privacy` → Low

## Optional / Later

- [ ] Links page (/links) — link-in-bio for YouTube
- [ ] Blog / Insights page — add when YouTube content exists to embed
- [ ] Add pricing to AI Audit page — after first 2-3 audits delivered
- [ ] PI insurance line — add to data handling section when insurance is in place
