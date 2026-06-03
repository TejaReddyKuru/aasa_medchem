# AasaMedChem Inventory and Quotation Management System

A production-grade B2B platform for managing chemical inventory, generating precise quotations, and processing orders securely. Built with Next.js 15, Neon PostgreSQL, and Prisma ORM.

## Tech Stack
- **Framework:** Next.js 15 (App Router, Server Actions)
- **Database:** Neon Serverless PostgreSQL
- **ORM:** Prisma ORM
- **Authentication:** Auth.js v5 (NextAuth) with `bcryptjs`
- **UI/UX:** Tailwind CSS, Shadcn UI, Lucide Icons
- **Calculations:** `decimal.js` for high-precision math
- **Validation:** Zod + React Hook Form

## System Architecture

The application is structured into two primary portals protected by robust Role-Based Access Control (RBAC):
- **Admin Portal**: Inventory management, order approvals, transaction logs.
- **Seller Portal**: Catalog browsing, real-time quotation engine, quotation-to-order pipeline.

### Role-Based Access Control (RBAC)
- **ADMIN**: Can approve/reject orders. Order approvals run inside Prisma Transactions, which safely decrement stock and generate Audit Logs and Inventory Transactions simultaneously.
- **SELLER**: Can generate quotations and convert them to orders. They are scoped strictly to their own orders.
- **Middleware**: Edge middleware prevents unauthorized access to `/admin` or `/seller` routes.

## Database Schema Highlights

The database is built for **scale and extreme precision**:

1. **High Precision Decimals**: All numeric fields (`pricePerBaseUnit`, `inventoryQuantity`, `orderedQuantity`) use `NUMERIC(20,8)` mapped to `Decimal` in Prisma to guarantee precision and eliminate float drifting.
2. **Soft Deletes**: Products use `isDeleted` to preserve referential integrity for historical orders.
3. **B2B Pipeline**: `Quotation` -> `QuotationItem` separates preliminary pricing estimates from final `Order` structures, a necessity for enterprise marketplaces.

## Unit Conversion Strategy

We employ a **Base Unit** normalisation pattern to guarantee that any combination of requested units perfectly translates to physical inventory:
- **WEIGHT**: Base unit is Grams (`g`). (`1 kg = 1000 g`).
- **VOLUME**: Base unit is Milliliters (`mL`). (`1 L = 1000 mL`).
- **COUNT**: Base unit is Items (`item`).

**Flow**:
1. User requests `2.5 kg`.
2. The UI calculates the base conversion (`2.5 * 1000 = 2500 g`).
3. Pricing calculations and Database storage are *exclusively* executed against the `2500 g` value.

## Pricing Strategy

Prices are stored as **Price per Base Unit**.
- Example: If a chemical costs ₹500 per kg, we store it as `₹0.50 per gram`.
- Formula: `pricePerBaseUnit = pricePerKg / 1000`
- Calculation logic: `calculatePrice = quantityInBaseUnit * pricePerBaseUnit`. This is strictly evaluated using `decimal.js` to ensure no floating-point truncation.

## Security Decisions
1. **Password Hashing**: `bcryptjs` with salt round 10 for all credentials.
2. **Server Actions Security**: Every action re-evaluates the session token via `auth()` and throws immediately if the user is unauthenticated or lacks the required role.
3. **Transactions**: Order approvals utilize Prisma `$transaction()` to guarantee that stock is decremented and audited simultaneously, preventing race conditions.
4. **Environment Security**: No credentials exist in the repository.

## Setup Instructions

### 1. Local Setup
```bash
git clone <repo>
cd aasa-medchem
npm install
```

### 2. Neon Database Connection
Duplicate `.env.example` into `.env` and configure your database URL:
```bash
DATABASE_URL="postgresql://<user>:<password>@<host>/neondb?sslmode=require"
AUTH_SECRET="your_secure_secret"
```

### 3. Database Migration and Seeding
```bash
npx prisma db push
npx prisma generate
npx tsx prisma/seed.ts
```

### 4. Running the application
```bash
npm run dev
```

## Test Credentials

The `seed.ts` script automatically provisions the following accounts:
- **Admin**: `admin@example.com` / `password123`
- **Seller**: `seller@example.com` / `password123`

## Deployment Steps (Vercel)
1. Push this repository to GitHub.
2. Import the project in Vercel.
3. Add the `DATABASE_URL` and `AUTH_SECRET` environment variables in Vercel settings.
4. The Build command is automatically detected as `next build`.
5. Run deployment.

## Screenshots

*(Placeholders for UI Screenshots)*
<img width="1620" height="868" alt="image" src="https://github.com/user-attachments/assets/bceb17ad-178f-46bd-81d9-635018c8587b" />

- [Order Approval]

## Engineering Tradeoffs
1. **Decimal vs Float**: Chosen `decimal.js` and `NUMERIC(20,8)`. Tradeoff: Slight performance overhead for extreme monetary accuracy. Worth it for enterprise grade B2B commerce.
2. **Prisma vs Drizzle**: Prisma was chosen for developer velocity and excellent TypeScript schema generation, which makes prototyping robust schemas faster.
3. **No External State Manager**: Relied on Next.js 15 Server Components and `useActionState`, reducing client bundle size significantly at the cost of requiring network connectivity for form submissions.
