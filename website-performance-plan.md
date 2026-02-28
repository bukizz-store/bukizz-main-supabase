# Website Performance Plan
**Goal:** Optimize website loading time by eliminating render-blocking resources, reducing initial JavaScript payload size, and implementing modern performance best practices according to `.agent/skills/nextjs-react-expert/SKILL.md` (Vercel Engineering guidelines).

## Proposed Changes

### 1. Route-Level Code Splitting (CRITICAL)
**Impact:** Drastically reduces the initial JS bundle size by loading pages only when visited.
**File:** `src/App.jsx`
- Replace static route component imports with `React.lazy()` for all pages (e.g., `HomePage`, `SchoolViewPage`, `CartPage`, `CheckoutPage`, etc.).
- Wrap the `<Routes>` block with a `<Suspense>` component, using the existing loading UI (spinner) as the `fallback`.

### 2. Render-Blocking Resource Optimization (HIGH)
**Impact:** Unblocks the main thread during initial HTML parsing, accelerating First Contentful Paint (FCP).
**File:** `public/index.html`
- Add the `defer` or `async` attribute to the Razorpay checkout script `<script src="https://checkout.razorpay.com/v1/checkout.js"></script>` to prevent it from blocking the initial page paint.
- Add resource hints: `<link rel="preconnect" href="https://fonts.googleapis.com" />` and `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />` before the Google Fonts stylesheet to accelerate DNS and TLS handshake.

### 3. Image Optimization (MEDIUM)
**Impact:** Saves bandwidth and improves performance by not loading off-screen images immediately.
**File:** `src/App.jsx`
- Add `loading="lazy"` and `decoding="async"` to the `/footer_back.svg` background image since it is permanently located below the fold.

## Verification Plan

### Automated Tests
- Run `python .agent/skills/performance-profiling/scripts/lighthouse_audit.py http://localhost:3000` after changes to measure the performance score improvement.

### Manual Verification
1. Start the development server (`npm start`) and navigate through the app.
2. Open Browser DevTools -> Network Tab (filter by JS) and confirm that JS bundles are split into multiple smaller chunks (navigating to another page should trigger a new chunk download).
3. Ensure the loading spinner appears briefly when navigating to a new route for the first time.
4. Go to Checkout and verify that the Razorpay integration still functions correctly after deferring its script.
