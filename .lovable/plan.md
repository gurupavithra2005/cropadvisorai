# Smart Crop Advisory System — Phased Build Plan

The feature list you shared is huge (30+ modules). Trying to ship all of it in one go would produce a shallow, buggy app. I'll build it in **3 phases**, starting with a solid MVP you can actually use, then layering the advanced features on top.

## Platform constraints (important)

Lovable runs **React + Vite + Tailwind + Lovable Cloud** (Postgres, Auth, Storage, Edge Functions, AI Gateway). That means:

- Custom TensorFlow/PyTorch CNNs, Flutter, Node/Express servers — not possible here. I'll use the **Lovable AI Gateway** (Gemini vision + text) for crop recommendations, fertilizer advice, and pest/disease detection from photos. This is genuinely powerful and requires zero ML setup.
- **Voice**: browser Web Speech API for STT/TTS in v1 (free, works for Hindi/Tamil/English on most Android devices). Indic-TTS/Whisper can be added later via edge function if quality isn't enough.
- **Weather**: OpenWeatherMap free tier via edge function (I'll ask you for the API key when we get there — free to obtain).
- **Market prices**: data.gov.in Agmarknet API (free with a key from data.gov.in).

## Phase 1 — MVP (this build)

### Auth & Profile
- Phone/email signup via Lovable Cloud auth
- Farmer profile: name, village, district, state, preferred language, land size, irrigation type (borewell/canal/rainfed), land type (Dry/Wet/Garden)
- Auto-detect GPS location (browser geolocation) with manual fallback

### Language & Voice
- Language selector: **English, Hindi, Tamil** (i18n JSON dictionaries)
- Voice input button (Web Speech API STT) and "read aloud" button (TTS) on every advisory screen

### Dashboard (mobile-first, large icons)
Bottom nav with 6 sections:
1. **Home** — weather summary, today's alerts, quick actions
2. **Crops** — AI crop recommendation wizard (soil NPK + pH + season + land type → LLM returns ranked crops with reasoning)
3. **Fertilizer** — enter soil test values, get NPK dosage recommendation from AI
4. **Pest Scan** — upload/capture leaf photo → Gemini vision identifies pest/disease + treatment
5. **Weather** — 5-day forecast + severe-weather alerts (OpenWeatherMap)
6. **Market** — daily mandi prices for selected crops (Agmarknet)

### Advisory Chatbot
- Floating chat button, opens LLM-powered assistant grounded on farmer's profile + location
- Supports text and voice input, TTS for responses

### Design direction
- Earthy, high-contrast palette (deep green, terracotta, cream) tuned for outdoor sunlight readability
- Extra-large tap targets, icon-first navigation, minimal text
- PWA-installable, works offline for cached advisories and last-fetched weather/prices

## Phase 2 (next iteration, after MVP works)
- Crop calendar with sowing/fertilizer/harvest reminders
- Soil test history (upload PDF/photo, OCR via AI)
- Field mapping (draw boundaries on Leaflet map, area auto-calc)
- Government scheme alerts feed
- Community forum (posts, comments, upvotes)
- Feedback loop on advisories

## Phase 3 (advanced)
- Smart irrigation advisor (weather + soil moisture)
- Crop growth photo tracking with yield estimation
- Input marketplace (seed/fertilizer/equipment listings)
- Disaster risk alerts (flood/drought/cyclone from IMD feeds)
- Farmer analytics dashboard (cost/yield/profit)
- Additional languages (Telugu, Kannada, Bengali, Punjabi)
- Optional: satellite NDVI via Sentinel Hub, drone image upload

## Technical details (for reference)

**Stack**: React + Vite + TypeScript, Tailwind, shadcn/ui, react-router, TanStack Query, react-i18next, Lovable Cloud (Postgres + Auth + Storage), Lovable AI Gateway (google/gemini-2.5-flash for text & vision).

**Database tables** (Phase 1): `profiles`, `user_roles` (farmer/officer/admin enum, separate table for security), `soil_reports`, `pest_scans`, `advisories`, `saved_crops`, `market_watchlist`. All with RLS policies scoped to `auth.uid()`.

**Edge functions**: `weather-fetch`, `market-prices`, `crop-recommend`, `fertilizer-advise`, `pest-detect`, `chat-advisor`.

**Secrets needed** (I'll prompt when ready): `OPENWEATHER_API_KEY`, `DATA_GOV_IN_API_KEY`. `LOVABLE_API_KEY` is auto-provisioned.

**Deferred** (cannot run in Lovable): custom-trained TensorFlow CNNs, blockchain traceability, drone image processing pipelines, native Flutter/React Native apps. The PWA covers mobile install; native wrappers can come later via Capacitor if needed.

---

Approve this plan and I'll build Phase 1. If you want a different starting scope (e.g. skip voice, add community forum to Phase 1, drop languages, etc.), tell me what to change.
