# NTU Food Ordering System

A comprehensive food ordering platform for Nanyang Technological University (NTU) students, featuring virtual queue management and scheduled pickup slots.

## 🎯 Overview

NTU Food is a mobile-first food ordering application designed to streamline the food ordering process at NTU campus stalls. The system helps reduce physical queuing, enables advance ordering, and provides real-time order tracking for students.

## 🚀 Features

### For Students (Mobile App)
- **Browse Stalls & Menus**: View all campus food stalls and their menus
- **Advance Ordering**: Place orders for specific pickup time slots
- **Virtual Queue**: Join virtual queues and receive notifications when order is ready
- **Order Tracking**: Real-time status updates on order preparation
- **Payment Integration**: Secure payment processing
- **Order History**: Track past orders and reorder favorites
- **Ratings & Reviews**: Rate stalls and provide feedback

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
│   │   ├── main.py
│   │   ├── models/     # Database models
│   │   ├── routes/     # API endpoints
│   │   ├── schemas/    # Pydantic schemas
│   │   └── database/   # Database configuration
│   └── requirements.txt
├── frontend/           # React web dashboard
│   ├── public/
│   ├── src/
│   └── package.json
├── mobile/            # React Native mobile app (future)
└── docs/              # Documentation
```

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.9+)
- **Database**: SQLite (development), PostgreSQL (production)
- **Authentication**: JWT tokens
- **API Documentation**: Swagger/OpenAPI
- **Task Queue**: Celery (for notifications)

### Frontend (Web Dashboard)
- **Framework**: React 18
- **State Management**: Redux Toolkit
- **UI Components**: Material-UI / Ant Design
- **HTTP Client**: Axios
- **Routing**: React Router v6

### Mobile (Planned)
- **Framework**: React Native
- **Navigation**: React Navigation
- **State Management**: Redux Toolkit
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
npm start
```

The web application will be available at `http://localhost:3000`

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - Student registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token

### Stalls
- `GET /api/stalls` - List all stalls
- `GET /api/stalls/{id}` - Get stall details
- `GET /api/stalls/{id}/menu` - Get stall menu

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/{id}` - Get order details
- `PUT /api/orders/{id}/status` - Update order status
- `GET /api/orders/user/{user_id}` - Get user's orders

### Queue Management
- `GET /api/queue/{stall_id}` - Get queue status
- `POST /api/queue/join` - Join virtual queue
- `GET /api/queue/position/{order_id}` - Get queue position

## 🗄️ Database Schema

### Core Tables
- **users** - Student and stall owner accounts
- **stalls** - Food stall information
- **menu_items** - Menu items for each stall
- **orders** - Order transactions
- **order_items** - Items within each order
- **queue** - Virtual queue entries
- **reviews** - User reviews and ratings

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS configuration for production
- Environment variables for sensitive data

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest tests/
```

### Frontend Tests
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