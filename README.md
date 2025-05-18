# 📦 Elixir Marketplace Backend

A unified backend API that integrates multiple vendors (ecom & voucher) under a single interface. Supports product discovery, inventory validation, and order placement — with modular architecture, encryption, retry logic, rate limiting, and Swagger docs.

## 🚀 Tech Stack

- **Node.js** with **Express.js**
- **TypeScript**
- **Axios** for HTTP calls
- **dotenv** for config management
- **AES-256-CBC** encryption (Voucher API)
- **Swagger UI** (OpenAPI 3.0)
- **Retry mechanism**, **rate limiter**, and **token caching**

## 📂 Folder Structure

```
.
├── public/
│   └── docs/                  # Swagger YAML file (API docs)
│       └── swagger.yaml
├── src/
│   ├── controllers/           # Main request handlers (controllers)
│   │   └── marketplace.controller.ts
│
│   ├── middlewares/          # Error, logger, limiter, not found
│   │   ├── errorHandler.ts
│   │   ├── notFound.ts
│   │   ├── rateLimiter.ts
│   │   └── requestLogger.ts
│
│   ├── routes/                # Route definitions
│   │   ├── health.route.ts
│   │   └── marketplace.route.ts
│
│   ├── services/              # Vendor factory pattern
│   │   └── vendor.factory.ts
│
│   ├── types/                 # TypeScript interfaces
│   │   └── common.types.ts
│
│   ├── utils/                 # Utilities: encryption, retry, cache
│   │   ├── encryption.ts
│   │   ├── logger.ts
│   │   ├── retry.ts
│   │   └── tokenCache.ts
│
│   ├── vendors/               # Vendor-specific logic
│   │   ├── baseVendor.interface.ts
│   │   ├── ecomVendor.ts
│   │   └── voucherVendor.ts
│
│   ├── app.ts                 # Main express app
│   └── index.ts               # App bootstrap
├── .env                       # Environment variables
├── .gitignore
├── nodemon.json
└── package.json
```

## ⚙️ Features

### ✅ 1. Vendor Abstraction
- Common `BaseVendor` interface
- Concrete implementations for:
  - `ecomVendor.ts` – uses JWT + REST
  - `voucherVendor.ts` – uses encrypted payloads and token headers

### ✅ 2. Token Caching (`utils/tokenCache.ts`)
- Prevents frequent token regeneration
- Stores tokens in memory with TTL (15 minutes)

### ✅ 3. AES-256 Encryption (Voucher API)
- All request/response data is encrypted/decrypted using:
  - `key` and `iv` from `.env`
- AES-256-CBC via Node.js `crypto` module

### ✅ 4. Retry Mechanism (`utils/retry.ts`)
- Automatic retry for failed vendor API calls
- Customizable number of retries and delays

### ✅ 5. Rate Limiting (`middlewares/rateLimiter.ts`)
- Limits requests per IP to avoid abuse
- Returns 429 with appropriate message

### ✅ 6. Request Logging (`middlewares/requestLogger.ts`)
- Logs incoming method, path, and status code for all requests

### ✅ 7. Error Handling (`middlewares/errorHandler.ts`)
- Central error handler for all API exceptions
- Supports structured JSON error responses

### ✅ 8. 404 Route Handler (`middlewares/notFound.ts`)
- Catches and handles all unknown routes with:
```json
{
  "success": false,
  "message": "Route /invalid/path not found"
}
```

### ✅ 9. Swagger API Documentation
- 📄 Located at: `http://localhost:{PORT}/docs`
- Based on OpenAPI 3.0
- File: `public/docs/swagger.yaml`
- Covers:
  - `/products`
  - `/validate-inventory`
  - `/order`
  - `/health`

## 🔐 Environment Configuration

Create a `.env` file in root:

```env
PORT=
SWAGGER_SERVER_URL=http://localhost:3000/api

ECOM_MERCHANT_ID=

VOUCHER_USERNAME=
VOUCHER_PASSWORD=
```

## 🛠️ Installation & Running

```bash
# Clone the repo
git clone https://github.com/Amardeep23/elixir-marketplace-backend.git
cd elixir-marketplace-backend

# Install dependencies
npm install

# Run in development
npm run dev
```

## 🔗 API Endpoints

| Method | Endpoint                                | Description                     |
|--------|-----------------------------------------|---------------------------------|
| GET    | `/api/health`                           | Health check                    |
| POST   | `/api/marketplace/products?vendor=...`  | Get product list from a vendor |
| POST   | `/api/marketplace/validate-inventory`   | Validate inventory availability|
| POST   | `/api/marketplace/order`                | Place order (multi-vendor)     |

## ✅ Sample Order Flow

1. **Search Products**
2. **Validate Inventory**
3. **Place Order (grouped by vendor)**

## 📄 Swagger Docs

Available at:  
`http://localhost:{PORT}/docs`  

## 🔁 Error Formats

### 400 – Bad Request
```json
{
  "success": false,
  "message": "Invalid request: missing items or address"
}
```

### 404 – Not Found
```json
{
  "success": false,
  "message": "Route /api/unknown not found"
}
```

### 429 – Rate Limited
```json
{
  "success": false,
  "message": "Too many requests, please try again later."
}
```

## 📌 Notes

- No database used — in-memory mock only
- Encryption is hardcoded for voucher APIs (can be extracted to `.env`)
- Fully stateless design, ideal for microservice environments

## 👨‍💻 Author

**Your Name**  
[GitHub](https://github.com/Amardeep23)
