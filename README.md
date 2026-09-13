# Aegza AI Website V3

Aegza AI is a static HTML/CSS/JavaScript site with a small serverless contact endpoint. It presents Aegza as an AI data operations and human intelligence partner without unsupported client, workforce, accuracy, certification, or location claims.

V3 adds a short first-visit loader, scroll progress, service deep links, capability expansion, magnetic CTAs, pointer-only ambient/card light, copy actions, WhatsApp conversion CTA, custom 404, and stronger form idempotency and request validation.

## Project structure

- `index.html` - responsive website and partnership form
- `styles.css` - visual system, responsive layout, motion and accessibility states
- `config.js` - public contact/social configuration used by the frontend
- `script.js` - navigation, service interactions, cursor light, validation and API submission
- `api/contact.js` - server-side validation and Resend email endpoint
- `privacy.html`, `terms.html` - minimal legal placeholders
- `404.html` - branded not-found page
- `assets/` - approved brand assets; add the official logo at `assets/aegza-logo.png`

## Local development

The static page can be opened directly, but the contact form requires the serverless route. Use Node.js 18+ and Vercel CLI:

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open the URL printed by Vercel. Email sending will remain unavailable until the environment variables are configured with a real Resend key and verified sender.

## Email configuration

1. Create a Resend account and API key.
2. Set `RESEND_API_KEY` in `.env.local` or deployment environment variables.
3. Set `CONTACT_EMAIL` to the inbox that should receive inquiries. It defaults to `aegza.ai@gmail.com` and can later become `contact@aegza.in` or `partnerships@aegza.in`.
4. Verify the sending domain in Resend, then set `FROM_EMAIL` to a verified Aegza address.
5. Set `ENABLE_AUTO_REPLY=true` only when the optional confirmation email is desired.
6. Deploy the static files and `api/contact.js` to Vercel or another compatible serverless host.

The visitor email is used as `Reply-To`; it is never used as the sender. `.env` and `.env.local` are ignored by Git. Never put API keys in frontend files.

The browser sends a unique `submissionId`; the endpoint rejects duplicate IDs, non-JSON requests, oversized payloads, over-limit fields, invalid project types and populated honeypots. A lightweight in-memory IP cooldown is included for serverless instances; add platform-level rate limiting before high-volume production use.

## Contact form behavior

Required fields are Full Name, Business Email, Project Type and Message. The browser provides inline validation and prevents duplicate sends while the request is in flight. The server validates lengths, email format, allowed project types, a honeypot field and a simple per-IP cooldown before sending the formatted HTML email. Server failures are logged server-side and presented to visitors as a generic retry message.

## Deployment

Vercel is the preferred deployment target because it serves the static site and `api/contact.js` together. Add the environment variables in the Vercel project settings, deploy, and test the form with a real inquiry. Configure `https://aegza.in/` and HTTPS later when the domain is purchased and DNS is ready.

## Brand asset

The official logo was not present in this workspace. Add the client-provided file as `assets/aegza-logo.png` and update the text wordmark in `index.html` after checking its aspect ratio and light/dark treatment. Do not replace it with a generated logo.

## Troubleshooting

- If `/api/contact` returns 503, check `RESEND_API_KEY`, `CONTACT_EMAIL`, and `FROM_EMAIL`.
- If Resend rejects the message, verify that `FROM_EMAIL` belongs to a verified sending domain.
- If the static page loads but forms do not submit, run through `npm run dev` rather than opening `index.html` directly.
- No analytics or cookie banner is installed. TODO: choose privacy-friendly analytics and add consent only when tracking is introduced.
- TODO: add `contact_form_started`, `contact_form_submitted`, `partnership_cta_clicked`, `whatsapp_clicked`, and `email_clicked` events only after an analytics/privacy decision.
- TODO: optionally add CRM, Slack, Google Sheets, or database lead logging after credentials and retention requirements are defined.

## Future improvements

Connect the official logo and favicon, finalize privacy and terms content, verify the sending domain, add a production rate limit at the hosting layer, and add analytics only after a privacy decision.
