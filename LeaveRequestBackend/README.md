# Leave Request Management System

A full-stack leave request management system built with **ASP.NET Core** backend and **React + TypeScript** frontend, featuring role-based access control, business rule validation, and responsive design.

## 🏗️ Architecture

### Backend (.NET 9)
- **Framework**: ASP.NET Core Web API
- **Database**: SQLite with Entity Framework Core
- **Authentication**: Role-based (Employee/Manager)
- **API Documentation**: Swagger/OpenAPI

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI) v7
- **Testing**: Vitest + Testing Library

## 📋 Features

### ✅ Core Functionality
- **Employee View**: Create and view personal leave requests
- **Manager View**: Approve/reject all team leave requests
- **Real-time Updates**: Automatic UI refresh after actions
- **Error Handling**: Comprehensive backend error display

### ✅ Business Rules
- **No Overlapping Leave**: Prevents conflicting approved requests
- **Auto-Rejection**: Requests >15 days automatically rejected
- **Manager Override**: Managers can approve long-term leave
- **Date Validation**: Prevents past date requests

### ✅ User Experience
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Form Validation**: Client-side and server-side validation
- **Loading States**: Visual feedback during API calls
- **Error Messages**: Clear, actionable error feedback

## 🚀 Quick Start

### Prerequisites
- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Node.js 18+](https://nodejs.org/)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Backend Setup
```bash
cd LeaveRequestBackend
dotnet restore
dotnet run
```
Backend will be available at: `http://localhost:5000`

### Frontend Setup
```bash
cd leave-request-frontend
npm install
npm run dev
```
Frontend will be available at: `http://localhost:5173`

## 📁 Project Structure

```
LeaveRequestBackend/
├── Controllers/           # API Controllers
│   └── LeaveRequestsController.cs
├── Models/               # Data Models
│   ├── Employee.cs
│   └── LeaveRequest.cs
├── Data/                 # Database Context
│   └── AppDbContext.cs
├── DTOs/                 # Data Transfer Objects
│   └── CreateLeaveRequestDto.cs
├── SeedData.cs           # Database Seeding
└── Program.cs            # Application Entry Point

leave-request-frontend/
├── src/
│   ├── components/       # React Components
│   │   ├── Dashboard.tsx
│   │   ├── CreateRequestForm.tsx
│   │   ├── ManagerView.tsx
│   │   └── __tests__/    # Component Tests
│   ├── api.ts            # API Configuration
│   └── App.tsx           # Main Application
├── package.json
└── vite.config.ts
```

## 🔧 API Endpoints

### Leave Requests
- `GET /api/LeaveRequests?employeeId={id}` - Get requests (employee: own, manager: all)
- `POST /api/LeaveRequests` - Create new request
- `PUT /api/LeaveRequests/{id}?managerId={id}` - Update status (manager only)
- `DELETE /api/LeaveRequests/{id}?employeeId={id}` - Cancel request (owner only)

### Example API Calls
```bash
# Get all requests (manager view)
GET /api/LeaveRequests?employeeId=1

# Create request
POST /api/LeaveRequests
{
  "employeeId": 2,
  "startDate": "2024-01-15",
  "endDate": "2024-01-20",
  "reason": "Vacation with family"
}

# Approve request
PUT /api/LeaveRequests/1?managerId=1
"Approved"
```

## 🧪 Testing

### Run Tests
```bash
# Frontend tests
npm run test

# Backend tests (if implemented)
dotnet test
```

### Test Coverage
- ✅ Form validation (CreateRequestForm.test.tsx)
- ✅ Date validation
- ✅ Required field validation
- ✅ Error handling
- ✅ API integration

## 👥 Seed Data

The system comes with pre-seeded users:

### Employees
- **Alex Employee** (ID: 2) - Regular employee
- **Morgan Manager** (ID: 1) - Manager with approval rights

## 🎨 Design Decisions

### Backend Design
- **Entity Framework Core**: Chosen for rapid development and LINQ support
- **SQLite**: Lightweight, file-based database for easy setup
- **RESTful API**: Standard HTTP methods with clear resource endpoints
- **DTOs**: Separate data transfer objects for API contracts

### Frontend Design
- **Material-UI**: Professional, accessible component library
- **Component Architecture**: Modular, reusable components
- **TypeScript**: Type safety and better developer experience
- **Responsive Design**: Mobile-first approach with breakpoints

### Business Logic
- **Role-based Access**: Clear separation between employee and manager actions
- **Validation Layers**: Both client-side and server-side validation
- **Error Handling**: Comprehensive error messages for better UX
- **Auto-rejection**: Business rule enforcement for long requests

## 🔒 Security Features

- **CORS Configuration**: Properly configured for frontend-backend communication
- **Input Validation**: Prevents malicious input and ensures data integrity
- **Role Authorization**: Server-side role verification for sensitive operations
- **SQL Injection Protection**: Entity Framework Core provides built-in protection

## 🚀 Deployment

### Backend Deployment
```bash
dotnet publish -c Release -o ./publish
```

### Frontend Deployment
```bash
npm run build
# Deploy the 'dist' folder to your hosting provider
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🐛 Troubleshooting

### Common Issues

**Backend won't start:**
- Ensure .NET 9 SDK is installed
- Check if port 5000 is available
- Run `dotnet restore` to restore packages

**Frontend build errors:**
- Run `npm install` to install dependencies
- Check Node.js version (18+ required)
- Clear node_modules and reinstall if needed

**Database issues:**
- Delete the SQLite database file to reset
- Check SeedData.cs for initial data

### Support
For issues and questions, please create an issue in the repository.
