# Healthscope Partner Service

A microservice dedicated to managing healthcare partner operations including registration, authentication, approval workflows, and partner management.

## 🏥 Service Overview

The Partner Service handles all partner-related operations in the Healthscope platform:

- Partner registration and onboarding
- Authentication and authorization  
- Admin approval workflows
- Partner profile management
- Login credential management

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB 7+
- TypeScript

### Installation
```bash
npm install
```

### Environment Variables
```bash
# Database
DATABASE_URL=mongodb://localhost:27017/healthscope
NODE_ENV=development

# Server
PORT=3002
```

### Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server  
npm start
```

## 📡 API Endpoints

### Partner Operations
- `POST /api/v1/partner` - Register new partner
- `GET /api/v1/partner/:partnerId` - Get partner profile
- `PUT /api/v1/partner/:partnerId` - Update partner profile
- `DELETE /api/v1/partner/:partnerId` - Delete partner

### Authentication
- `POST /api/v1/partner/login` - Partner login
- `POST /api/v1/partner/logout` - Partner logout
- `POST /api/v1/partner/reset-password` - Password reset

### Admin Operations
- `PUT /api/v1/partner/:partnerId/approve` - Approve partner
- `PUT /api/v1/partner/:partnerId/reject` - Reject partner
- `PUT /api/v1/partner/:partnerId/status` - Update partner status

## 🏗️ Architecture

```
src/
├── controllers/     # HTTP request handlers
├── services/        # Business logic layer
├── models/          # Database models  
├── validators/      # Request validation
├── middlewares/     # Express middleware
├── routes/          # API route definitions
├── config/          # Configuration files
└── lib/             # Utility functions
```

## 🔐 Security Features

- Password hashing with bcrypt (12 salt rounds)
- Input validation with Joi
- HTTP error handling
- Request sanitization
- Authentication middleware

## 📊 Database Models

- **Account**: User authentication and roles
- **PartnerProfile**: Partner organization details
- Indexes: Optimized for partner lookups and uniqueness

## 🌐 Service Communication

**Port**: 3002  
**Health Check**: `GET /api/v1/` 

## 📝 Partner Registration Flow

1. Partner submits registration → `POST /api/v1/partner`
2. System creates pending PartnerProfile 
3. Admin reviews and approves → `PUT /api/v1/partner/:id/approve`
4. System creates Account with login credentials
5. Partner receives approval email with credentials

## 🛠️ Development Notes

- Uses TypeScript for type safety
- Mongoose for MongoDB ODM  
- Express.js web framework
- Validation with Joi schemas
- Error handling with http-errors

## 📦 Dependencies

Key production dependencies:
- express: Web framework
- mongoose: MongoDB ODM
- bcrypt: Password hashing
- joi: Validation
- winston: Logging

## 🔄 Related Services

Part of the Healthscope microservices architecture:
- `healthscope-admin` (Port 3001)
- `healthscope-partner` (Port 3002) ← **This service**  
- `healthscope-reader` (Port 3003)
- `healthscope-contributor` (Port 3004)

---

**Healthscope Partner Service** - Managing healthcare partnerships with reliability and security.
