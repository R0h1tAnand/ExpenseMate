# 💼 ExpenseMate - Expense Management System

A comprehensive, modern expense management solution built with React and Node.js, designed to streamline expense reporting, approval workflows, and financial tracking for organizations of all sizes.

![Expense Management System](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Node.js](https://img.shields.io/badge/Node.js-18+-brightgreen)
![React](https://img.shields.io/badge/React-19+-blue)

## 🌟 Features

### Core Functionality
- *📊 Multi-Role Dashboard* - Tailored interfaces for Employees, Managers, and Administrators
- *💰 Expense Tracking* - Create, submit, and manage expense reports with attachments
- *🔄 Approval Workflows* - Configurable multi-step approval processes
- *💱 Multi-Currency Support* - Automatic currency conversion with real-time exchange rates
- *📈 Analytics & Reporting* - Comprehensive expense analytics and reporting tools
- *🔐 Role-Based Access Control* - Secure access management with JWT authentication

### Advanced Features
- *⚡ Real-time Notifications* - Instant updates on expense status changes
- *📱 Responsive Design* - Optimized for desktop, tablet, and mobile devices
- *🔍 Advanced Filtering* - Filter expenses by date, category, status, and more
- *📋 Bulk Operations* - Approve/reject multiple expenses simultaneously
- *🏢 Multi-Company Support* - Manage expenses across multiple organizations
- *📊 Dashboard Analytics* - Visual insights into spending patterns and trends

## 🏗 Architecture

### Backend (Node.js/Express)

backend/
├── controllers/       # Business logic and API handlers
├── models/           # Database models (Sequelize ORM)
├── routes/           # API route definitions
├── middleware/       # Authentication and validation middleware
├── utils/            # Utility functions and helpers
├── config/           # Database and application configuration
└── server.js         # Application entry point


### Frontend (React/Vite)

frontend/
├── src/
│   ├── components/    # Reusable UI components
│   ├── pages/         # Page components (Admin, Manager, Employee)
│   ├── contexts/      # React Context providers
│   ├── services/      # API service layer
│   ├── config/        # Application configuration
│   └── assets/        # Static assets
├── public/           # Public assets
└── index.html        # Application entry point


## 🚀 Quick Start

### Prerequisites
- *Node.js* 18.0.0 or higher
- *PostgreSQL* 12.0 or higher
- *npm* or *yarn* package manager

### Installation

1. *Clone the repository*
   bash
   git clone https://github.com/R0h1tAnand/oodo-Expense_Management.git
   cd oodo-Expense_Management
   

2. *Setup Backend*
   bash
   cd backend
   npm install
   
   # Create environment file
   cp .env.example .env
   
   # Configure your database and other settings in .env
   nano .env
   

3. *Setup Frontend*
   bash
   cd ../frontend
   npm install
   
   # Create environment file
   cp .env.example .env
   
   # Configure API endpoints in .env
   nano .env
   

4. *Database Setup*
   bash
   cd ../backend
   
   # Run database migrations
   npm run migrate
   
   # Seed initial data (optional)
   npm run seed
   

5. *Start the Application*
   
   *Backend (Terminal 1):*
   bash
   cd backend
   npm run dev
   
   
   *Frontend (Terminal 2):*
   bash
   cd frontend
   npm run dev
   

6. *Access the Application*
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api/v1

## ⚙ Configuration

### Backend Environment Variables
env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=expense_management
DB_USER=your_username
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your_refresh_token_secret

# Application Configuration
NODE_ENV=development
PORT=5000

# Currency API (Optional)
CURRENCY_API_KEY=your_currency_api_key


### Frontend Environment Variables
env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_APP_NAME=Expense Management System
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_LOGGING=false

# File Upload Configuration
VITE_MAX_FILE_SIZE=5242880
VITE_ALLOWED_FILE_TYPES=image/jpeg,image/png,application/pdf


## 🎯 User Roles & Permissions

### 👨‍💼 Employee
- Create and submit expense reports
- View personal expense history
- Track approval status
- Upload receipts and supporting documents

### 👨‍💻 Manager
- Review and approve/reject subordinate expenses
- View team expense analytics
- Manage team members
- Bulk approval operations

### 👨‍💼 Administrator
- Full system access and configuration
- User management and role assignment
- Workflow configuration
- Company-wide analytics and reporting
- System settings and maintenance

## 🔧 API Documentation

### Authentication Endpoints

POST   /api/v1/auth/login       # User login
POST   /api/v1/auth/signup      # User registration
POST   /api/v1/auth/refresh     # Refresh JWT token
GET    /api/v1/auth/profile     # Get user profile
PUT    /api/v1/auth/profile     # Update user profile


### Expense Management

GET    /api/v1/expenses         # List expenses (filtered by role)
POST   /api/v1/expenses         # Create new expense
GET    /api/v1/expenses/:id     # Get expense details
PUT    /api/v1/expenses/:id     # Update expense
POST   /api/v1/expenses/:id/submit   # Submit for approval
POST   /api/v1/expenses/:id/approve  # Approve expense
POST   /api/v1/expenses/:id/reject   # Reject expense


### Workflow Management

GET    /api/v1/workflows        # List approval workflows
POST   /api/v1/workflows        # Create workflow
PUT    /api/v1/workflows/:id    # Update workflow
DELETE /api/v1/workflows/:id    # Delete workflow


## 🧪 Testing

### Backend Testing
bash
cd backend
npm test                    # Run all tests
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Generate coverage report


### Frontend Testing
bash
cd frontend
npm test                    # Run component tests
npm run test:e2e           # Run end-to-end tests


## 📦 Deployment

### Production Build

*Backend:*
bash
cd backend
npm run build
npm start


*Frontend:*
bash
cd frontend
npm run build
# Serve the dist/ folder with your preferred web server


### Docker Deployment
bash
# Build and run with Docker Compose
docker-compose up -d

# Scale services
docker-compose up -d --scale backend=3


### Environment-Specific Deployments
- *Development*: npm run dev
- *Staging*: npm run start:staging
- *Production*: npm run start:prod

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. *Fork the repository*
2. *Create a feature branch*
   bash
   git checkout -b feature/amazing-feature
   
3. *Commit your changes*
   bash
   git commit -m 'Add amazing feature'
   
4. *Push to the branch*
   bash
   git push origin feature/amazing-feature
   
5. *Open a Pull Request*

### Development Guidelines
- Follow the existing code style and conventions
- Write unit tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 📋 Roadmap

### Version 1.1 (Q1 2025)
- [ ] Mobile application (React Native)
- [ ] Advanced reporting with PDF export
- [ ] Integration with accounting systems
- [ ] OCR receipt scanning

### Version 1.2 (Q2 2025)
- [ ] Machine learning expense categorization
- [ ] Advanced analytics dashboard
- [ ] API rate limiting and caching
- [ ] Multi-language support

### Version 2.0 (Q3 2025)
- [ ] Microservices architecture
- [ ] Real-time collaboration features
- [ ] Advanced workflow designer
- [ ] Enterprise SSO integration

## 🛠 Technology Stack

### Backend
- *Runtime*: Node.js 18+
- *Framework*: Express.js
- *Database*: PostgreSQL with Sequelize ORM
- *Authentication*: JWT with refresh tokens
- *Validation*: Express Validator
- *Security*: Helmet, CORS, Rate limiting

### Frontend
- *Framework*: React 19 with Vite
- *Routing*: React Router v7
- *State Management*: React Context + Hooks
- *UI Components*: Tailwind CSS + Headless UI
- *Icons*: Heroicons + Lucide React
- *Forms*: React Hook Form
- *Notifications*: React Hot Toast

### DevOps & Tools
- *Version Control*: Git
- *Package Manager*: npm
- *Testing*: Jest (Backend), Vitest (Frontend)
- *Code Quality*: ESLint, Prettier
- *Documentation*: JSDoc, OpenAPI

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, please contact:
- *Email*: support@expensemanagement.com
- *Documentation*: [docs.expensemanagement.com](https://docs.expensemanagement.com)
- *Issues*: [GitHub Issues](https://github.com/R0h1tAnand/oodo-Expense_Management/issues)

## 🙏 Acknowledgments

- Thanks to all contributors who have helped build this project
- Special thanks to the open-source community for the amazing tools and libraries
- Inspired by modern expense management solutions and best practices

---

<div align="center">
  <p>Made with ❤ by the Expense Management Team</p>
  <p>
    <a href="https://github.com/R0h1tAnand/oodo-Expense_Management">⭐ Star this repository</a> if you find it helpful!
  </p>
</div>
