import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import StudentDashboard from './student/StudentDashboard';
import StaffDashboard from './staff/StaffDashboard';
import AdminDashboard from './admin/AdminDashboard';

const Dashboard = () => {
    const { user } = useContext(AuthContext);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Role-based routing within Dashboard
    if (user.role === 'student') return <StudentDashboard user={user} />;
    if (user.role === 'staff') return <StaffDashboard user={user} />;
    if (user.role === 'admin') return <AdminDashboard user={user} />;

    return (
        <div className="container" style={{ textAlign: 'center', marginTop: '20vh' }}>
            <h2>No Dashboard Available</h2>
            <p>Your user role ({user.role}) does not have an assigned dashboard.</p>
        </div>
    );
};

export default Dashboard;
