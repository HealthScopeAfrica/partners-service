# JWT Authentication System

## Overview

This project now includes a comprehensive JWT (JSON Web Token) authentication system that supports all user roles: `admin`, `partner`, `contributor`, and `reader`.

## Features

✅ **JWT Token Generation & Verification**
✅ **Role-based Authorization**
✅ **Token Refresh System**
✅ **Multiple Authentication Methods**
✅ **Secure Password Handling**
✅ **Middleware-based Protection**

## Environment Variables

Add these to your `.env` file:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
```

## API Endpoints

### Authentication Routes

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "identifier": "partner@example.com", // Email or Partner ID
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "account_id",
      "email": "partner@example.com",
      "role": "partner",
      "partnerId": "HSP001"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": "7d"
    }
  }
}
```

#### Token Refresh
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Verify Token
```http
GET /api/v1/auth/verify
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Get Current User
```http
GET /api/v1/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Logout
```http
POST /api/v1/auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Protected Routes

#### Partner Routes

```http
# Create Partner (Public - no auth required)
POST /api/v1/partner

# Approve Partner (Admin only)
PATCH /api/v1/partner/:id?action=approve
Authorization: Bearer <admin_token>
```

## Middleware Usage

### Authentication Middlewares

```typescript
import { 
  authenticate, 
  adminOnly, 
  partnerOnly, 
  adminOrPartner,
  anyUser,
  selfOrAdmin 
} from '../middlewares/auth';

// Require any valid JWT token
router.get('/protected', authenticate, handler);

// Require admin role
router.post('/admin-only', authenticate, adminOnly, handler);

// Require partner role
router.get('/partner-only', authenticate, partnerOnly, handler);

// Allow admin OR partner
router.put('/admin-or-partner', authenticate, adminOrPartner, handler);

// Allow any authenticated user
router.get('/any-user', authenticate, anyUser, handler);

// Allow user to access own resources or admin to access any
router.get('/users/:id', authenticate, selfOrAdmin('id'), handler);
```

### Custom Authorization

```typescript
import { authorize } from '../middlewares/auth';

// Custom role combinations
router.get('/custom', authenticate, authorize('admin', 'contributor'), handler);
```

## JWT Token Structure

```json
{
  "userId": "account_id",
  "email": "user@example.com",
  "role": "partner",
  "partnerId": "HSP001", // Only for partners
  "iat": 1635789123,
  "exp": 1636393923,
  "iss": "healthscope-api",
  "aud": "healthscope-users"
}
```

## Usage Examples

### Frontend Integration

```javascript
// Login
const loginResponse = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    identifier: 'partner@example.com',
    password: 'password123'
  })
});

const { data } = await loginResponse.json();
const { accessToken, refreshToken } = data.tokens;

// Store tokens
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);

// Use token in requests
const apiCall = await fetch('/api/v1/protected-endpoint', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});

// Token refresh
const refreshResponse = await fetch('/api/v1/auth/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ refreshToken })
});
```

### Service Integration

```typescript
import { generateTokenPair, verifyToken } from '../lib/jwt';

// Generate tokens for a user
const tokens = generateTokenPair({
  userId: user.id,
  email: user.email,
  role: user.role,
  partnerId: user.partnerId // if partner
});

// Verify token
try {
  const payload = verifyToken(token);
  console.log('User:', payload);
} catch (error) {
  console.error('Invalid token:', error.message);
}
```

## Testing with Postman

1. **Login** to get tokens
2. **Copy the accessToken** from the response
3. **Add Authorization header** to protected requests:
   - Header: `Authorization`
   - Value: `Bearer your_access_token_here`

## Security Features

- **Secure JWT Secret**: Use a long, random secret in production
- **Token Expiration**: Access tokens expire in 7 days by default
- **Refresh Tokens**: Longer-lived tokens for seamless authentication
- **Role-based Access**: Granular permission control
- **Password Hashing**: bcrypt with 12 salt rounds
- **Input Validation**: Joi validation on all endpoints

## Testing the System

1. **Create a partner** (no auth required)
2. **Approve the partner** as admin (requires admin token)
3. **Login as the approved partner** to get JWT tokens
4. **Use the tokens** to access protected endpoints

This JWT system provides secure, scalable authentication for your healthcare platform microservices architecture.
