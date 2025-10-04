# Expense Management System - Backend

A comprehensive Node.js backend API for managing organizational expenses with multi-level approval workflows.

## 🏗️ Architecture

```
backend/
├── config/           # Database and app configuration
├── controllers/      # Business logic controllers
├── middleware/       # Custom middleware (auth, validation)
├── models/          # Sequelize database models
├── routes/          # API route definitions
├── utils/           # Utility functions (JWT, currency, response)
├── .env             # Environment variables
├── package.json     # Dependencies and scripts
└── server.js        # Main server file
```

## 📊 Database Schema

### Models Overview

1. **Company Model**
   - `companyId` (UUID, Primary Key)
   - `name` (String, Unique)
   - `defaultCurrency` (String, 3 chars)

2. **User Model**
   - `userId` (UUID, Primary Key)
   - `email` (String, Unique)
   - `password` (String, Hashed)
   - `firstName`, `lastName` (String)
   - `role` (ENUM: ADMIN, MANAGER, EMPLOYEE)
   - `companyId` (Foreign Key → Company)
   - `managerId` (Foreign Key → User, Self-referencing)

3. **ApprovalWorkflow Model**
   - `workflowId` (UUID, Primary Key)
   - `name` (String)
   - `companyId` (Foreign Key → Company)
   - `rules` (JSONB - Complex approval logic)

4. **Expense Model**
   - `expenseId` (UUID, Primary Key)
   - `description` (String)
   - `category` (ENUM)
   - `submissionDate` (Date)
   - `originalAmount` (Decimal)
   - `originalCurrency` (String)
   - `amountInDefaultCurrency` (Decimal)
   - `receiptUrl` (String)
   - `status` (ENUM: DRAFT, PENDING, APPROVED, REJECTED, CANCELLED)
   - `submittedById` (Foreign Key → User)
   - `approvalWorkflowId` (Foreign Key → ApprovalWorkflow)
   - `currentApproverIndex` (Integer)
   - `approvals` (JSONB Array)

## 🔧 Setup Instructions

### 1. Prerequisites
- Node.js (v16+)
- PostgreSQL (v12+)
- npm or yarn

### 2. Installation

```bash
# Clone the repository
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Configure your database and other settings in .env
```

### 3. Environment Configuration

Create a `.env` file with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=expense_management
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=24h

# Server Configuration
PORT=5000
NODE_ENV=development

# External APIs
COUNTRIES_API_URL=https://restcountries.com/v3.1/all?fields=name,currencies
EXCHANGE_RATE_API_URL=https://api.exchangerate-api.com/v4/latest
```

### 4. Database Setup

```bash
# Create PostgreSQL database
createdb expense_management

# Run the application (tables will be created automatically)
npm run dev
```

### 5. Running the Application

```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start

# Run tests
npm test
```

## 🚀 API Endpoints

### Base URL: `http://localhost:5000/api/v1`

### Health Check
- `GET /health` - Server health status

### Companies
- `GET /companies` - Get all companies (Admin)
- `GET /companies/:id` - Get company by ID
- `POST /companies` - Create company
- `PUT /companies/:id` - Update company (Admin)
- `DELETE /companies/:id` - Delete company (Admin)
- `GET /companies/utils/currencies` - Get available currencies

### Authentication (To be implemented)
- `POST /auth/signup` - Register new user
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Refresh token
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password

### Users (To be implemented)
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create user (Admin)
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user (Admin)
- `GET /users/profile` - Get current user profile

### Expenses (To be implemented)
- `GET /expenses` - Get expenses (filtered by user role)
- `GET /expenses/:id` - Get expense by ID
- `POST /expenses` - Create expense
- `PUT /expenses/:id` - Update expense
- `DELETE /expenses/:id` - Delete expense
- `POST /expenses/:id/submit` - Submit expense for approval
- `POST /expenses/:id/approve` - Approve expense
- `POST /expenses/:id/reject` - Reject expense

### Workflows (To be implemented)
- `GET /workflows` - Get approval workflows
- `GET /workflows/:id` - Get workflow by ID
- `POST /workflows` - Create workflow (Admin)
- `PUT /workflows/:id` - Update workflow (Admin)
- `DELETE /workflows/:id` - Delete workflow (Admin)

## 🔐 Authentication & Authorization

### JWT Token Structure
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "role": "EMPLOYEE",
  "companyId": "uuid",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Role-Based Access Control
- **ADMIN**: Full access to company resources
- **MANAGER**: Access to subordinate expenses and approvals
- **EMPLOYEE**: Access to own expenses and submissions

## 💰 Currency Management

### Supported Features
- Multi-currency expense submission
- Automatic currency conversion using live exchange rates
- Company default currency configuration
- Exchange rate caching and fallback

### External APIs
- **REST Countries API**: For currency list and validation
- **Exchange Rate API**: For real-time currency conversion

## 📋 Approval Workflow Types

### 1. Sequential Approval
```json
{
  "type": "sequential",
  "steps": ["manager-uuid", "finance-uuid", "director-uuid"]
}
```

### 2. Percentage-Based Approval
```json
{
  "type": "percentage",
  "thresholdPercentage": 60,
  "steps": ["approver1-uuid", "approver2-uuid", "approver3-uuid"]
}
```

### 3. Specific Approver Rules
```json
{
  "type": "specific",
  "requiredApprovers": ["cfo-uuid"],
  "steps": ["manager-uuid", "cfo-uuid"]
}
```

### 4. Hybrid Rules
```json
{
  "type": "hybrid",
  "conditions": {
    "amount_threshold": 1000,
    "high_amount_approvers": ["cfo-uuid", "ceo-uuid"],
    "normal_approvers": ["manager-uuid"]
  }
}
```

## 🛡️ Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- CORS configuration
- Helmet security headers
- Input validation and sanitization
- SQL injection prevention (Sequelize ORM)

## 📝 Logging & Monitoring

- Console logging for development
- Error tracking and reporting
- Database query logging (development)
- API request/response logging

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🚀 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure production database
- [ ] Set strong JWT secret
- [ ] Enable SSL/HTTPS
- [ ] Set up proper logging
- [ ] Configure monitoring
- [ ] Set up backup strategy

### Docker Support (Optional)
```dockerfile
# Dockerfile example
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 📚 Dependencies

### Core Dependencies
- **express**: Web application framework
- **sequelize**: SQL ORM for PostgreSQL
- **pg**: PostgreSQL client
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT token management
- **cors**: Cross-origin resource sharing
- **helmet**: Security middleware
- **express-validator**: Input validation
- **axios**: HTTP client for external APIs

### Development Dependencies
- **nodemon**: Development server with auto-restart
- **jest**: Testing framework
- **supertest**: HTTP testing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Note**: This backend provides a solid foundation for the Expense Management System. Additional controllers, routes, and features can be added following the established patterns and structure.