# EnterpriseFlow — Full-Stack Inventory & Order Management

A portfolio-ready full-stack application with a Next.js App Router frontend, Express REST API, PostgreSQL and Prisma. It includes a customer storefront and a role-protected admin panel.

## Stack
- Frontend: Next.js 14 App Router, JavaScript, CSS
- Backend: Node.js, Express, Prisma ORM
- Database: PostgreSQL
- Auth: JWT + bcrypt
- Charts: Recharts
- Uploads: Multer (local development storage)

## Requirements
- Node.js 20+
- npm 10+
- PostgreSQL 14+ (local install or hosted database)
- Git (optional)

## Folder structure
```
enterpriseflow/
  backend/
    prisma/schema.prisma
    prisma/seed.js
    src/
      middleware/
      routes/
      utils/
      server.js
    .env.example
    package.json
  frontend/
    app/
      admin/
      cart/
      login/
      products/[id]/
      register/
      orders/
      globals.css
      layout.js
      page.js
    components/
    lib/
    .env.local.example
    package.json
```

## 1. Create the database
Create a PostgreSQL database named `enterpriseflow`.
For example, in psql:
```sql
CREATE DATABASE enterpriseflow;
```

## 2. Configure and start the backend
```bash
cd backend
npm install
cp .env.example .env
```
Edit `backend/.env` and set `DATABASE_URL` to your PostgreSQL connection string, for example:
```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/enterpriseflow?schema=public"
JWT_SECRET="replace-this-with-a-long-random-secret"
PORT=5000
CLIENT_URL="http://localhost:3000"
```
Then run:
```bash
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev
```
API health check: http://localhost:5000/api/health

Seed accounts:
- Admin: `admin@enterpriseflow.dev` / `Admin123!`
- Customer: `customer@enterpriseflow.dev` / `Customer123!`

Change these credentials and the JWT secret before deploying.

## 3. Configure and start the frontend
Open a second terminal:
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```
Open http://localhost:3000

The frontend uses Next.js directly. Vite is not used.

## 4. Test the main workflows
1. Open the storefront and browse products.
2. Sign in with the customer seed account.
3. Add products to cart and place an order.
4. Sign out, then sign in with the admin account.
5. Open `/admin` to manage products, categories, orders and view dashboard metrics.

## API overview
Base URL: `http://localhost:5000/api`

| Method | Endpoint | Access |
|---|---|---|
| GET | `/health` | Public |
| POST | `/auth/register` | Public |
| POST | `/auth/login` | Public |
| GET | `/auth/me` | Signed in |
| GET | `/products` | Public |
| GET | `/products/:id` | Public |
| POST | `/products` | Admin |
| PUT | `/products/:id` | Admin |
| DELETE | `/products/:id` | Admin |
| GET | `/categories` | Public |
| POST | `/categories` | Admin |
| GET | `/cart` | Customer |
| POST | `/cart` | Customer |
| DELETE | `/cart/:productId` | Customer |
| POST | `/orders` | Customer |
| GET | `/orders/my` | Customer |
| GET | `/admin/stats` | Admin |
| GET | `/admin/orders` | Admin |
| PATCH | `/admin/orders/:id/status` | Admin |
| GET | `/admin/users` | Admin |

## Thunder Client examples
### Login
POST `http://localhost:5000/api/auth/login`
```json
{ "email": "admin@enterpriseflow.dev", "password": "Admin123!" }
```
Copy the returned `token`, then set request header:
`Authorization: Bearer YOUR_TOKEN`

### Create a product (admin token)
POST `http://localhost:5000/api/products`
```json
{
  "name": "Wireless Keyboard",
  "description": "Low-profile wireless keyboard",
  "price": 59.99,
  "stock": 35,
  "imageUrl": "https://images.unsplash.com/photo-1587829741301-dc798b83add3",
  "categoryId": "PASTE_CATEGORY_ID"
}
```

### Add to cart (customer token)
POST `http://localhost:5000/api/cart`
```json
{ "productId": "PASTE_PRODUCT_ID", "quantity": 2 }
```

### Place order (customer token)
POST `http://localhost:5000/api/orders`
```json
{ "shippingAddress": "House 12, Road 4, Dhaka, Bangladesh" }
```

## Production notes
- Use a managed PostgreSQL database and set environment variables in your hosting provider.
- Deploy the backend and frontend separately, then set `NEXT_PUBLIC_API_URL`.
- Replace local Multer storage with S3-compatible object storage for production.
- Add payment-provider integration, email notifications, audit logging and automated tests before handling real transactions.
- Use HTTPS, rotate JWT secrets, add rate limiting and secure cookie-based auth for a production deployment.
