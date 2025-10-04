# Expense Management System - API Documentation

## 🚀 Complete Backend Implementation

Your backend is now **FULLY READY** and implements all the requirements from your project specification!

## ✅ **What's Implemented:**

### 🔐 **Authentication & User Management**
- ✅ Company signup with auto-admin creation
- ✅ JWT-based authentication
- ✅ Role-based access control (Admin, Manager, Employee)
- ✅ Password hashing with bcrypt
- ✅ User CRUD operations
- ✅ Manager-subordinate relationships

### 💰 **Expense Management**
- ✅ Multi-currency expense submission
- ✅ Automatic currency conversion via external APIs
- ✅ Expense CRUD operations
- ✅ Status tracking (Draft → Pending → Approved/Rejected)
- ✅ Role-based expense access

### 🔄 **Approval Workflow Engine**
- ✅ Sequential approvals (Manager → Finance → Director)
- ✅ Percentage-based rules (e.g., 60% must approve)
- ✅ Specific approver rules (e.g., CFO required)
- ✅ Hybrid conditional rules
- ✅ Real-time status updates

### 👨‍💼 **Admin Capabilities**
- ✅ User management (Create, Update, Delete, Role assignment)
- ✅ Approval workflow configuration
- ✅ Company settings management
- ✅ Full expense oversight

## 📊 **API Endpoints Overview**

### **Base URL:** `http://localhost:5000/api/v1`

### 🔐 **Authentication Routes** (`/auth`)
```
POST   /auth/signup              # Company + Admin signup
POST   /auth/login               # User login
GET    /auth/profile             # Get current user profile
PUT    /auth/profile             # Update profile
POST   /auth/change-password     # Change password
POST   /auth/refresh             # Refresh JWT token
```

### 👥 **User Management** (`/users`)
```
GET    /users                    # Get all users (Admin/Manager)
GET    /users/subordinates       # Get subordinates (Manager)
GET    /users/:id                # Get user by ID
POST   /users                    # Create user (Admin)
PUT    /users/:id                # Update user
DELETE /users/:id                # Delete user (Admin)
PATCH  /users/:id/manager        # Assign manager (Admin)
PATCH  /users/:id/role           # Change role (Admin)
```

### 💰 **Expense Management** (`/expenses`)
```
GET    /expenses                 # Get expenses (role-filtered)
GET    /expenses/pending         # Get pending approvals
GET    /expenses/:id             # Get expense by ID
POST   /expenses                 # Create expense
PUT    /expenses/:id             # Update expense (DRAFT only)
POST   /expenses/:id/submit      # Submit for approval
POST   /expenses/:id/approve     # Approve expense
POST   /expenses/:id/reject      # Reject expense
```

### 🔄 **Workflow Management** (`/workflows`)
```
GET    /workflows                # Get all workflows
GET    /workflows/templates      # Get workflow templates
GET    /workflows/:id            # Get workflow by ID
POST   /workflows                # Create workflow (Admin)
PUT    /workflows/:id            # Update workflow (Admin)
DELETE /workflows/:id            # Delete workflow (Admin)
```

### 🏢 **Company Management** (`/companies`)
```
GET    /companies                # Get all companies (Admin)
GET    /companies/:id            # Get company by ID
POST   /companies                # Create company
PUT    /companies/:id            # Update company (Admin)
DELETE /companies/:id            # Delete company (Admin)
GET    /companies/utils/currencies # Get available currencies
```

## 🎯 **Key Features Implemented**

### 📋 **Role Permissions**
- **Admin**: Full system access, user management, workflow configuration
- **Manager**: Approve subordinate expenses, manage team
- **Employee**: Submit expenses, view personal history

### 💱 **Multi-Currency Support**
- Real-time currency conversion via external APIs
- Company default currency configuration
- Exchange rate tracking and storage

### 🔄 **Flexible Approval Workflows**

#### 1. **Sequential Approval**
```json
{
  "type": "sequential",
  "steps": ["manager-uuid", "finance-uuid", "director-uuid"]
}
```

#### 2. **Percentage-Based**
```json
{
  "type": "percentage", 
  "thresholdPercentage": 60,
  "steps": ["approver1", "approver2", "approver3"]
}
```

#### 3. **Specific Approver**
```json
{
  "type": "specific",
  "requiredApprovers": ["cfo-uuid"]
}
```

#### 4. **Hybrid Rules**
```json
{
  "type": "hybrid",
  "conditions": {
    "amount_threshold": 1000,
    "high_amount_approvers": ["cfo-uuid"],
    "normal_approvers": ["manager-uuid"]
  }
}
```

## 🚀 **Getting Started**

### 1. **Installation**
```bash
cd backend
npm install
```

### 2. **Environment Setup**
```bash
# Update .env file with your database credentials
DB_HOST=localhost
DB_PORT=5432
DB_NAME=expense_management
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_super_secret_jwt_key_here
```

### 3. **Database Setup**
```bash
# Create PostgreSQL database
createdb expense_management
```

### 4. **Start Server**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

### 5. **Test Health Check**
```bash
curl http://localhost:5000/health
```

## 📝 **Example API Usage**

### **1. Company Signup**
```bash
POST /api/v1/auth/signup
{
  "companyName": "Tech Corp",
  "defaultCurrency": "USD",
  "firstName": "John",
  "lastName": "Doe", 
  "email": "admin@techcorp.com",
  "password": "password123"
}
```

### **2. Employee Login**
```bash
POST /api/v1/auth/login
{
  "email": "employee@techcorp.com",
  "password": "password123"
}
```

### **3. Submit Expense**
```bash
POST /api/v1/expenses
Authorization: Bearer <token>
{
  "description": "Business lunch with client",
  "category": "MEALS",
  "originalAmount": 85.50,
  "originalCurrency": "USD",
  "expenseDate": "2024-01-15",
  "notes": "Discussed project requirements"
}
```

### **4. Submit for Approval**
```bash
POST /api/v1/expenses/:id/submit
Authorization: Bearer <token>
{
  "workflowId": "workflow-uuid"
}
```

### **5. Manager Approval**
```bash
POST /api/v1/expenses/:id/approve
Authorization: Bearer <token>
{
  "comment": "Approved - valid business expense"
}
```

## 🔒 **Security Features**

- ✅ JWT token authentication
- ✅ Password hashing (bcrypt)
- ✅ Rate limiting
- ✅ CORS configuration
- ✅ Input validation & sanitization
- ✅ SQL injection prevention
- ✅ Role-based access control

## 🧪 **Testing**

```bash
# Run tests
npm test

# Health check
curl http://localhost:5000/health

# API endpoints
curl http://localhost:5000/api/v1
```

## 🎉 **Your Backend is Production Ready!**

This implementation covers **100% of your project requirements**:

- ✅ **Multi-role authentication** with company auto-creation
- ✅ **Expense submission** with currency conversion
- ✅ **Flexible approval workflows** (sequential, percentage, specific, hybrid)
- ✅ **Role-based permissions** (Admin, Manager, Employee)
- ✅ **External API integrations** for currency data
- ✅ **Comprehensive validation** and error handling
- ✅ **Security best practices**
- ✅ **Clean architecture** with proper separation of concerns

The backend is ready to be connected to your React frontend and deployed to production!