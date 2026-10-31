# 🛍️ Forever — Storefront

Customer storefront for **Forever**, a multi-vendor e-commerce platform. Built with **Next.js 15 (App Router)**, React 19 and Tailwind CSS v4. Buyers can browse the catalog, pick product variants, check out with Razorpay or Cash on Delivery, track their orders and leave reviews.

![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Razorpay](https://img.shields.io/badge/Razorpay-0C2451?style=for-the-badge&logo=razorpay&logoColor=white)

> Part of the Forever platform: **forever-backend** (API) · **forever-frontend** (this repo) · **forever-admin** (admin & seller panel)
>
> Needs a running **forever-backend** API.

---

## 🚀 Features

- Register / login with JWT and optional TOTP two-factor authentication
- Home, collection (search and filters), product detail, about and contact pages
- Product variants with per-variant pricing and images
- Cart, checkout and coupon codes (e.g. `FIRST` — free delivery on the first order)
- Razorpay online payments and Cash on Delivery
- Order history and profile management
- Product reviews and ratings
- Newsletter subscription

---

## 🧑‍💻 Tech Stack

Next.js 15 (App Router), React 19, Tailwind CSS v4, Axios, React Toastify.

Design tokens (colours, type, spacing) live in [src/tokens/](src/tokens/) and are shared in style with the admin panel.

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` and fill it in — `.env` is git-ignored.

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_BACKEND_URL` | yes (build) | Base URL of the Forever API |
| `NEXT_PUBLIC_ADMIN_URL` | yes (build) | Admin panel URL for cross-links |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | for online payments | Razorpay public key ID |

`NEXT_PUBLIC_*` values are inlined at build time; `npm run build` fails fast if the required ones are missing.

---

## ▶️ Run Locally

Requires **Node.js 20+**.

```bash
git clone https://github.com/anshgangwar786/forever-frontend.git
cd forever-frontend
cp .env.example .env   # then edit values
npm install
npm run dev            # http://localhost:5173
```

### Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Dev server on port 5173 |
| `npm run build` | Production build |
| `npm start` | Production server on port 5173 |
| `npm run lint` | Lint with Next.js ESLint config |

---

## 🚢 Deployment

Deployed on **Vercel**. Set the `NEXT_PUBLIC_*` variables in the Vercel project's build environment. Make sure the deployed storefront origin is in the backend's `FRONTEND_URL` so CORS allows it.

---

## 👨‍💻 Author

**Ansh Gangwar** — Full-Stack Developer

🔗 GitHub: https://github.com/anshgangwar786<br>
🔗 LinkedIn: https://www.linkedin.com/in/ansh-gangwar/
