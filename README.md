# Smart Cafeteria Demand Forecasting and Token-Based Queue Optimisation System

## Introduction

This project aims to develop an intelligent cafeteria management platform that uses data-driven insights to optimize food service operations, minimize waste, and improve student experience. Instead of implementing a simple food-ordering interface, the platform allows users to prebook meal slots, forecast expected crowd levels, and receive predicted waiting times based on historical demand patterns, weather conditions, or academic schedules. 

AI/ML forecasting supports preparation planning to reduce waste, balance resource utilization, and improve sustainability. Token-based queue scheduling, real-time occupancy dashboards, and supply–demand analytics are incorporated. Ethical and sustainability considerations—such as transparent allocation fairness, reduction of unnecessary food discard, and support for equitable serving—drive system design and evaluation.

## Project Objectives

- **Improve cafeteria efficiency and student dining experience**
- **Reduce overcrowding, waiting time, and food wastage**
- **Enable fair and transparent meal serving through slot-based tokens**
- **Provide data-driven insights for better planning and resource allocation**

## User Roles & Features

### Student Module

- **Book meals based on available time slots** - Pre-order meals for specific time slots to avoid queues
- **View daily menu and real-time crowd status** - Access current menu items and live cafeteria occupancy
- **Track booking status** - Monitor orders through pending, active, and completed states
- **Access last 7 days' crowd patterns** - View historical crowd data with hourly graphs for informed decision-making
- **Receive predicted waiting times** - Get estimates based on current crowd levels and booking patterns
- **Manage profile** - Update personal information and preferences

### Staff Module

- **Dashboard showing current capacity and active tokens** - Real-time overview of cafeteria operations
- **Call next token and mark meals as completed** - Efficient order fulfillment workflow
- **Crowd alerts during peak load** - Notifications when cafeteria reaches high occupancy
- **Serving speed recommendations** - Data-driven suggestions based on current crowd level
- **Order queue management** - View and process pending orders systematically

### Admin Module

- **Sync daily bookings with active tokens** - Ensure token system reflects current bookings
- **Register and manage staff accounts** - Control staff access and permissions
- **Manage menu items** - Add, update, and remove menu items with pricing and availability
- **View crowd analysis** - Access peak hours, occupancy summary, and system alerts
- **Export reports in CSV format** - Generate downloadable reports for analysis
- **Dashboard statistics** - Monitor active tokens, served orders, revenue, cancelled bookings, and user counts

## Key Features

### Core Functionality

- **User Authentication** - Secure registration and login system with JWT-based authentication
- **Role-Based Access Control** - Separate interfaces and permissions for students, staff, and administrators
- **Menu Management** - Dynamic menu system with item availability, pricing, and images
- **Token-Based Queue Management** - Slot-based booking system with auto-expiry by time slot
- **Real-Time Crowd Monitoring** - Live occupancy tracking and statistics
- **Booking System** - Pre-order meals with token-based queue management

### Advanced Features

- **Crowd Forecasting** - Historical data-driven insights for demand prediction
- **Waiting Time Prediction** - Estimated wait times based on current and historical patterns
- **Peak Hour Analysis** - Identify high-traffic periods for better resource planning
- **Alert System** - Automated notifications for staff during peak loads
- **Analytics Dashboard** - Comprehensive statistics including revenue tracking and user metrics
- **Historical Data Visualization** - 7-day crowd pattern charts with hourly breakdowns
- **CSV Export** - Download reports for offline analysis

### Sustainability & Fairness Focus

- **Reduces unnecessary food preparation and wastage** - Demand forecasting enables accurate preparation planning
- **Ensures fair serving order and transparent allocation** - Token-based system prevents queue jumping
- **Supports balanced resource usage during peak hours** - Staff recommendations optimize service delivery
- **Promotes ethical food service operations** - Data-driven decisions reduce environmental impact

## Tech Stack

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **Password Security**: bcryptjs for password hashing
- **Validation**: express-validator
- **Environment Management**: dotenv
- **CORS**: Cross-Origin Resource Sharing enabled
- **Development Tools**: Nodemon for hot reloading

### Frontend

- **Framework**: React Native with Expo
- **Navigation**: React Navigation (Native Stack & Bottom Tabs)
- **State Management**: React Context API
- **HTTP Client**: Axios
- **UI Components**: Custom components with React Native
- **Charts**: react-native-chart-kit for data visualization
- **Secure Storage**: expo-secure-store for token management
- **Platform Support**: iOS, Android, and Web

## Project Structure

```
BeforeUIEnhance/
│
├── backend/
│   ├── config/
│   │   └── db.js                           # Database connection configuration
│   │
│   ├── controllers/
│   │   ├── adminController.js              # Admin operations logic
│   │   ├── authController.js               # Authentication logic
│   │   ├── bookingController.js            # Booking management logic
│   │   ├── crowdController.js              # Crowd tracking and analytics logic
│   │   ├── menuController.js               # Menu operations logic
│   │   └── staffController.js              # Staff operations logic
│   │
│   ├── middleware/
│   │   ├── auth.js                         # JWT authentication middleware
│   │   └── roleCheck.js                    # Role-based authorization middleware
│   │
│   ├── models/
│   │   ├── AlertLog.js                     # Alert logging schema
│   │   ├── Booking.js                      # Booking schema
│   │   ├── CrowdData.js                    # Real-time crowd data schema
│   │   ├── CrowdPrediction.js              # Crowd prediction schema
│   │   ├── Menu.js                         # Menu schema
│   │   ├── MenuItem.js                     # Menu item schema
│   │   ├── Slot.js                         # Time slot schema
│   │   └── User.js                         # User schema
│   │
│   ├── routes/
│   │   ├── admin.js                        # Admin routes
│   │   ├── auth.js                         # Authentication routes
│   │   ├── booking.js                      # Booking routes
│   │   ├── crowd.js                        # Crowd analytics routes
│   │   ├── menu.js                         # Menu routes
│   │   └── staff.js                        # Staff routes
│   │
│   ├── scripts/
│   │   ├── addMenuImages.js                # Add images to menu items
│   │   ├── checkQueueOrder.js              # Verify queue ordering
│   │   ├── fixQueueOrder.js                # Fix queue order issues
│   │   ├── listMenuItems.js                # List all menu items
│   │   ├── seedAdmin.js                    # Create admin user
│   │   ├── seedCrowdData.js                # Populate crowd data
│   │   ├── seedHistoricalPredictions.js    # Generate historical predictions
│   │   ├── testDbConnection.js             # Test database connectivity
│   │   ├── updateBookingWaitTimes.js       # Update waiting time estimates
│   │   ├── updateMenuImagesFromFile.js     # Batch update menu images
│   │   ├── updateToLocalImages.js          # Convert to local image paths
│   │   └── viewHistoricalData.js           # View historical crowd data
│   │
│   ├── services/
│   │   ├── alertService.js                 # Alert generation service
│   │   ├── crowdPredictionService.js       # Crowd forecasting service
│   │   └── crowdTrackingService.js         # Real-time crowd tracking
│   │
│   ├── utils/
│   │   ├── queueManager.js                 # Token queue management utilities
│   │   ├── tokenGenerator.js               # Token generation utilities
│   │   └── validators.js                   # Input validation utilities
│   │
│   ├── .env                                # Environment variables
│   ├── .gitignore                          # Git ignore rules
│   ├── menu_image_urls.md                  # Menu image reference
│   ├── package.json                        # Backend dependencies
│   └── server.js                           # Application entry point
│
├── frontend/
│   ├── assets/                             # Images and static assets
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Button.js               # Reusable button component
│   │   │   │   ├── Card.js                 # Card container component
│   │   │   │   ├── ErrorMessage.js         # Error display component
│   │   │   │   ├── Header.js               # Header component
│   │   │   │   └── Loader.js               # Loading indicator
│   │   │   ├── AlertCard.js                # Alert display component
│   │   │   ├── CrowdLevelIndicator.js      # Visual crowd level indicator
│   │   │   ├── CrowdPatternChart.js        # Historical crowd chart
│   │   │   └── WaitingTimeCard.js          # Waiting time display
│   │   │
│   │   ├── config/
│   │   │   └── config.js                   # App configuration
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.js              # Authentication context
│   │   │
│   │   ├── navigation/
│   │   │   └── AppNavigator.js             # Navigation configuration
│   │   │
│   │   ├── screens/
│   │   │   ├── admin/
│   │   │   │   ├── AdminCrowdAnalytics.js  # Crowd analytics dashboard
│   │   │   │   ├── AdminHomeScreen.js      # Admin dashboard
│   │   │   │   ├── ManageMenuScreen.js     # Menu management interface
│   │   │   │   └── ManageStaffScreen.js    # Staff management interface
│   │   │   │
│   │   │   ├── auth/
│   │   │   │   ├── LoginScreen.js          # User login
│   │   │   │   └── RegisterScreen.js       # User registration
│   │   │   │
│   │   │   ├── staff/
│   │   │   │   ├── QueueManagementScreen.js    # Order queue management
│   │   │   │   ├── StaffCrowdDashboard.js      # Staff crowd dashboard
│   │   │   │   └── StaffHomeScreen.js          # Staff home
│   │   │   │
│   │   │   └── student/
│   │   │       ├── BookingScreen.js            # Meal booking interface
│   │   │       ├── CrowdMonitorScreen.js       # Real-time crowd monitor
│   │   │       ├── CrowdPatternsScreen.js      # Historical crowd patterns
│   │   │       ├── MyTokensScreen.js           # Active tokens view
│   │   │       ├── ProfileScreen.js            # User profile
│   │   │       └── StudentHomeScreen.js        # Student home
│   │   │
│   │   ├── services/
│   │   │   └── api.js                      # API service layer
│   │   │
│   │   ├── styles/
│   │   │   ├── colors.js                   # Color palette
│   │   │   ├── commonStyles.js             # Shared styles
│   │   │   └── typography.js               # Typography definitions
│   │   │
│   │   └── utils/
│   │       ├── constants.js                # App constants
│   │       └── formatTime.js               # Time formatting utilities
│   │
│   ├── .env                                # Frontend environment variables
│   ├── .gitignore                          # Git ignore rules
│   ├── App.js                              # Application root component
│   ├── app.json                            # Expo configuration
│   ├── index.js                            # Entry point
│   └── package.json                        # Frontend dependencies
│
├── QUICKSTART.md                           # Quick start guide
└── README.md                               # This file
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB installation
- Expo CLI (for frontend development)
- npm or yarn package manager

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env`:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```

4. Seed the admin user (optional):
   ```bash
   npm run seed
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure the API endpoint in `src/config/config.js` to point to your backend server

4. Start the Expo development server:
   ```bash
   npx expo start --web
   ```

5. Run on your preferred platform:
   - Press `a` for Android
   - Press `i` for iOS
   - Press `w` for Web

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Bookings
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking status
- `DELETE /api/bookings/:id` - Cancel booking

### Menu
- `GET /api/menu` - Get all menu items
- `POST /api/menu` - Add menu item (Admin only)
- `PUT /api/menu/:id` - Update menu item (Admin only)
- `DELETE /api/menu/:id` - Delete menu item (Admin only)

### Crowd Analytics
- `GET /api/crowd/current` - Get current crowd level
- `GET /api/crowd/patterns` - Get historical crowd patterns
- `GET /api/crowd/predictions` - Get crowd predictions
- `GET /api/crowd/waiting-time` - Get estimated waiting time

### Staff
- `GET /api/staff/orders` - Get pending orders
- `PUT /api/staff/orders/:id` - Update order status
- `GET /api/staff/dashboard` - Get staff dashboard data
- `POST /api/staff/call-token` - Call next token

### Admin
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user details
- `GET /api/admin/crowd-analytics` - Get detailed crowd analytics
- `GET /api/admin/export-report` - Export data as CSV

## Future Scope

- **AI-based demand forecasting for preparation planning** - Machine learning models to predict meal demand
- **Improved crowd and waiting time prediction** - Enhanced algorithms using weather and academic calendar data
- **Integration with weather APIs** - Factor weather conditions into demand forecasting
- **Academic schedule integration** - Adjust predictions based on exam periods and class schedules

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add YourFeature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

This system is designed with a focus on sustainability, fairness, and efficiency in cafeteria operations. By leveraging data-driven insights and token-based queue management, we aim to create a better dining experience while minimizing food waste and promoting equitable service delivery.
