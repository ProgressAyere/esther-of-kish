# Esther of Kish

E-commerce storefront for Esther of Kish, a handcrafted bead jewellery brand. The shop sells necklaces, bracelets, earrings, rings and sets for both women and men.

---

## Project Structure

```
esther-of-kish/
├── frontend/          # Next.js storefront
│   ├── src/
│   │   ├── app/               # App Router pages & global styles
│   │   │   ├── page.js        # Home page
│   │   │   ├── layout.js      # Root layout (fonts, header)
│   │   │   ├── globals.css
│   │   │   └── shop/
│   │   │       ├── page.js    # Shop landing
│   │   │       ├── women/page.js
│   │   │       └── men/page.js
│   │   ├── components/
│   │   │   ├── layout/site-header/
│   │   │   ├── sections/home/ # BeadHero, FeaturedStack
│   │   │   └── shop/          # ProductCard, ProductModal, ShopCatalog
│   │   └── lib/
│   │       ├── products.js    # Full product catalog & helpers
│   │       ├── cart.js        # Cart state
│   │       └── intro-events.js
│   ├── public/                # Static assets (SVG beads, product images)
│   ├── next.config.mjs
│   └── package.json
├── backend/           # Express API
│   ├── src/index.js
│   └── package.json
└── README.md
```

---

## Tech Stack

| Layer    | Technology                              |
| -------- | --------------------------------------- |
| Frontend | Next.js 16.4.3, React 19, Tailwind v4  |
| Fonts    | Geist Sans, Geist Mono, Playfair Display (via `next/font`) |
| Animation | GSAP 3                                 |
| Backend  | Node.js, Express 4                      |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on [http://localhost:3000](http://localhost:3000)

### Backend

```bash
cd backend
npm install
npm run dev
```

Runs on [http://localhost:5000](http://localhost:5000)

---

## Product Catalog

The full catalog lives in `frontend/src/lib/products.js`. It covers:

- **Women:** necklaces, bracelets, earrings, rings, sets
- **Men:** necklaces, bracelets, earrings, rings, sets

Each product has a slug, SKU, price (₦), colour options, size options with a size guide, bead specs, a story, and care instructions.

> **Before launch:** confirm all prices, materials and sizes with Esther. Product copy and specs in `products.js` are placeholder drafts.

### Adding products

1. Drop product images into the relevant folder under `public/` (e.g. `public/necklaces/`).
2. Add a new `make({...})` entry in the appropriate section of `PRODUCTS` in `products.js`.
3. Update the `images` array on the entry to reference your new image paths.

### Currency

The currency symbol is set in one place at the top of `products.js`:

```js
export const CURRENCY = "₦"; // change to "$" etc.
```

---

## Deployment

The frontend is configured for deployment on Vercel. A `vercel.json` at the repo root points Vercel at the `frontend/` subdirectory.

```bash
# From the repo root, or connect the repo on vercel.com
vercel
```

Alternatively, set the **Root Directory** to `frontend` in the Vercel project settings and remove the custom `buildCommand` from `vercel.json`.

The backend is a plain Express server and can be deployed to any Node.js host (Railway, Render, Fly.io, etc.).

---

## Environment Variables

Neither service ships with a `.env` file. Create one in each directory as needed:

```
frontend/.env.local
backend/.env
```

Both `.gitignore` files exclude all `.env*` files.
