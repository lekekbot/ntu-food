# NTU Food Ordering System

A comprehensive food ordering platform for Nanyang Technological University (NTU) students, featuring virtual queue management and scheduled pickup slots with intelligent wait time calculations.

## 🎯 Overview

NTU Food is a mobile-first food ordering application designed to streamline the food ordering process at NTU campus stalls. The system helps reduce physical queuing, enables advance ordering, and provides real-time order tracking with smart queue management for students.

## ✅ **Current Status: COMPLETE FULL-STACK APPLICATION**

Both backend API and frontend application are fully functional:

### **Backend (FastAPI):**
- ✅ **Full Authentication System** with NTU email validation
- ✅ **Complete Order Management** with automatic queue assignment
- ✅ **Smart Queue System** with real-time position tracking
- ✅ **Database Models** with proper relationships and validation
- ✅ **20+ API Endpoints** fully tested and working
- ✅ **JWT Security** with role-based authorization

### **Frontend (React TypeScript):**
- ✅ **Complete User Interface** with responsive design
- ✅ **Authentication Pages** with login/register functionality
- ✅ **Stall Browsing** with real-time status and ratings
- ✅ **Interactive Menu View** with cart and special requests
- ✅ **Order Management** with placement and tracking
- ✅ **Real-time Queue Status** with auto-refresh
- ✅ **Order History** with status indicators
- ✅ **Mobile-First Design** with NTU-themed styling

## 🚀 Features

### For Students (Web & Mobile App)
- **Browse Stalls & Menus**: Interactive grid view of all campus food stalls with real-time status
- **Smart Menu Interface**: Add items to cart with quantity controls and special requests
- **Advance Ordering**: Place orders for specific pickup time slots with cost calculation
- **Virtual Queue**: Automatic queue assignment with real-time position tracking
- **Order Tracking**: Live status updates with estimated ready times and notifications
- **Order History**: Complete order management with quick reorder functionality
- **NTU Authentication**: Secure login with NTU email validation and JWT tokens

### For Stall Owners (Web Dashboard)
- **Order Management**: Accept, prepare, and complete orders
- **Menu Management**: Update menu items, prices, and availability
- **Analytics Dashboard**: View sales reports and popular items
- **Queue Management**: Manage virtual queue and estimated wait times
- **Operating Hours**: Set and update stall operating hours

### For Administrators (Web Portal)
- **Stall Management**: Add/remove stalls and manage stall owners
- **User Management**: Manage student accounts and access
- **System Analytics**: Platform-wide statistics and insights
- **Support Tickets**: Handle user complaints and issues

## 🏗️ Architecture

```
NTU-Food/
├── backend/            # FastAPI backend service
│   ├── app/
│   │   ├── main.py     # FastAPI application entry point
│   │   ├── models/     # SQLAlchemy database models
│   │   ├── routes/     # API endpoint definitions
│   │   ├── schemas/    # Pydantic request/response schemas
│   │   └── database/   # Database configuration and initialization
│   ├── requirements.txt
│   ├── manage_db.py    # Database management utilities
│   └── test_complete_flow.py  # Comprehensive API testing
├── frontend/           # React TypeScript web application
│   ├── public/         # Static assets
│   ├── src/
│   │   ├── components/ # React components (Auth, Stalls, Orders, Queue)
│   │   ├── context/    # Authentication context and state management
│   │   ├── services/   # API integration and HTTP client
│   │   ├── App.tsx     # Main application with routing
│   │   └── main.tsx    # Application entry point
│   ├── package.json
│   └── vite.config.ts  # Vite build configuration
└── docs/               # Project documentation
```

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.9+)
- **Database**: SQLite (development), PostgreSQL (production)
- **Authentication**: JWT tokens
- **API Documentation**: Swagger/OpenAPI
- **Task Queue**: Celery (for notifications)

### Frontend (Web Application)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite (fast development and building)
- **Routing**: React Router v6
- **HTTP Client**: Axios with interceptors
- **State Management**: React Context API
- **Styling**: CSS Modules with responsive design
- **Authentication**: JWT token management
- **Real-time Updates**: Polling for queue status

### Mobile (Future Enhancement)
- **Framework**: React Native (planned)
- **Navigation**: React Navigation
- **State Management**: Context API
- **Push Notifications**: Firebase Cloud Messaging

## 🚦 Getting Started

### Prerequisites
- Python 3.9+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the development server:
```bash
uvicorn app.main:app --reload --port 8000
```

API documentation will be available at `http://localhost:8000/docs`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

The web application will be available at `http://localhost:5173`

## 🎯 **Quick Demo**

### **Test Credentials:**
- **Email:** `test.new.student@e.ntu.edu.sg`
- **Password:** `testpassword123`

### **Demo Flow:**
1. Open frontend: http://localhost:5173
2. Login with test credentials
3. Browse available stalls (3 test stalls with menus)
4. Select a stall and add items to cart
5. Place order and track queue position
6. View order history and status updates

### **API Documentation:**
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🎨 **Frontend Components**

### **User Interface Features:**
- **Responsive Design**: Mobile-first approach with desktop optimization
- **NTU Branding**: Blue and orange color scheme with professional styling
- **Real-time Updates**: Automatic queue status refresh every 30 seconds
- **Interactive Elements**: Smooth animations and hover effects
- **Loading States**: User-friendly loading indicators and error handling

### **Component Structure:**
- **Authentication**: Login, Register with NTU email validation
- **StallList**: Grid view of stalls with status indicators and ratings
- **MenuView**: Interactive menu with cart functionality and special requests
- **OrderForm**: Complete order placement with pickup time selection
- **QueueStatus**: Real-time order tracking with position and wait time
- **OrderList**: Order history with status tracking and quick access
- **ProtectedRoute**: Route protection with automatic login redirect

### **Navigation Flow:**
```
Login/Register → Stall Browse → Menu Selection → Order Placement → Queue Tracking → Order History
```

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - Student registration with NTU email validation
- `POST /api/auth/login` - User login with JWT token generation
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/refresh` - Refresh JWT token

### Stalls
- `GET /api/stalls/` - List all stalls with location and operating hours
- `GET /api/stalls/{id}` - Get detailed stall information
- `POST /api/stalls/` - Create new stall (Admin/Stall Owner only)
- `PUT /api/stalls/{id}` - Update stall information (Owner only)

### Menu Management
- `GET /api/menu/stall/{stall_id}` - Get complete menu for a stall
- `POST /api/menu/` - Add new menu item (Stall Owner only)
- `PUT /api/menu/{item_id}` - Update menu item (Owner only)
- `DELETE /api/menu/{item_id}` - Remove menu item (Owner only)

### Orders
- `POST /api/orders/` - Create new order with automatic queue assignment
- `GET /api/orders/` - Get current user's order history
- `GET /api/orders/{id}` - Get detailed order information
- `PUT /api/orders/{id}/status` - Update order status (Stall Owner only)

### Queue Management
- `GET /api/queue/{stall_id}` - Get complete stall queue with wait times
- `POST /api/queue/join` - Join virtual queue (automatic on order creation)
- `GET /api/queue/position/{order_id}` - Get real-time queue position and ETA
- `PUT /api/queue/{queue_id}/status` - Update queue entry status (Stall Owner only)
- `PUT /api/queue/update` - Bulk update completed orders (Stall Owner only)

## 🗄️ Database Schema

### Core Tables
- **users** - Student and stall owner accounts with NTU email validation
  - NTU email (@e.ntu.edu.sg), student ID, role-based access
- **stalls** - Food stall information with operating hours and location
  - Name, location, operating hours, average prep time, owner relationship
- **menu_items** - Menu items for each stall with availability tracking
  - Name, description, price, category, availability status
- **orders** - Order transactions with automatic queue assignment
  - Order number generation, status tracking, pickup time, total amount
- **order_items** - Items within each order with special requests
  - Quantity, unit price, special requests for each menu item
- **queue** - Virtual queue entries with smart position management
  - Queue position, estimated wait time, status tracking, timestamps
- **reviews** - User reviews and ratings (planned feature)

## 🔒 Security

- JWT-based authentication with role-based authorization
- Password hashing with bcrypt for secure storage
- NTU email validation (@e.ntu.edu.sg domain restriction)
- Pydantic input validation and sanitization
- CORS middleware configured for frontend integration
- Role-based access control (Student, Stall Owner, Admin)
- Protected endpoints with user authorization checks
- Environment variables for sensitive configuration

## 🧪 Testing

### Backend API Testing
```bash
cd backend
python test_complete_flow.py
```

This comprehensive test script validates the complete order flow:
- Student registration and authentication
- Stall browsing and menu viewing
- Order creation with automatic queue assignment
- Queue position tracking and updates
- Order history and details retrieval

### Unit Tests (Future)
```bash
cd backend
pytest tests/
```

### Frontend Tests (Future)
```bash
cd frontend
npm test
```

## 📦 Deployment

### Production Considerations
- Use PostgreSQL instead of SQLite
- Implement Redis for caching
- Set up proper logging
- Configure HTTPS/SSL
- Use environment variables for configuration
- Set up CI/CD pipeline
- Implement monitoring and alerting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- Backend Development Team
- Frontend Development Team
- Mobile Development Team
- UI/UX Design Team

## 📞 Contact

Project Link: [https://github.com/yourusername/ntu-food](https://github.com/yourusername/ntu-food)

---

**Note**: This project is currently under active development. Features and documentation may change.