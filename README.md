# Seaborg IPT 2026 - Backend API

Node.js + TypeScript + MySQL REST API with email sign-up, verification, authentication, and forgot password.

## Live URLs

| Service | URL |
|---|---|
| Frontend | https://seaborg-ipt-2026-frontend.onrender.com |
| Backend API | https://seaborg-ipt-2026-backend.onrender.com |
| Swagger Docs | https://seaborg-ipt-2026-backend.onrender.com/api-docs |

## Tech Stack

- Node.js + TypeScript
- Express.js
- MySQL (filess.io)
- Sequelize ORM
- JWT Authentication
- Resend (email service)
- Swagger UI (API documentation)

## Features

- User registration with email verification
- JWT authentication with refresh tokens
- Forgot password / reset password flow
- Role-based access control (Admin / User)
- Swagger API documentation

## Setup Instructions

### Prerequisites
- Node.js v18+
- MySQL database

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/ancline/seaborg-ipt-2026-backend.git
   cd seaborg-ipt-2026-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `config.json` in the root directory:
   ```json
   {
     "database": {
       "host": "localhost",
       "port": 3306,
       "user": "root",
       "password": "",
       "database": "ipt_backend"
     },
     "secret": "your-jwt-secret",
     "emailFrom": "noreply@example.com",
     "resendApiKey": "your-resend-api-key"
   }
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Access Swagger docs at `http://localhost:4000/api-docs`

### Environment Variables (Production)

| Variable | Description |
|---|---|
| `DB_HOST` | MySQL host |
| `DB_PORT` | MySQL port |
| `DB_USER` | MySQL username |
| `DB_PASSWORD` | MySQL password |
| `DB_NAME` | MySQL database name |
| `JWT_SECRET` | Secret key for JWT signing |
| `EMAIL_FROM` | Sender email address |
| `RESEND_API_KEY` | Resend API key for emails |
| `CORS_ORIGIN` | Allowed frontend URL |

## API Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/accounts/authenticate` | Login | No |
| POST | `/accounts/register` | Register | No |
| POST | `/accounts/verify-email` | Verify email | No |
| POST | `/accounts/refresh-token` | Refresh JWT | No |
| POST | `/accounts/revoke-token` | Revoke token | Yes |
| POST | `/accounts/forgot-password` | Forgot password | No |
| POST | `/accounts/validate-reset-token` | Validate reset token | No |
| POST | `/accounts/reset-password` | Reset password | No |
| GET | `/accounts` | Get all accounts | Admin |
| POST | `/accounts` | Create account | Admin |
| GET | `/accounts/:id` | Get account | Yes |
| PUT | `/accounts/:id` | Update account | Yes |
| DELETE | `/accounts/:id` | Delete account | Admin |

> For full request/response details, visit the [Swagger documentation](https://seaborg-ipt-2026-backend.onrender.com/api-docs).

## Notes

- The free Render instance may take **50+ seconds** to wake up after inactivity
- `.env` and `config.json` are excluded from the repository via `.gitignore`
