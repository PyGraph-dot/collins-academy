# 🏗️ Structural & Performance Audit — Collins Academy

**Auditor:** Principal Software Architect  
**Date:** 2026-02-11  
**Scope:** Full codebase deep scan — Anti-Patterns, Performance Bottlenecks, Architectural Flaws  
**Stack:** Next.js 16 (App Router), React 19, MongoDB/Mongoose, Zustand, Tailwind CSS, Paystack

---

## Executive Summary

The Collins Academy codebase is functional but has **7 Critical** and **8 Moderate** architectural issues that will degrade performance, SEO, and maintainability at scale. The most impactful problems are:

1. **Every page is a Client Component** — destroying SEO and inflating bundle size
2. **Waterfall data fetching** via `useEffect` — causing loading spinners instead of instant content
3. **Duplicate API calls** — the same `/api/products` endpoint is hit from 3 different components independently
4. **Missing database indexes** — admin dashboard will crawl at 10K+ orders
5. **Zero error boundaries** — any fetch failure = white screen
6. **Hardcoded magic strings** everywhere — currencies, exchange rates, API URLs
7. **Duplicate code** — two identical success pages, `handleDownload` copied 3 times

---

## Strata 1: Next.js & React Architecture

### 🔴 CRITICAL-01: Liberal `"use client"` — Every Page is a Client Component

**The Bottleneck:**  
Every single page (`app/page.tsx`, `app/shop/page.tsx`, `app/library/page.tsx`, `app/success/page.tsx`) starts with `"use client"`. This means:
- **Zero SEO** for the shop page — Google's crawler sees a loading spinner, not product data
- **Larger JavaScript bundle** — all component code ships to the browser
- **No streaming/Suspense** — the user waits for the full JS to download, parse, and execute before seeing anything

**Files Affected:**
- `app/page.tsx:1` — `"use client"` for the homepage
- `app/shop/page.tsx:1` — `"use client"` for the shop
- `app/library/page.tsx:1` — `"use client"` for the library

**The Architect's Solution:**  
Apply the **"Server Component by Default, Client Island"** pattern. The page itself should be a Server Component that fetches data on the server. Only the interactive parts (cart button, animations) should be Client Components.

**Refactored `app/shop/page.tsx`:**

```tsx
// app/shop/page.tsx — NO "use client" directive = Server Component
import { Metadata } from "next";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import ShopHero from "@/components/shop/ShopHero";       // Client — has framer-motion
import ProductGrid from "@/components/shop/ProductGrid"; // Client — has cart interaction
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "Shop | The Collins Academy",
  description: "Curated resources designed to dismantle poor communication habits.",
};

// Data fetched on the SERVER — no loading spinner, instant content, full SEO
async function getProducts() {
  await connectDB();
  const products = await Product.find({ isPublished: true })
    .sort({ createdAt: -1 })
    .lean(); // .lean() returns plain objects, ~5x faster than Mongoose docs
  
  // Serialize MongoDB ObjectIds to strings for client components
  return JSON.parse(JSON.stringify(products));
}

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Header />
      <ShopHero />
      <section className="container mx-auto px-4 md:px-6 pb-32">
        <ProductGrid products={products} />
      </section>
    </main>
  );
}
```

```tsx
// components/shop/ProductGrid.tsx — Client Island
"use client";

import { motion } from "framer-motion";
import Book3D from "@/components/ui/Book3D";
import { useCart } from "@/store/cart";
import type { ProductType } from "@/lib/types";

interface Props {
  products: ProductType[];
}

export default function ProductGrid({ products }: Props) {
  const { addItem, currency } = useCart();

  if (products.length === 0) {
    return (
      <div className="col-span-full text-center py-20 border border-dashed border-border rounded-xl text-muted-foreground">
        No products found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-8">
      {products.map((book, i) => (
        <motion.div
          key={book._id}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.05 }}
        >
          <Book3D book={book} addItem={addItem} currency={currency} />
        </motion.div>
      ))}
    </div>
  );
}
```

**Impact:** SEO goes from 0 to 100 for the shop page. LCP improves dramatically. Bundle size decreases.

---

### 🔴 CRITICAL-02: Waterfall Data Fetching via `useEffect`

**The Bottleneck:**  
Currently, the data flow is:

```
Browser requests page → Downloads JS bundle → React hydrates → useEffect fires → 
fetch('/api/products') → API route connects to MongoDB → Returns JSON → setState → Re-render
```

That's **6 sequential steps** before the user sees a product. With Server Components, it becomes:

```
Browser requests page → Server fetches from MongoDB → Streams HTML with data → Done
```

**Files Affected:**
- `app/shop/page.tsx:15-28` — `useEffect` fetch for products
- `components/home/Library.tsx:16-32` — `useEffect` fetch for products (DUPLICATE!)
- `components/home/Hero.tsx:32-45` — `useEffect` fetch for daily content

**The Architect's Solution:**  
For `app/shop/page.tsx` — already shown above (Server Component fetch).

For `components/home/Library.tsx` — the homepage should also be a Server Component that passes products down:

```tsx
// app/page.tsx — Server Component
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import DailyDrop from "@/models/DailyDrop";
import HomeClient from "@/components/home/HomeClient";

async function getHomeData() {
  await connectDB();
  const [products, dailyDrop] = await Promise.all([
    Product.find({ isPublished: true }).sort({ createdAt: -1 }).limit(3).lean(),
    DailyDrop.findOne().sort({ createdAt: -1 }).lean(),
  ]);
  return {
    products: JSON.parse(JSON.stringify(products)),
    dailyDrop: dailyDrop ? JSON.parse(JSON.stringify(dailyDrop)) : null,
  };
}

export default async function Home() {
  const { products, dailyDrop } = await getHomeData();

  return <HomeClient products={products} dailyDrop={dailyDrop} />;
}
```

**Impact:** Eliminates 3 separate API round-trips. Homepage loads with data pre-rendered. The `/api/products` endpoint is no longer hit by the homepage or shop page at all — only by the admin.

---

### 🔴 CRITICAL-03: Duplicate `/api/products` Calls

**The Bottleneck:**  
The same `/api/products` endpoint is called from **3 independent locations**:

| Location | File | What it fetches |
|---|---|---|
| Homepage Library section | `components/home/Library.tsx:19` | All products, then `.slice(0, 3)` |
| Shop page | `app/shop/page.tsx:18` | All products |
| Admin dashboard | `app/admin/page.tsx:43` | All products |

The homepage fetches ALL products just to show 3. This wastes bandwidth and DB resources.

**The Architect's Solution:**  
- Homepage and Shop: Move to Server Component fetching (shown above). Homepage uses `.limit(3)`.
- Admin: Keep client-side fetch (it's behind auth, not SEO-critical).
- Add `revalidate` caching so the product list is cached for 60 seconds:

```tsx
// In the Server Component
export const revalidate = 60; // ISR: revalidate every 60 seconds
```

---

### 🟡 MODERATE-04: CartDrawer Re-render Analysis

**The Bottleneck:**  
In `components/shop/CartDrawer.tsx:10`, the component destructures the entire store:

```tsx
const { items, isOpen, toggleCart, removeItem, currency, setCurrency, clearCart } = useCart();
```

Zustand v5 with the default equality check will re-render `CartDrawer` whenever **any** of these values change — including `currency` changes triggered from the currency toggle inside the drawer itself. However, since `CartDrawer` is wrapped in `AnimatePresence` and only renders when `isOpen` is true, the practical impact is limited.

**The Architect's Solution:**  
This is acceptable for now. If performance profiling shows issues, use Zustand selectors:

```tsx
const items = useCart((s) => s.items);
const isOpen = useCart((s) => s.isOpen);
// etc.
```

But the bigger win is that `totalAmount` is recalculated on every render (line 14-17) when it could be a derived selector in the store. The `total()` function already exists in the store but isn't used here.

```tsx
// Instead of recalculating in the component:
const totalAmount = items.reduce((acc, item) => { ... }, 0);

// Use the store's total():
const totalAmount = useCart((s) => s.total());
```

---

### 🟡 MODERATE-05: Duplicate Header Rendering

**The Bottleneck:**  
`Header` is rendered in `app/layout.tsx:32` (globally) AND again inside individual pages:
- `app/shop/page.tsx:8` imports and renders `<Header />`
- `app/library/page.tsx:7` imports and renders `<Header />`
- `app/success/page.tsx:8` imports and renders `<Header />`

This means the Header is rendered **twice** on every page.

**The Architect's Solution:**  
Remove `<Header />` from all individual page files. It's already in the root layout. The layout already handles hiding it for admin/login routes.

---

## Strata 2: Database & Schema Design

### 🟢 GOOD: MongoDB Connection Caching

`lib/db.ts` correctly implements the global caching pattern for Next.js hot-reloading. The `maxPoolSize: 10` is appropriate. The error recovery (resetting `cached.promise` on failure) is correct. **No changes needed.**

One minor improvement: remove the `console.log` statements in production:

```tsx
if (process.env.NODE_ENV === 'development') {
  console.log("🟡 Connecting to MongoDB...");
}
```

### 🔴 CRITICAL-06: Missing Database Indexes

**The Bottleneck:**  
The `Order` model has `unique: true` on `transactionId` (which creates an index), but the following queries will do **full collection scans** at scale:

| Query | File | Missing Index |
|---|---|---|
| `Order.find({ customerEmail: regex, status: "success" })` | `app/api/library/route.ts:24` | `customerEmail` + `status` compound index |
| `Order.countDocuments({ status: "success" })` | `app/api/admin/stats/route.ts:11` | `status` index |
| `Order.aggregate([{ $match: { status: "success" } }])` | `app/api/admin/stats/route.ts:16` | `status` index |
| `Product.find({ isPublished: true })` | `app/api/products/route.ts:19` | `isPublished` index |

At 10,000 orders, the library lookup and admin stats will become noticeably slow.

**The Architect's Solution:**  
Add indexes to `models/Order.ts`:

```tsx
// models/Order.ts — Add after the schema definition, before model creation
OrderSchema.index({ customerEmail: 1, status: 1 }); // Compound index for library lookups
OrderSchema.index({ status: 1 });                     // For admin stats aggregation
OrderSchema.index({ createdAt: -1 });                 // For sorting by date
```

Add index to `models/Product.ts`:

```tsx
ProductSchema.index({ isPublished: 1, createdAt: -1 }); // For shop page query
```

---

### 🟡 MODERATE-07: Library API Uses Regex for Exact Email Match

**The Bottleneck:**  
In `app/api/library/route.ts:22-25`, the code builds a regex for email matching:

```tsx
const safeEmailRegex = new RegExp(`^${escapeRegExp(email)}$`, 'i');
const orders = await Order.find({ customerEmail: { $regex: safeEmailRegex } });
```

While the regex is sanitized (good security), using `$regex` **prevents MongoDB from using an index** efficiently. For a case-insensitive exact match, a better approach exists.

**The Architect's Solution:**  
Use MongoDB's collation for case-insensitive matching, which CAN use indexes:

```tsx
const orders = await Order.find({ 
  customerEmail: email,
  status: "success" 
})
.collation({ locale: 'en', strength: 2 }) // Case-insensitive comparison
.sort({ createdAt: -1 })
.populate({ ... });
```

Or normalize emails to lowercase on write (in the payment verify route) and query with `.toLowerCase()`.

---

## Strata 3: UX & Error Handling

### 🔴 CRITICAL-08: No Error Boundaries — White Screen on Failure

**The Bottleneck:**  
If `fetchProducts` fails in the current `ShopPage`, the `catch` block only does `console.error("Failed to fetch products")`. The user sees:
- `loading` becomes `false`
- `products` remains `[]`
- The "No products found" empty state renders

This is actually not a white screen — it's a **misleading empty state**. The user thinks there are no products when really the API is down. There's no retry mechanism.

For the Server Component approach, if the DB query throws, Next.js will show its default error page (or a white screen if no `error.tsx` exists).

**The Architect's Solution:**  
Add `error.tsx` and `loading.tsx` files for key routes:

```tsx
// app/shop/error.tsx
"use client";

export default function ShopError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-serif text-foreground mb-4">Something went wrong</h2>
        <p className="text-muted-foreground mb-8 text-sm">
          We couldn't load the shop. Please try again.
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-gold text-black font-bold rounded-lg hover:bg-foreground hover:text-background transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
```

```tsx
// app/shop/loading.tsx
import { Loader2 } from "lucide-react";

export default function ShopLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="animate-spin text-gold" size={40} />
    </div>
  );
}
```

---

### 🟡 MODERATE-09: No `loading.tsx` Files — Manual Loading State Everywhere

**The Bottleneck:**  
Every page manually manages `const [loading, setLoading] = useState(true)`. With Server Components, Next.js `loading.tsx` files provide **instant loading UI via Suspense** — the shell renders immediately while data streams in.

**Files Affected:**
- `app/shop/page.tsx:12` — manual loading state
- `app/library/page.tsx:11` — manual loading state
- `app/admin/page.tsx:29` — manual loading state
- `components/home/Library.tsx:14` — manual loading state

**The Architect's Solution:**  
After converting to Server Components, add `loading.tsx` files for `/shop`, `/library`, and `/admin`. The manual `useState(loading)` pattern is eliminated entirely for the shop and homepage.

For `app/library/page.tsx` — this page is user-action-driven (search by email), so it correctly stays as a Client Component. The manual loading state is appropriate here.

---

## Strata 4: Code Quality & Maintainability

### 🔴 CRITICAL-10: Magic Strings & Hardcoded Values

**The Bottleneck:**  
Currency codes, exchange rates, and API endpoints are scattered across the codebase:

| Magic Value | Locations |
|---|---|
| `"NGN"`, `"USD"` | `store/cart.ts:15`, `models/Order.ts:16`, `app/api/checkout/route.ts:10-11`, `app/api/payment/verify/route.ts:83`, `app/api/admin/stats/route.ts:32` |
| `1700` (exchange rate) | `app/api/checkout/route.ts:8`, `app/api/admin/stats/route.ts:32` |
| `"pending"`, `"success"`, `"failed"` | `models/Order.ts:19`, `app/api/library/route.ts:26`, `app/api/admin/stats/route.ts:13` |
| `100` (Paystack flat fee) | `app/api/checkout/route.ts:25` |
| `0.015` (Paystack percent fee) | `app/api/checkout/route.ts:26` |

If you change the exchange rate, you must find and update it in 2 files. If you add a new currency, you must hunt through 5+ files.

**The Architect's Solution:**  
Create a centralized config:

```tsx
// lib/constants.ts

export const CURRENCIES = {
  NGN: "NGN",
  USD: "USD",
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;

export const EXCHANGE_RATES: Record<CurrencyCode, number> = {
  NGN: 1,
  USD: 1700,
};

export const ORDER_STATUS = {
  PENDING: "pending",
  SUCCESS: "success",
  FAILED: "failed",
} as const;

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

export const PAYSTACK = {
  FLAT_FEE_KOBO: 100,
  PERCENT_FEE: 0.015,
  FREE_FEE_THRESHOLD: 2500,
} as const;

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  NGN: "₦",
  USD: "$",
};
```

---

### 🟡 MODERATE-11: Type Duplication — No Shared Types

**The Bottleneck:**  
The `Product` interface is defined differently in multiple places:

| Location | Definition |
|---|---|
| `store/cart.ts:4-11` | `CartItem` with `_id, title, priceNGN, priceUSD, image, fileUrl` |
| `app/admin/page.tsx:9-18` | `Product` with `_id, title, priceNGN, priceUSD, image, category, isPublished, fileUrl` |
| `components/ui/Book3D.tsx:8-12` | `BookProps` with `book: any` — **no type safety at all** |
| `app/success/page.tsx:11-17` | `OrderItem` inline interface |

The `any` type in `Book3D.tsx:9` means TypeScript provides zero protection against passing wrong props.

**The Architect's Solution:**  
Create a shared types file:

```tsx
// lib/types.ts

export interface ProductType {
  _id: string;
  title: string;
  description: string;
  priceNGN: number;
  priceUSD: number;
  image: string;
  category: string;
  fileUrl?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

// CartItem is a subset of ProductType
export type CartItemType = Pick<ProductType, '_id' | 'title' | 'priceNGN' | 'priceUSD' | 'image' | 'fileUrl'>;

export interface OrderType {
  _id: string;
  customerEmail: string;
  customerName: string;
  items: OrderItemType[];
  totalAmount: number;
  currency: CurrencyCode;
  exchangeRate: number;
  status: OrderStatus;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItemType {
  productId: string | { image?: string; fileUrl?: string };
  title: string;
  price: number;
  quantity: number;
}

// Re-export from constants
export type { CurrencyCode, OrderStatus } from "./constants";
```

---

### 🟡 MODERATE-12: Duplicate Success Pages

**The Bottleneck:**  
There are TWO success pages with nearly identical logic:
- `app/success/page.tsx` (180 lines)
- `app/checkout/success/page.tsx` (147 lines)

Both verify payment via the same API, both have the same `handleDownload` function, both clear the cart. This violates DRY and means bug fixes must be applied twice.

**The Architect's Solution:**  
Delete `app/checkout/success/page.tsx` and redirect `/checkout/success` to `/success`. Or consolidate into a single shared component.

---

### 🟡 MODERATE-13: `handleDownload` Duplicated 3 Times

**The Bottleneck:**  
The exact same download function appears in:
- `app/library/page.tsx:37-55`
- `app/success/page.tsx:59-77`
- `app/checkout/success/page.tsx:43-61`

**The Architect's Solution:**  
Extract to a utility:

```tsx
// lib/utils.ts
export async function downloadFile(url: string, filename: string): Promise<void> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `${filename}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch {
    window.open(url, "_blank");
  }
}
```

---

### 🟡 MODERATE-14: Dead/Stub Code

**The Bottleneck:**  
- `app/api/verify-order/route.ts` — This is a **stub** with TODO comments and no real logic. It duplicates what `app/api/payment/verify/route.ts` already does properly.
- `app/api/seed/route.ts` — Likely a development-only seed route that should not exist in production.
- `LeadMagnet.tsx:14` — `setTimeout(() => setStatus("success"), 1500)` — The email form is a fake simulation, not connected to any backend.

**The Architect's Solution:**  
- Delete `app/api/verify-order/route.ts`
- Gate `app/api/seed/route.ts` behind `NODE_ENV === 'development'` check
- Either connect `LeadMagnet` to a real email service (Resend, Mailchimp) or add a comment marking it as a placeholder

---

### 🟡 MODERATE-15: API Route Exposes Error Details in Production

**The Bottleneck:**  
In `app/api/products/route.ts:26-29`:

```tsx
return NextResponse.json(
  { error: "Database Connection Failed", details: error.message }, 
  { status: 500 }
);
```

Exposing `error.message` in production can leak internal details (MongoDB connection strings, schema info, etc.).

**The Architect's Solution:**  
Only expose details in development:

```tsx
return NextResponse.json(
  { 
    error: "Database Connection Failed", 
    ...(process.env.NODE_ENV === 'development' && { details: error.message })
  }, 
  { status: 500 }
);
```

---

## Architecture Diagram

```mermaid
graph TB
    subgraph Current Architecture - Anti-Pattern
        Browser1[Browser] -->|1. Download JS| Page1[Client Component - use client]
        Page1 -->|2. useEffect| API1[/api/products]
        API1 -->|3. connectDB| DB1[(MongoDB)]
        DB1 -->|4. JSON| API1
        API1 -->|5. Response| Page1
        Page1 -->|6. setState + render| UI1[User sees products]
    end

    subgraph Proposed Architecture - Server Components
        Browser2[Browser] -->|1. Request| Page2[Server Component]
        Page2 -->|2. Direct DB call| DB2[(MongoDB)]
        DB2 -->|3. Data| Page2
        Page2 -->|4. Stream HTML with data| Browser2
        Browser2 -->|5. Hydrate interactive islands| Islands[Client Islands: Cart + Animations]
    end

    style Current Architecture - Anti-Pattern fill:#1a0000,stroke:#ff4444
    style Proposed Architecture - Server Components fill:#001a00,stroke:#44ff44
```

---

## Priority Implementation Order

| Priority | Issue | Impact | Complexity |
|---|---|---|---|
| P0 | CRITICAL-01 + CRITICAL-02: Convert Shop to Server Component | SEO + LCP | Medium |
| P0 | CRITICAL-06: Add database indexes | Admin perf at scale | Low |
| P1 | CRITICAL-03: Deduplicate product fetching on homepage | Fewer API calls | Medium |
| P1 | CRITICAL-08: Add error.tsx and loading.tsx | UX resilience | Low |
| P1 | CRITICAL-10: Create constants file | Maintainability | Low |
| P2 | MODERATE-05: Remove duplicate Header renders | Clean architecture | Low |
| P2 | MODERATE-11: Create shared types file | Type safety | Low |
| P2 | MODERATE-12: Consolidate success pages | DRY | Medium |
| P2 | MODERATE-13: Extract handleDownload utility | DRY | Low |
| P2 | MODERATE-14: Remove dead code | Clean codebase | Low |
| P2 | MODERATE-15: Hide error details in production | Security | Low |
| P3 | MODERATE-04: Zustand selector optimization | Micro-optimization | Low |
| P3 | MODERATE-07: Replace regex with collation | DB efficiency | Low |
| P3 | MODERATE-09: Add loading.tsx files | UX polish | Low |

---

## Files to Create

| File | Purpose |
|---|---|
| `lib/constants.ts` | Centralized magic strings and config values |
| `lib/types.ts` | Shared TypeScript interfaces for Product, Order, Cart |
| `lib/utils.ts` | Shared utility functions like downloadFile |
| `app/shop/error.tsx` | Error boundary for shop page |
| `app/shop/loading.tsx` | Loading skeleton for shop page |
| `components/shop/ProductGrid.tsx` | Client island for product grid with cart interaction |
| `components/shop/ShopHero.tsx` | Client island for animated hero section |

## Files to Modify

| File | Changes |
|---|---|
| `app/shop/page.tsx` | Convert to Server Component, direct DB fetch |
| `app/page.tsx` | Convert to Server Component, pass data as props |
| `components/home/Hero.tsx` | Accept dailyDrop as prop instead of fetching |
| `components/home/Library.tsx` | Accept products as prop instead of fetching |
| `components/ui/Book3D.tsx` | Replace `any` types with shared ProductType |
| `models/Order.ts` | Add compound indexes |
| `models/Product.ts` | Add index on isPublished |
| `app/api/products/route.ts` | Hide error details in production |
| `store/cart.ts` | Use shared CartItemType from lib/types |

## Files to Delete

| File | Reason |
|---|---|
| `app/api/verify-order/route.ts` | Dead stub code, duplicates payment/verify |
| `app/checkout/success/page.tsx` | Duplicate of app/success/page.tsx |
