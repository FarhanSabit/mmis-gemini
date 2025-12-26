Key Security Measures Implemented
Node.js Runtime Proxy: Utilizing the proxy.ts convention for explicit network boundaries and faster performance.

Encapsulated Logic: Authorization checks for specific actions (e.g., stall approval) are performed in the DAL, not the frontend UI.

Auditability: Every proxied request through /api/proxy captures metadata for government compliance.

RBAC Segregation: Physical separation of user portals through Next.js Route Groups.

Architectural Highlights:

PKI Security: The backend communication with NIRA is secured via Public Key Infrastructure (PKI) to ensure that identity data is encrypted and originates from a trusted government source.

Non-Repudiation: Upon successful verification, the MMIS creates a digital record that is digitally signed, providing a legal audit trail of the vendor's registration.

Mobile Efficiency: Asset management for the signup process (icons, images) utilizes Next.js 16's enhanced minimumCacheTTL (4 hours) to save data for users on metered connections.

Next.js 16 Tagging: We use next: { tags: [...] } to allow for granular cache revalidation. When a vendor pays for a stall, we can revalidate only that market’s cache.

Streaming Metadata: High-level metrics are rendered immediately, while the detailed stall grid is streamed in, ensuring a low TTFB (Time To First Byte).

Role Encapsulation: This dashboard is located within the (market) Route Group, which is protected by the proxy.ts RBAC check we implemented earlier.

Separation of Concerns: By keeping the WebSocket logic in src/hooks, you keep your UI components (Server/Client components) clean and focused only on rendering.

Reusability: A Market Admin looking at a "Live Revenue Feed" can use the same hook as a Vendor waiting for a specific stall-rent payment.

Next.js 16 Compatibility: Since WebSockets require the browser's window object, placing this in a custom hook with "use client" ensures it only executes on the client-side while remaining accessible to the entire App Router.

Performance & Scaling Strategies
Given the varied internet connectivity in Uganda, the system is optimized for "Limb-Mode" (Offline-first) and high-load management.

Next.js 16 Partial Pre-Rendering (PPR): The static parts of the dashboards (navigation, labels) load instantly from the Edge, while the dynamic revenue data streams in as it becomes available.

Database Sharding: As the system scales to 100+ markets, the database can be partitioned by RegionID (e.g., Central, Northern, Western) to prevent a single bottleneck.

Image Optimization: All KYC document uploads are automatically compressed at the BFF layer before being stored in S3 to save on storage costs and bandwidth.

Implementation Roadmap Summary
Notification Stream: Users subscribe to the SSE endpoint on login to receive real-time alerts.

Action Hooks: Every "Submit" or "Approve" action in the Vendor/Admin dashboards triggers a logAction() call.

UI Feedback: Notifications appear as Toasts (via shadcn/ui) and are archived in a persistent "Notification Center" bell icon in the navigation bar.

Summary of Integration Points
Redirection: Controlled by src/proxy.ts.

Domain Check: Performed in the AdminApplyPage server component before the form is even rendered.

KYC Trigger: The "Apply Vendor" button routes to a file-upload interface that updates user.kycStatus.

BFF Security: All form submissions (Vendor KYC or Admin Application) must go through src/app/api/proxy/[...path]/route.ts to attach the user's JWT for the backend to verify identity.

Role-Based Directory Structure:

src/app/
├── (auth)/                 # Login, Signup
├── (onboarding)/           # For users with no portal access yet
│   └── dashboard/          # The "Common Dashboard" with 2 buttons
├── (portals)/              # Protected Role-Based Portals
│   ├── super-admin/        # /super-admin routes
│   ├── market-admin/       # /market-admin routes
│   └── vendor/             # /vendor routes
├── api/proxy/              # BFF Tunnel to Express Backend
└── proxy.ts                # Next.js 16 Security Interceptor

Key Improvements in this Version:
Public Route Whitelisting: Added a check for /login, /signup, and assets to prevent infinite redirect loops.

State-Aware Redirects: If an unauthenticated user tries to access a page, it saves their intended destination in a from query parameter.

Matcher Configuration: Added a config export to ensure the proxy doesn't run on static assets, significantly improving performance.

Security logging: Integrated the logAction function directly into the unauthorized access attempt branch for the Market Admin portal.

Hierarchy Logic: Strictly enforces that Super Admins stay in their portal while Vendors and Admins are sent back to the /dashboard if their specific verification status (KYC/Admin Approval) is not met.

Implementation Roadmap Summary
Notification Stream: Users subscribe to the SSE endpoint on login to receive real-time alerts.

Action Hooks: Every "Submit" or "Approve" action in the Vendor/Admin dashboards triggers a logAction() call.

UI Feedback: Notifications appear as Toasts (via shadcn/ui) and are archived in a persistent "Notification Center" bell icon in the navigation bar.

┌─────────────────────────────────────────────────────────────────────────┐
│                        USER (Browser/Client)                             │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                    HTTP Request (https://app.com)
                                 │
        ┌────────────────────────▼────────────────────────────┐
        │                                                      │
        │          FRONTEND (Next.js 16)  - Port 3000         │
        │                                                      │
        │  ┌──────────────────────────────────────────────┐   │
        │  │  1️⃣ Page/Component                          │   │
        │  │  ├─ (auth)/login                             │   │
        │  │  ├─ (dashboard)/profile                       │   │
        │  │  └─ (dashboard)/settings                      │   │
        │  └──────────────────────────────────────────────┘   │
        │                       │                              │
        │                       ▼                              │
        │  ┌──────────────────────────────────────────────┐   │
        │  │  2️⃣ Middleware (middleware.ts)              │   │
        │  │  ├─ Read auth_token from cookie             │   │
        │  │  ├─ Validate JWT signature                  │   │
        │  │  ├─ Check if route is protected             │   │
        │  │  └─ Redirect to login if invalid            │   │
        │  └──────────────────────────────────────────────┘   │
        │                       │                              │
        │                       ▼ (token valid)               │
        │  ┌──────────────────────────────────────────────┐   │
        │  │  3️⃣ BFF API Routes (/api/*)                │   │
        │  │  ├─ /api/auth/login                         │   │
        │  │  ├─ /api/auth/logout                        │   │
        │  │  ├─ /api/user/profile                       │   │
        │  │  ├─ /api/user/update                        │   │
        │  │  └─ /api/dashboard/data                     │   │
        │  └──────────────────────────────────────────────┘   │
        │                       │                              │
        │                       ▼                              │
        │  ┌──────────────────────────────────────────────┐   │
        │  │  4️⃣ Auth Context & Hooks                   │   │
        │  │  ├─ useAuth()                               │   │
        │  │  ├─ useFetch()                              │   │
        │  │  └─ useUser()                               │   │
        │  └──────────────────────────────────────────────┘   │
        │                                                      │
        └──────────────────────┬───────────────────────────────┘
                               │
            ┌──────────────────▼─────────────────┐
            │  Reverse Proxy (Nginx/CloudFlare)  │
            │  - SSL/TLS encryption              │
            │  - Rate limiting                   │
            │  - DDoS protection                 │
            └──────────────────┬─────────────────┘
                               │
                               ▼
        ┌────────────────────────────────────────────────┐
        │                                                 │
        │      BACKEND (Node.js + Express) - Port 3001   │
        │                                                 │
        │  ┌──────────────────────────────────────────┐  │
        │  │  1️⃣ HTTP Request (from BFF)              │  │
        │  │  ├─ POST /api/auth/login                 │  │
        │  │  ├─ GET /api/user/profile                │  │
        │  │  └─ Authorization:  Bearer <JWT>          │  │
        │  └──────────────────────────────────────────┘  │
        │                    │                            │
        │                    ▼                            │
        │  ┌──────────────────────────────────────────┐  │
        │  │  2️⃣ Middleware Stack                    │  │
        │  │  ├─ corsMiddleware                      │  │
        │  │  ├─ helmet (security headers)           │  │
        │  │  ├─ rateLimitMiddleware                 │  │
        │  │  ├─ loggingMiddleware                   │  │
        │  │  └─ errorHandler                        │  │
        │  └──────────────────────────────────────────┘  │
        │                    │                            │
        │                    ▼                            │
        │  ┌──────────────────────────────────────────┐  │
        │  │  3️⃣ Route Handlers                      │  │
        │  │  ├─ authMiddleware (JWT validation)     │  │
        │  │  ├─ authorize (role checking)           │  │
        │  │  └─ Controller Logic                    │  │
        │  └──────────────────────────────────────────┘  │
        │                    │                            │
        │                    ▼                            │
        │  ┌──────────────────────────────────────────┐  │
        │  │  4️⃣ Services Layer                      │  │
        │  │  ├─ authService. ts                      │  │
        │  │  ├─ userService. ts                      │  │
        │  │  ├─ tokenService.ts                     │  │
        │  │  └─ passwordService.ts                  │  │
        │  └──────────────────────────────────────────┘  │
        │                    │                            │
        │                    ▼                            │
        │  ┌──────────────────────────────────────────┐  │
        │  │  5️⃣ Database Layer (Prisma ORM)         │  │
        │  │  ├─ Query validation                    │  │
        │  │  └─ Transaction management              │  │
        │  └──────────────────────────────────────────┘  │
        │                    │                            │
        └────────────────────┼───────────────────────────┘
                             │
                             ▼
        ┌────────────────────────────────────────────────┐
        │                                                 │
        │        PostgreSQL Database - Port 5432         │
        │                                                 │
        │  ├─ Users table                               │
        │  ├─ Sessions table                            │
        │  ├─ Audit logs table                          │
        │  └─ Other business data tables                │
        │                                                 │
        └────────────────────────────────────────────────┘

        USER LOGIN SEQUENCE: 

1. User fills login form on frontend
   └─ email:  user@example.com
   └─ password: password123

2. Frontend submits to BFF endpoint
   POST http://localhost:3000/api/auth/login
   {
     email: "user@example.com",
     password: "password123"
   }

3. BFF API Route receives request
   ├─ Validates input with Zod schema
   ├─ Proxies to backend
   │  GET http://localhost:3001/api/auth/login
   │  {
   │    email: "user@example.com",
   │    password: "password123"
   │  }
   └─ Backend processes

4. Backend validates credentials
   ├─ Queries database for user
   ├─ Compares password hash with bcrypt
   ├─ Generates JWT token (with userId, email, role)
   ├─ Creates session in database
   ├─ Updates lastLoginAt
   └─ Returns response

5. Backend response to BFF
   {
     success: true,
     data: {
       user: {
         id: "xyz123",
         email: "user@example.com",
         name: "John Doe",
         role: "user"
       },
       token:  "eyJhbGciOiJIUzI1NiIs..."
     }
   }

6. BFF stores JWT in httpOnly cookie
   ├─ response.cookies.set({
   │    name: 'auth_token',
   │    value: token,
   │    httpOnly: true,  // XSS safe
   │    secure: true,    // HTTPS only
   │    sameSite: 'strict'  // CSRF safe
   │  })
   └─ Returns user data to frontend

7. Frontend receives response
   ├─ Updates AuthContext with user
   ├─ Stores user in memory (not localStorage)
   └─ Redirects to /dashboard

PROTECTED ROUTE ACCESS:

1. User navigates to /dashboard/profile
   └─ Middleware intercepts request

2. Middleware checks auth_token cookie
   ├─ If no token → Redirect to /login
   └─ If token exists → Validate

3. Middleware verifies JWT signature
   ├─ Decodes token with JWT_SECRET
   ├─ If valid → Allow request
   └─ If invalid → Clear cookie & redirect to /login

4. Page component mounts
   ├─ useAuth() hook reads context
   ├─ Component fetches data via BFF
   │  GET /api/user/profile
   │  (auth_token automatically sent in cookie)
   └─ BFF proxies to backend

5. BFF API Route processes request
   ├─ Reads auth_token from cookie
   ├─ Proxies to backend with token
   │  GET /api/user/profile
   │  Authorization: Bearer <token>
   └─ Backend middleware validates

6. Backend authenticates request
   ├─ Extracts token from header
   ├─ Verifies JWT signature
   ├─ Attaches user to req.user
   └─ Calls route handler

7. Backend returns user data
   └─ BFF passes to frontend

8. Frontend renders dashboard
   ├─ Displays user profile
   └─ User can interact

LOGOUT SEQUENCE:

1. User clicks logout button

2. Frontend calls BFF logout
   POST /api/auth/logout

3. BFF notifies backend
   POST /api/auth/logout
   Authorization: Bearer <token>

4. Backend invalidates session
   ├─ Marks session as invalid
   ├─ Clears refresh tokens
   └─ Returns success

5. BFF clears auth_token cookie
   ├─ response.cookies.set({
   │    name: 'auth_token',
   │    value: '',
   │    expires: new Date(0)
   │  })
   └─ Returns success

6. Frontend clears AuthContext
   ├─ user = null
   └─ Redirects to /login

   // ⭐ Complete BFF API endpoints structure

// ─────────────────── AUTH ENDPOINTS ───────────────────

// POST /api/auth/login
// Public endpoint
// Request: { email, password }
// Response: { user, token, refreshToken }
// Flow:  Frontend form → BFF → Backend

// POST /api/auth/signup
// Public endpoint
// Request:  { email, password, name }
// Response: { user, token, refreshToken }
// Flow: Frontend form → BFF → Backend

// POST /api/auth/logout
// Protected endpoint
// Request: { refreshToken?  }
// Response: { message }
// Flow: Frontend button → BFF → Backend → Clear cookie

// GET /api/auth/me
// Protected endpoint
// Request:  (auth_token in cookie)
// Response: { user }
// Flow: Frontend component → BFF (reads cookie) → Backend

// POST /api/auth/refresh-token
// Public endpoint
// Request: { refreshToken }
// Response: { token, refreshToken }
// Flow: Token expired → Frontend → BFF → Backend

// ─────────────────── USER ENDPOINTS ───────────────────

// GET /api/user/profile
// Protected endpoint
// Request: (auth_token in cookie)
// Response: { user, profile }
// Flow: Frontend → BFF (reads cookie) → Backend

// PUT /api/user/update
// Protected endpoint
// Request: { name, avatar?, ...  }
// Response: { user }
// Flow: Frontend form → BFF (reads cookie) → Backend

// POST /api/user/avatar
// Protected endpoint (file upload)
// Request: FormData with file
// Response: { avatarUrl }
// Flow: Frontend upload → BFF (reads cookie) → Backend

// ─────────────────── DASHBOARD ENDPOINTS ───────────────────

// GET /api/dashboard/stats
// Protected endpoint
// Request:  (auth_token in cookie)
// Response: { stats }
// Flow: Dashboard page → BFF (reads cookie) → Backend

// GET /api/dashboard/users
// Protected (admin only)
// Request: (auth_token in cookie)
// Response: { users, total, page }
// Flow: Admin panel → BFF (reads cookie + validates role) → Backend

// ⭐ Security layers in BFF pattern

// 1. COOKIE SECURITY (httpOnly)
response.cookies.set({
  name: 'auth_token',
  httpOnly: true,      // ✅ Prevents XSS attacks
  secure: true,        // ✅ HTTPS only
  sameSite: 'strict',  // ✅ CSRF protection
  maxAge: 30 * 24 * 60 * 60, // ✅ Automatic expiration
  path: '/',
  domain: 'example.com' // ✅ Restrict domain
});

// 2. MIDDLEWARE VALIDATION
app.use(cors({
  origin: process.env.FRONTEND_URL,  // ✅ Restrict origin
  credentials: true,  // ✅ Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

// 3. RATE LIMITING
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,  // ✅ 15 min window
  max: 100,  // ✅ Max 100 requests per window
  skip: (req) => req.path === '/health'  // ✅ Whitelist health check
}));

// 4. REQUEST VALIDATION (Zod)
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(256)  // ✅ Prevent overly long inputs
});

// 5. INPUT SANITIZATION
import mongoSanitize from 'express-mongo-sanitize';
app.use(mongoSanitize());  // ✅ Prevent NoSQL injection

// 6. HELMET SECURITY HEADERS
import helmet from 'helmet';
app.use(helmet({
  contentSecurityPolicy: true,
  xssFilter: true,
  noSniff: true
}));

// 7. JWT SECRET PROTECTION
// Never expose JWT_SECRET to frontend
// Keep it only on backend (env variable)
const JWT_SECRET = process.env. JWT_SECRET; // ✅ Server-side only

// 8. TOKEN EXPIRATION
const token = jwt.sign(payload, JWT_SECRET, {
  expiresIn: '30d'  // ✅ Auto-expire
});

// 9. REFRESH TOKEN ROTATION
const refreshToken = generateRefreshToken();
// Store in database and rotate on each use
await db.session.update({
  where: { id: sessionId },
  data: { refreshToken:  newRefreshToken }
});

// 10. AUDIT LOGGING
await logAudit({
  userId: req.user. userId,
  action: 'LOGIN',
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
  success: true
});

# ⭐ LOCAL DEVELOPMENT WITH DOCKER

# 1. Clone repositories
git clone <frontend-repo> nextjs-dashboard-frontend
git clone <backend-repo> node-backend-api

# 2. Create . env. local
cat > .env.local << EOF
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=dashboard_db
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
PGADMIN_EMAIL=admin@example.com
PGADMIN_PASSWORD=admin
EOF

# 3. Start all services with Docker Compose
docker-compose up -d

# 4. Run migrations
docker exec dashboard_backend npm run prisma:migrate

# 5. Seed database
docker exec dashboard_backend npm run prisma:seed

# 6. Access services
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
# pgAdmin: http://localhost:5050
# Prisma Studio: npm run prisma:studio

# ⭐ STOP SERVICES
docker-compose down

# ⭐ VIEW LOGS
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# ⭐ PRODUCTION DEPLOYMENT

# 1. Build images
docker build -t dashboard-backend: 1.0.0 ./node-backend-api
docker build -t dashboard-frontend:1.0.0 ./nextjs-dashboard-frontend

# 2. Push to registry (ECR, Docker Hub, etc.)
docker push dashboard-backend:1.0.0
docker push dashboard-frontend:1.0.0

# 3. Deploy to production
docker-compose -f docker-compose.prod.yml up -d

# 4. Verify deployment
curl http://localhost:3001/health
curl http://localhost:3000/