# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

MMIS (Multi-Vendor Management Information System) is a Next.js 16 + React 19 ERP platform for managing multi-vendor commerce hubs in Uganda. It combines modern web technologies with AI-powered features (Google Gemini) for market management, vendor operations, supply chain logistics, and financial tracking.

**Tech Stack:** Next.js 16, React 19, TypeScript (strict mode), Tailwind CSS, shadcn/ui, Zod, Google GenAI SDK, pnpm

## Common Development Commands

### Setup & Development
```powershell
# Install dependencies (uses pnpm)
pnpm install

# Start development server (Next.js dev server on port 3000)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint
```

### Environment Setup
The project requires a `.env.local` file at the root with:
- `BACKEND_API_URL` - Backend Express API endpoint
- `INTERNAL_AUTH_KEY` - Secret for BFF-to-Backend communication
- `JWT_SECRET` / `JWT_REFRESH_SECRET` - JWT signing keys
- Google Gemini API key for AI features
- Mobile Money (MTN/Airtel) credentials for payments
- NIRA API credentials for KYC verification

Reference `src/.env` for the complete list of required environment variables.

## Architecture Overview

### BFF (Backend-for-Frontend) Pattern
This is a **dual-codebase architecture**:
- **Frontend:** Next.js 16 application (this repo) - handles UI, routing, and proxying
- **Backend:** Separate Express.js + PostgreSQL API (not in this repo) - handles business logic, auth, and database

The Next.js app acts as a BFF layer:
1. User requests hit Next.js
2. `src/proxy.ts` middleware validates sessions and enforces RBAC
3. Client-side API calls go to `/api/proxy/[...path]` routes
4. Next.js proxies authenticated requests to the Express backend
5. Backend responses are returned to the client

**Critical:** Never expose `JWT_SECRET`, `INTERNAL_AUTH_KEY`, or raw session tokens to the client. The BFF pattern keeps these server-side only.

### Route Structure (Next.js App Router)

```
src/app/
├── (auth)/                    # Public authentication routes
│   ├── login/                 # Login with actions.ts for server actions
│   └── signup/                # Signup with actions.ts for server actions
│
├── (onboarding)/              # New user onboarding flow
│   └── apply-access/          # Portal access application
│       ├── admin/             # Admin role application
│       └── vendor/            # Vendor role application
│
├── (market)/                  # Market admin portal routes
│   ├── dashboard/             # Market overview and stall management
│   └── payments/              # Payment processing
│
├── (portals)/                 # Role-specific protected portals
│   └── super-admin/           # Super admin dashboard
│       ├── audit-logs/        # System-wide audit trail
│       └── requests/          # Approval workflows
│
└── api/
    ├── proxy/[...path]/       # BFF proxy to Express backend
    └── notifications/stream/  # Server-Sent Events for real-time notifications
```

**Route Groups** (folders with parentheses) are used for RBAC organization but don't affect URLs.

### Role-Based Access Control (RBAC)

6 user roles with hierarchical permissions:
1. **SUPER_ADMIN** - Full system access, approval authority
2. **MARKET_ADMIN** - City-level hub management, requires government email domain
3. **VENDOR** - Store management, inventory, orders
4. **SUPPLIER** - Wholesale distribution, RFQ bidding
5. **COUNTER_STAFF** - Gate/stock counter terminals
6. **USER** - Basic platform access

**Key RBAC Files:**
- `src/proxy.ts` - Next.js middleware that enforces routing rules based on role and verification status
- `src/constants.ts` - Defines `ROLES_HIERARCHY` for permission inheritance
- `src/services/auth.service.ts` - Server-only session validation via backend

**Middleware Logic:**
- Unauthenticated users → redirect to `/login`
- Users without KYC/admin approval → redirect to `/apply-access`
- SUPER_ADMIN users → restricted to `/super-admin` routes
- Cross-role portal access → logged and blocked

### Component Architecture

```
src/components/
├── auth/              # Authentication UI (login/signup forms)
├── onboarding/        # Multi-step onboarding wizard
├── dashboard/         # Core functional modules (24+ components)
│   ├── Home.tsx       # Main dashboard with AI trends (Gemini)
│   ├── VendorManagement.tsx
│   ├── InventoryManagement.tsx
│   ├── OrdersManagement.tsx
│   ├── GateManagement.tsx
│   ├── StockCounterTerminal.tsx
│   ├── SupplyRequisitions.tsx (RFQ/bidding)
│   ├── TicketingSystem.tsx (with AI triage)
│   ├── Chatbot.tsx (Gemini with Maps grounding)
│   └── ... (see Doc.md for complete module list)
├── payments/          # Payment processing components
├── contact/           # Support/contact forms
└── ui/                # shadcn/ui atomic components
```

**Shared State:** The root `App.tsx` uses local state + localStorage for user persistence (legacy pattern from original SPA). In production, session state is managed via httpOnly cookies set by the BFF.

### Type System

`src/types.ts` contains all TypeScript interfaces:
- `UserProfile` - User account with role, KYC status, MFA
- `Vendor` / `Supplier` - Entity profiles with compliance tracking
- `Product` / `Order` - Commerce entities
- `Transaction` - Payment records with MTN/Airtel Mobile Money
- `Market` - Physical hub metadata
- `StockLog` / `GateRecord` - Operational logging
- `Ticket` - Support/incident tracking
- `Requisition` / `Bid` - Supply chain RFQ system

All forms use **Zod schemas** for validation before submission.

### AI Integration (Google Gemini)

Three AI features powered by Google GenAI SDK:
1. **Market Trends** (`src/components/dashboard/Home.tsx`) - Gemini-3-Flash analyzes revenue/vendor data
2. **AI Diagnostic** (`src/components/dashboard/TicketingSystem.tsx`) - Gemini-3-Flash triages maintenance tickets
3. **AI Assistant** (`src/components/dashboard/Chatbot.tsx`) - Gemini-2.5-Flash with Google Maps grounding for spatial queries

API key required: `process.env.API_KEY` (referenced in multiple components)

### Security Patterns

1. **Server-Only Imports**: `auth.service.ts` uses `'server-only'` to prevent client bundling
2. **Tainting**: `experimental_taintUniqueValue()` prevents JWT leakage to Client Components
3. **Audit Logging**: `proxy.ts` logs unauthorized access attempts to backend
4. **httpOnly Cookies**: JWTs stored in httpOnly cookies, never localStorage in production
5. **CORS**: Backend must whitelist Next.js origin (`FRONTEND_URL`)
6. **Rate Limiting**: Enforced at backend layer (not in this repo)

## Important Patterns

### Server Actions
Next.js Server Actions are used in route-specific `actions.ts` files:
- `src/app/(auth)/login/actions.ts` - Login submission
- `src/app/(auth)/signup/actions.ts` - Registration
- `src/app/(market)/payments/actions.ts` - Payment processing

These run on the server and can directly interact with the backend API.

### Data Fetching
- **Server Components**: Fetch data in page components using `fetch()` with Next.js cache options
- **Client Components**: Use `fetch()` to `/api/proxy/*` endpoints, which forward to backend
- **Real-time**: WebSocket hook in `src/hooks/use-payment-status.ts` for live payment updates

### Path Aliases
TypeScript paths configured in `tsconfig.json`:
- `@/components` → `src/components`
- `@/lib` → `src/lib`
- `@/hooks` → `src/hooks`

Always use these aliases in imports.

### Styling
- **Tailwind CSS 4** with custom color variables (see `tailwind.config.ts`)
- **shadcn/ui** components configured in `src/components.json`
- Custom animations via `tailwindcss-animate`

### Mobile Optimization
The system is optimized for low-bandwidth Uganda connections:
- Next.js 16 image optimization for KYC documents
- Partial Pre-Rendering (PPR) for static dashboard shells
- Asset caching with `minimumCacheTTL` of 4 hours

## Key Configuration Files

- `next.config.ts` - Backend proxy rewrite rules, image optimization, React 19 strict mode
- `src/proxy.ts` - RBAC middleware (runs on ALL requests)
- `src/constants.ts` - Uganda cities/markets, role hierarchy, store metadata
- `src/vite.config.ts` - Legacy Vite config (appears unused; Next.js is the bundler)
- `.vscode/settings.json` - Enables CodeGeex repo indexing

## Testing
**No test framework detected.** When adding tests:
1. Check if backend repo has test patterns to follow
2. Consider Vitest (matches existing dev dependencies in `src/package.json`)
3. Test critical paths: RBAC middleware, server actions, payment flows

## Common Gotchas

1. **Dual package.json**: Root `package.json` is authoritative. `src/package.json` appears to be legacy from pre-Next.js migration.
2. **Environment Variables**: Use `BACKEND_API_URL` not `VITE_*` prefixed vars (Next.js uses `NEXT_PUBLIC_*` for client-side env vars)
3. **Middleware Matcher**: `src/proxy.ts` has a matcher config - changes to public routes must update the matcher
4. **Government Domains**: Admin access requires email from `ALLOWED_GOV_DOMAINS` (see `.env` example)
5. **Session Cookies**: Must be set with `httpOnly`, `secure`, and `sameSite: 'strict'` flags

## File Locations Reference

- **Market/City Data**: `src/constants.ts` - Update `CITIES_AND_MARKETS` array
- **RBAC Rules**: `src/proxy.ts` - Modify `logAction()` and routing logic
- **User Session**: `src/services/auth.service.ts` - Fetch user from backend
- **AI Prompts**: Inline in respective components (Home, TicketingSystem, Chatbot)
- **Payment Integration**: Components in `src/components/payments/` + hook in `src/hooks/use-payment-status.ts`
