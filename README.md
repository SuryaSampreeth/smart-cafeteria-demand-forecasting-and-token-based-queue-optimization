# Smart Cafeteria – Developer Documentation

---

## Table of Contents

## Table of Contents

- [Project Overview & Objectives](#1-project-overview--objectives)
- [Project Architecture](#2-project-architecture)
- [Technology Stack](#3-technology-stack)
- [Project Folder Structure](#4-project-folder-structure)
- [Setup & Installation](#5-setup--installation)
- [Key Features & Workflows](#6-key-features--workflows)
- [API Reference](#7-api-reference-core-endpoints)
- [Deployment Guide](#8-deployment-guide)
- [Future Scope](#9-future-scope)
- [Contributing](#10-contributing)
- [License](#license)


## 1. Project Overview & Objectives

### Problem Overview

Campus cafeterias often experience issues such as long waiting queues, uneven crowd distribution, inefficient resource utilization, and food wastage. Traditional systems typically operate on a first-come-first-served basis and lack mechanisms to predict demand or manage service flow effectively. This project aims to develop an **intelligent cafeteria management platform** that uses data-driven insights and predictive analytics to improve operational efficiency, reduce food waste, and enhance the overall dining experience for students. By integrating forecasting, scheduling, and real-time monitoring, the system helps both users and administrators make informed decisions about meal planning and service management.

**Key objectives of the system include:**

* Enabling students to **pre-book meal slots** to reduce queues and manage crowd flow.
* Predicting **expected waiting times and crowd levels** using historical demand patterns, weather conditions, and academic schedules.
* Applying **AI/ML-based forecasting** to estimate food demand and assist in preparation planning.
* Implementing **token-based queue scheduling** to ensure organized and fair meal distribution.
* Providing **real-time occupancy dashboards** for administrators to monitor cafeteria usage.
* Ensuring **ethical and fair access to meal services** through transparent slot allocation.

---

## 2. Project Architecture

```mermaid
mermaid
flowchart TD

    %% Client Layer
    subgraph Client
        A[Mobile App - Expo]
        B[Web Dashboard - Expo]
    end

    %% Backend Layer
    subgraph Backend
        D[Express Server]
        E[Auth Middleware]
        F[Role Middleware]
        G[Auth Controller]
        H[Booking Controller]
        I[Menu Controller]
        J[Crowd Controller]
        K[Admin Controller]
        L[Staff Controller]
    end

    %% Database Layer
    subgraph Database
        M[(MongoDB Atlas)]
    end

    %% Flow
    A --> D
    B --> D

    D --> E
    E --> F

    F --> G
    F --> H
    F --> I
    F --> J
    F --> K
    F --> L

    G --> M
    H --> M
    I --> M
    J --> M
    K --> M
    L --> M
```

### Role Breakdown
- **Frontend Developer** 
- **Backend Developer**
- **Frontend-Backend developer**

---

## 3. Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React Native (Expo), React Navigation, Context API, Axios, Chart Kit |
| **Backend** | Node.js, Express.js, JWT, bcryptjs |
| **ML Service** | **Python, Flask, TensorFlow, Pandas, Scikit-learn** |
| **Database** | MongoDB Atlas |
| **Dev Tools** | GitHub, Open-Project, Vercel, Render|

---

## 4. Project Folder Structure

```text
smart-cafeteria/
│
├── frontend/                # React Native Mobile Application
│   ├── src/
│   │   ├── components/      # Common & Feature-specific UI
│   │   ├── screens/         # Organized by Student, Staff, Admin
│   │   ├── context/         # Auth & Global State management
│   │   ├── navigation/      # Stack & Tab based routing
│   │   └── services/        # Axios API service layer
│
├── backend/                 # API Server & Business Logic
│   ├── controllers/         # Logic for Auth, Booking, Crowd, Menu
│   ├── routes/              # API Endpoints mapping
│   ├── models/              # MongoDB/Mongoose Schemas
│   ├── services/            # Background Workers (Crowd Tracking, Alerts)
│   ├── utils/               # Token generation & Queue Managers
│   ├── ml_service/          # Python/Flask Machine Learning Hub
│   │   ├── app.py           # ML API Entry Point (Port 5001)
│   │   ├── models/          # Trained Model Binaries (XGBoost, LSTM)
│   │   └── data/            # Processed Datasets
│   └── server.js            # Node.js Application Entry Point (Port 5000)
│
└── QUICKSTART.md            # Rapid setup instructions
```

---

## 5. Setup & Installation

### Prerequisites
- Node.js (v16+) & Python (3.9+)
- MongoDB Atlas Account
- Expo Go App (for mobile testing)

### Role-Based Setup

#### **1. Backend & General Setup**
```bash
cd backend
npm install
# Configure .env with MONGODB_URI and JWT_SECRET
npm run seed  # Create admin & initial slots
npm run dev   # Start Node server on port 5000
```

#### **2. ML Service Setup (Full-Stack/Backend Roles)**
```bash
cd backend/ml_service
pip install -r requirements.txt
python app.py  # Start ML API on port 5001
```

#### **3. Frontend Setup**
```bash
cd frontend
npm install
# Set EXPO_PUBLIC_API_URL in .env to your Local IP
npx expo start
```

---

## 6. Key Features & Workflows

### User Authentication & RBAC
- **Student**: Booking, live crowd monitor, historical patterns.
- **Staff**: Queue management, peak-load alerts, serving speed recs.
- **Admin**: Menu management, user control, system-wide analytics.

### Crowd Monitoring & Forecasting
1. **Real-time Tracking**: `crowdTrackingService.js` takes snapshots every 2 minutes.
3. **ML Forecasting**: The Python service provides daily/weekly demand predictions using XGBoost and LSTM models and SARIMA models.

### Sustainability & Fairness
- **Waste & Sustainability Reports**: Waste and Sustainability Reports for the admin using the Cancelled, Served, Expired Bookings. `WasteTrackingScreen.js` and `SustainabilityScreen.js` handles this.
- **Fair Allocation**: The token-based system ensures "First-In, First-Out" (FIFO) integrity.

---

## 7. API Reference (Core Endpoints)

| Endpoint | Method | Role | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/login` | POST | All | Secure JWT authentication |
| `/api/bookings` | POST | Student | Place meal booking & get token |
| `/api/crowd/current` | GET | All | Current cafeteria occupancy |
| `/api/forecast/daily` | GET | Admin | ML-driven 7-day demand forecast |
| `/api/staff/call-token`| POST | Staff | Advance the serving queue |

---

## 8. Deployment Guide

### Frontend
Platform: **Vercel**  
https://smart-cafeteria-web-deployment.vercel.app/

### Backend
Platform: **Render**  
https://backend-api-rxpg.onrender.com/api

### ML Service
Platform: **Render**  
https://ml-service-azkv.onrender.com/

## 9. Future Scope

1. Integration of online payment apps and wallets
2. Personalized meal recommendations using AI
3. Expansion to multiple campus cafeterias
4. Dynamic pricing for waste reduction
   
## 10. Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (git checkout -b feature/YourFeature)
3. Commit your changes (git commit -m 'Add YourFeature')
4. Push to the branch (git push origin feature/YourFeature)
5. Open a Pull Request

## License

This project is licensed under the MIT License.


