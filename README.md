# Miami Physical Therapy Center — website

Bilingual (Arabic RTL / English) Next.js 16 site for Miami Physical Therapy Center.

```bash
npm install
npm run dev      # http://localhost:3000 → redirects to /ar
npm run build && npm start
```

## Structure

| Path | What |
| --- | --- |
| `src/app/[lang]/` | All pages: home, services, about, team, branches, blog, booking, contact |
| `src/lib/data.ts` | **Business data** — branches, phones, services, team, stats, FAQs, reviews |
| `src/lib/i18n.ts` | UI strings for `ar` / `en` |
| `content/blog/<slug>/{ar,en}.md` | Blog posts (Markdown + frontmatter). Add a folder to publish a post |
| `src/components/sections/branch-globe.tsx` | Interactive Three.js globe for the branches section (NASA Blue Marble textures in `public/textures`) |
| `src/lib/booking*.ts`, `src/app/[lang]/booking/` | Booking flow, slot rules and storage |

## Booking

Patients pick service → branch → date/time → details. Slots run hourly 10:00–23:00 (Cairo time),
21 days ahead, max `SLOT_CAPACITY` (4) bookings per branch per slot — all configurable in
`src/lib/booking.ts` / `clinic.hours` in `data.ts`.

Bookings are saved to `data/bookings.json` (git-ignored). For production, set:

- `BOOKING_WEBHOOK_URL` — every booking is POSTed here as JSON (Zapier / Make / n8n → Google Sheets, email, WhatsApp Business…)
- `NEXT_PUBLIC_SITE_URL` — canonical URL for SEO (defaults to `https://miamiclinic.net`)

On serverless hosts (Vercel) the filesystem is read-only — use the webhook or replace
`src/lib/booking-store.ts` with a database.

## To confirm with the clinic

- Opening hours: the old site says "10 AM – 12" — assumed **midnight**.
- Moharam Bek branch has only a short address on the old site.

- English blog posts are adaptations of the Arabic originals; the two new posts (heel spur, knee arthritis) should be reviewed by the medical team.
