# Smart Cafeteria Web Client

This is the ReactJS web frontend for the Smart Cafeteria Management System.

## Features

- **Modern UI**: Utilizing glassmorphism, vibrant gradients, and smooth animations.
- **Role-Based Access**: separate views for Students, Staff, and Admins.
- **Secure Authentication**: JWT-based login and registration.
- **Dynamic Menu**: Real-time menu updates (fetched from backend).

## Tech Stack

- **Framework**: React 19 (via Vite)
- **Styling**: Vanilla CSS (CSS Variables + Utility Classes)
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Start Development Server**:
    ```bash
    npm run dev
    ```
    The app will run at `http://localhost:5173`.

3.  **Build for Production**:
    ```bash
    npm run build
    ```

## Project Structure

- `src/components/`: Reusable UI components (Navbar, MenuCard, etc.)
- `src/context/`: Global state management (AuthContext)
- `src/pages/`: Application views (Login, Register, Dashboard, Menu)
- `src/services/`: API services and configuration
- `src/index.css`: Global styles and theme definitions

## Backend Integration

Ensure the backend server is running on `http://localhost:5000`. The API base URL is configured in `src/services/api.js`.
