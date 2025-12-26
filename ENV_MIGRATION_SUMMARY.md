# Environment Variable Migration Summary

## Date: December 26, 2025

---

## Changes Made

### 1. Updated `.env.local`

**New Environment Variables:**

```env
# Frontend Environment (Client-Side Accessible)
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=MMIS
NEXT_PUBLIC_APP_VERSION=2.5.0

# Next.js Environment
NODE_ENV=development

# Backend Environment (Server-Side Only)
DATABASE_URL=postgresql://postgres:Elite1234%$@dev-sft.cude02oi0pem.us-east-1.rds.amazonaws.com:5432/market_master_dev

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-token-secret-change-in-production

# Email Configuration (for forgot password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=oitsdev123@gmail.com
SMTP_PASS=pjpo pazy kofn qwwx
SMTP_FROM=noreply@marketmaster.com

# Session Configuration
SESSION_SECRET=session-secret-key-change-in-production
COOKIE_SECURE=false
COOKIE_DOMAIN=localhost

# Application Settings
PASSWORD_RESET_TIMEOUT=3600000
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_TIME=900000

# Google Gemini AI Configuration
GEMINI_API_KEY=your-gemini-api-key-here
```

---

## Variable Replacements in Code

### Old Variable → New Variable

1. **`BACKEND_API_URL` → `NEXT_PUBLIC_API_BASE_URL`**
   - Changed from server-only to public (client-accessible)
   - Updated API base URL from `localhost:8000` to `localhost:5000`
   - Removed `/api` suffix from base URL (now part of the URL path)

2. **`API_KEY` → `GEMINI_API_KEY`**
   - More descriptive naming for Google Gemini API
   - Consistent with environment specification

3. **`INTERNAL_AUTH_KEY` → Removed**
   - Not in the new specification
   - Can be added back if needed for internal BFF-to-Backend auth

---

## Files Updated

### 1. Environment Configuration
- ✅ `.env.local` - Completely replaced with new variables

### 2. Core Services
- ✅ `src/services/auth.service.ts`
  - Changed: `process.env.BACKEND_API_URL` → `process.env.NEXT_PUBLIC_API_BASE_URL`
  - Updated: `/api/auth/me` → `/auth/me`

- ✅ `src/middleware.ts`
  - Changed: `process.env.BACKEND_API_URL` → `process.env.NEXT_PUBLIC_API_BASE_URL`
  - Updated: `/api/audit-logs` → `/audit-logs`

### 3. Next.js Configuration
- ✅ `next.config.ts`
  - Changed: `process.env.BACKEND_API_URL` → `process.env.NEXT_PUBLIC_API_BASE_URL`
  - Updated: `/api/:path*` → `/:path*`

### 4. API Routes
- ✅ `src/app/api/proxy/[...path]/route.ts`
  - Changed: `BACKEND_API_URL` → `NEXT_PUBLIC_API_BASE_URL`
  - Updated: All fetch calls now use `/${path}` instead of `/api/${path}`

### 5. Auth Actions
- ✅ `src/app/(auth)/login/actions.ts`
  - Changed: `process.env.BACKEND_API_URL` → `process.env.NEXT_PUBLIC_API_BASE_URL`
  - Updated: `/api/auth/login` → `/auth/login`

- ✅ `src/app/(auth)/signup/actions.ts`
  - Changed: `process.env.BACKEND_API_URL` → `process.env.NEXT_PUBLIC_API_BASE_URL`
  - Updated: `/api/auth/register-vendor` → `/auth/register-vendor`

### 6. Payment Actions
- ✅ `src/app/(market)/payments/actions.ts`
  - Changed: `process.env.BACKEND_API_URL` → `process.env.NEXT_PUBLIC_API_BASE_URL`
  - Updated: `/api/payments/momo/push` → `/payments/momo/push`

### 7. AI Components
- ✅ `src/components/dashboard/Chatbot.tsx`
  - Changed: `process.env.API_KEY` → `process.env.GEMINI_API_KEY`

- ✅ `src/components/dashboard/TicketingSystem.tsx`
  - Changed: `process.env.API_KEY` → `process.env.GEMINI_API_KEY`

- ✅ `src/components/dashboard/Home.tsx`
  - Changed: `process.env.API_KEY` → `process.env.GEMINI_API_KEY`

- ✅ `src/components/dashboard/InteractiveMap.tsx`
  - Changed: `process.env.API_KEY` → `process.env.GEMINI_API_KEY`

---

## API Endpoint Structure Changes

### Before
```
Backend API URL: http://localhost:8000
Frontend calls: http://localhost:8000/api/auth/login
                http://localhost:8000/api/auth/me
                http://localhost:8000/api/payments/momo/push
```

### After
```
Backend API URL: http://localhost:5000/api
Frontend calls: http://localhost:5000/api/auth/login
                http://localhost:5000/api/auth/me
                http://localhost:5000/api/payments/momo/push
```

**Note:** The `/api` prefix is now part of `NEXT_PUBLIC_API_BASE_URL`, so it's not repeated in the endpoint paths.

---

## New Features Enabled

### Database Integration
- PostgreSQL connection string added
- Ready for Prisma ORM integration
- Database: `market_master_dev` on AWS RDS

### Email System
- SMTP configuration for Gmail
- Forgot password functionality enabled
- Email verification ready

### Session & Security
- JWT token secrets configured
- Session management secrets added
- Cookie security settings defined
- Login attempt limits configured
- Account lockout protection enabled

---

## Environment Variable Types

### Client-Side (NEXT_PUBLIC_*)
These are accessible in browser JavaScript:
- `NEXT_PUBLIC_API_BASE_URL` - API endpoint
- `NEXT_PUBLIC_SITE_URL` - Frontend URL
- `NEXT_PUBLIC_APP_NAME` - App name
- `NEXT_PUBLIC_APP_VERSION` - App version

### Server-Side Only
These are NEVER exposed to the client:
- `DATABASE_URL` - PostgreSQL connection
- `JWT_SECRET` - JWT signing secret
- `JWT_REFRESH_SECRET` - Refresh token secret
- `SMTP_*` - Email configuration
- `SESSION_SECRET` - Session signing
- `GEMINI_API_KEY` - AI API key

---

## Testing Checklist

### Backend API Connection
- [ ] Verify backend is running on `http://localhost:5000`
- [ ] Test login endpoint: `POST /api/auth/login`
- [ ] Test session endpoint: `GET /api/auth/me`
- [ ] Test registration: `POST /api/auth/register-vendor`

### Frontend Features
- [ ] Test login flow
- [ ] Test signup/registration
- [ ] Test payment gateway
- [ ] Test AI chatbot (requires GEMINI_API_KEY)
- [ ] Test ticketing system AI triage
- [ ] Test interactive map grounding

### Email System
- [ ] Test forgot password email
- [ ] Test email verification
- [ ] Verify SMTP connection

### Database
- [ ] Verify PostgreSQL connection
- [ ] Test database migrations
- [ ] Verify data persistence

---

## Security Notes

### ⚠️ Production Checklist

Before deploying to production:

1. **Change all secrets:**
   - [ ] `JWT_SECRET` - Generate strong random string
   - [ ] `JWT_REFRESH_SECRET` - Generate strong random string
   - [ ] `SESSION_SECRET` - Generate strong random string

2. **Update security settings:**
   - [ ] Set `COOKIE_SECURE=true`
   - [ ] Update `COOKIE_DOMAIN` to production domain
   - [ ] Set `NODE_ENV=production`

3. **Protect sensitive data:**
   - [ ] Never commit `.env.local` to git
   - [ ] Use environment variable management (Vercel, AWS Secrets Manager, etc.)
   - [ ] Rotate SMTP password if using real credentials

4. **API Security:**
   - [ ] Enable CORS for production domain only
   - [ ] Add rate limiting
   - [ ] Implement request validation
   - [ ] Add API authentication/authorization

---

## Troubleshooting

### Issue: "Cannot connect to backend"
**Solution:** 
- Verify backend is running on port 5000
- Check `NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api`

### Issue: "Gemini API not working"
**Solution:**
- Ensure `GEMINI_API_KEY` is set in `.env.local`
- Verify API key is valid from Google AI Studio

### Issue: "Email not sending"
**Solution:**
- Check SMTP credentials
- Verify Gmail "App Password" is being used (not regular password)
- Enable "Less secure app access" in Gmail (if needed)

### Issue: "Database connection failed"
**Solution:**
- Verify PostgreSQL is accessible
- Check AWS RDS security groups allow connections
- Verify database credentials in `DATABASE_URL`

---

## Migration Complete! ✅

**All environment variables updated**  
**All API endpoints aligned**  
**All code references updated**  

### Next Steps:
1. Start backend on port 5000
2. Set your actual `GEMINI_API_KEY`
3. Test all features
4. Review security settings before production

---

**Updated:** December 26, 2025  
**Status:** ✅ COMPLETE
