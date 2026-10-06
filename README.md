# ঝামেলা নাই · Jhamela Nai

বাংলাদেশের জন্য বানানো বিনামূল্যের অনলাইন টুল — বাজেট, খরচের হিসাব, CV, ইনভয়েস,
ভ্রমণ ও পড়াশোনার পরিকল্পনা। সব হিসাব ব্রাউজারেই হয়, লগইন ছাড়াই ব্যবহার করা যায়।

**২৩টি টুল · ৫টি ক্যাটাগরি · বিজ্ঞাপন নেই · বাংলায়**

---

## কী আছে

| ক্যাটাগরি | টুল |
| --- | --- |
| 💰 টাকা ও হিসাব | বাজেট প্ল্যানার, খরচের হিসাব, সঞ্চয় ক্যালকুলেটর, লোন EMI ক্যালকুলেটর, লাভ-ক্ষতি ক্যালকুলেটর |
| 💼 চাকরি ও ক্যারিয়ার | CV বিল্ডার, কভার লেটার, চাকরির আবেদন লেখক, ইন্টারভিউ প্রশ্ন |
| 📄 ডকুমেন্ট | ইনভয়েস, রসিদ, কোটেশন, ইমেজ কম্প্রেসর, PDF মেকার |
| ✈️ পরিকল্পনা | ভ্রমণ বাজেট, ইভেন্ট পরিকল্পনা, স্থানান্তর চেকলিস্ট, শপিং তালিকা, টু-ডু |
| 🎓 শিক্ষার্থী | CGPA ক্যালকুলেটর, পড়ার পরিকল্পনা, পরীক্ষা কাউন্ডাউন, অ্যাসাইনমেন্ট পরিকল্পনা |

প্রতিটি টুল ইনস্টল ছাড়াই চলে, মোবাইল ও ডেস্কটপ দুটোতেই কাজ করে এবং ফলাফল PDF/CSV/
টেক্সট হিসাবে নামিয়ে নেওয়া যায়।

---

## স্ট্যাক

**ওয়েব (Next.js 16, App Router)**
- React 19 + TypeScript (strict), Tailwind CSS v4
- Radix UI, lucide-react, Recharts, react-hook-form + zod, sonner, next-themes
- `html2canvas` + `jsPDF` — বাংলা লেখাসহ PDF (ব্রাউজারের ফন্ট ব্যবহার করে)
- PWA: web app manifest, maskable আইকন, শর্টকাট

**API (Express 5)**
- Mongoose 8 (MongoDB), JWT (HTTP-only কুকি), bcryptjs
- zod ভ্যালিডেশন, helmet, CORS, rate limiting, morgan
- Gemini (ঐচ্ছিক) + নির্ধারিত কীওয়ার্ড ইঞ্জিন ফলব্যাক

---

## দ্রুত শুরু

```bash
npm install                 # ওয়েব ও API — দুটোই (npm workspaces)
# .env তৈরি আছে (JWT_SECRET জেনারেট করা) — শুধু MONGODB_URI দিন
# নতুন ক্লোনে হলে: cp .env.example .env
npm run dev:all             # ওয়েব :3000 + API :4000
npm run seed                # অ্যাডমিন ও ডেমো অ্যাকাউন্ট
```

ওয়েব অ্যাপ MongoDB ছাড়াই চলবে (অতিথি মোড) — শুধু অ্যাকাউন্ট, ক্লাউড সংরক্ষণ ও
অ্যাডমিন প্যানেলের জন্য API দরকার।

### কমান্ড

| কমান্ড | কাজ |
| --- | --- |
| `npm run dev` | শুধু ওয়েব |
| `npm run dev:api` | শুধু API |
| `npm run dev:all` | দুটো একসঙ্গে |
| `npm run build` | ওয়েব বিল্ড (প্রিরেন্ডার) |
| `npm run build:all` | API + ওয়েব বিল্ড |
| `npm run typecheck` | ওয়েব ও API টাইপচেক |
| `npm run lint` | ESLint |
| `npm run test:routes` | DB ছাড়া API রুট টেস্ট (smoke) |
| `npm run test:api` | MongoDB-সহ পূর্ণ API টেস্ট (auth, টুল স্টেট, ইভেন্ট) |
| `npm run test:e2e` | ব্রাউজার টেস্ট (Chrome) — `dev:all` + `seed` চালু থাকতে হবে |
| `npm run seed` | অ্যাডমিন + ডেমো ইউজার তৈরি |

---

## এনভায়রন্মেন্ট

.env গিট-ইগনোরড (`.env.example` কমিট করা টেমপ্লেট)। API রুট `.env` পড়ে, তাই
`server/.env` রাখলে সেটি আগে বাস্তবায়ন হয় — শেলের ভ্যারিয়েবল দুটোর উপরেই জেতে।
নতুন ক্লোনে `cp .env.example .env` করে নিচের ভ্যারিয়েবল পূরণ করুন:

| ভ্যারিয়েবল | বিবরণ |
| --- | --- |
| `MONGODB_URI` | MongoDB URI (Atlas বা লোকাল) — না দিলে API চালু হবে না। **এটিই একমাত্র আবশ্যক ভ্যারিয়েবল** |
| `JWT_SECRET` | কমপক্ষে ১৬ অক্ষর; জেনারেট: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` |
| `CLIENT_URL` | API-এর অনুমোদিত ওয়েব ঠিকানা (কমা দিয়ে একাধিক; কুকির জন্য হুবহু মিল লাগে — অন্য পোর্টে প্রিভিউ করলে যোগ করুন) |
| `NEXT_PUBLIC_API_URL` | ওয়েব থেকে API-এর ঠিকানা |
| `GEMINI_API_KEY` | ঐচ্ছিক — না দিলে সহায়ক deterministic ইঞ্জিন ব্যবহার করে |

---

## API

সব উত্তর একই আকারে: `{ success, data, message }`, ত্রুটি হলে `success: false` + `code`
+ প্রযোজ্য হলে `details`।

| মেথড | রাউট | কাজ |
| --- | --- | --- |
| `POST` | `/api/auth/register` | অ্যাকাউন্ট তৈরি (কুকি সেট হয়) |
| `POST` | `/api/auth/login` | লগইন |
| `POST` | `/api/auth/logout` | লগআউট |
| `GET` | `/api/auth/me` | চলতি ব্যবহারকারী (`user: null` মানে অতিথি) |
| `PATCH` | `/api/auth/me` | নাম/ভাষা আপডেট |
| `GET` | `/api/tools/:slug/state` | সংরক্ষিত অবস্থা (৪০৪ = নতুন ব্যবহারকারী) |
| `POST` | `/api/tools/:slug/state` | অবস্থা সংরক্ষণ (১২৮ KB সীমা) |
| `DELETE` | `/api/tools/:slug/state` | মুছে ফেলা |
| `GET` | `/api/tools/:slug/state/history` | সর্বশেষ ৮টি স্ন্যাপশট |
| `GET` | `/api/tools/states` | ড্যাশবোর্ডের তালিকা |
| `POST` | `/api/ai/assistant` | প্রশ্ন → টুলের slug + উত্তর |
| `POST` | `/api/analytics/events` | ইভেন্ট ব্যাচ (অজন্ট ও লগইন উভয়ই) |
| `GET` | `/api/analytics/summary` | ৩০ দিনের সারাংশ (শুধু admin) |
| `GET` | `/api/health` | স্বাস্থ্য পরীক্ষা |

`/api/ai/assistant` কখনো নতুন টুল বানিয়ে দেয় না — সে কেবল তালিকার একটি slug বেছে নেয়;
ওয়েব অ্যাপ সেই slug থেকে নিজের ক্যাটালগ থেকে সম্পূর্ণ টুল ডেফিনিশন তৈরি করে।

---

## গোপনীয়তা নীতি (সংক্ষেপে)

- অতিথি মোডে সব হিসাব `localStorage`-এ থাকে — সার্ভারে যায় না।
- লগইন করে ক্লাউডে সংরক্ষণ করলে অবস্থা শুধু আপনার অ্যাকাউন্টে জমা হয়।
- পাসওয়ার্ড bcrypt দিয়ে হ্যাশ করে রাখা হয়; HTTP-only কুকিতে শুধু JWT।
- ইমেজ কম্প্রেসর আপলোড করে না — কম্প্রেসিং পুরোপুরি ব্রাউজারে হয়।
- ব্যবহারের ইভেন্টে ব্যক্তিগত তথ্য নেই; ১৮০ দিন পর TTL দিয়ে মুছে যায়।

বিস্তারিত: `/privacy`

---

## ডিরেক্টরি

```
src/
  app/                রুট, টুল ও ক্যাটাগরি পেজ, auth, dashboard, admin, manifest/sitemap/robots
  components/         layout, home, tools ও ui (button, input, primitives, card, icons)
  features/
    auth/             AuthProvider, লগইন/রেজিস্টার ফর্ম
    tools/            ২৩টি টুল + tool-panel, save-button, shared document kit
    ai-assistant/     "কী চাই?" সহায়ক
    dashboard/        সংরক্ষিত কাজের তালিকা
    admin/            অ্যানালিটিক্স প্যানেল
  lib/                tools (ক্যাটালগ), api, export, analytics, bn, intent, use-tool-state, site
server/src/
  config/             env (zod), db (mongoose)
  models/             User, ToolState, AnalyticsEvent
  controllers/        auth, tool-state, analytics, ai
  routes/             /api রাউটার
  middlewares/        auth, validate, rate-limit, error
  services/           ai (Gemini + fallback), tool-index
  scripts/            seed, smoke (routes), integration (MongoDB-সহ)
scripts/
  e2e.mjs             ব্রাউজার এন্ড-টু-এন্ড স্যূট (npm run test:e2e)
```

---

## ডেভেলপমেন্ট নোট

- **নতুন টুল যোগ:** `src/lib/tools.ts`-এ ডেফিনিশন → `src/features/tools/<category>/`-এ
  উপাদান → `src/features/tools/tool-ui.tsx`-এ রেজিস্টার। পেজ, সাইটম্যাপ ও ক্যাটালগ
  ডিরেক্টরি নিজে থেকেই হবে।
- **সহায়কের নতুন টুল:** সার্ভারের `server/src/services/tool-index.ts`-এ একই slug-এর
  এন্ট্রি যোগ করতে হবে, নইলে deterministic ইঞ্জিন সেটিকে চিনতে পারবে না।
- **যাচাই:** কোনো পরিবর্তনের পর তিনটেই —
  `npm run typecheck && npm run lint && npm run build`,
  তারপর `npm run test:routes`, `npm run test:api` এবং (`dev:all` + `seed` চালু থাকা
  অবস্থায়) `npm run test:e2e`। ক্রম: ওয়েব বিল্ড → স্ট্যাটিক রুট → API → ব্রাউজার।

## লাইসেন্স

MIT