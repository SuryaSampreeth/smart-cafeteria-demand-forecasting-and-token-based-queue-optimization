const User = require('../models/User');
const Booking = require('../models/Booking');
const Slot = require('../models/Slot');

// @desc    Register staff member
// @route   POST /api/admin/staff
// @access  Private (Admin)
const registerStaff = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create staff user
        const staff = await User.create({
            name,
            email,
            password,
            role: 'staff',
        });

        res.status(201).json({
            _id: staff._id,
            name: staff.name,
            email: staff.email,
            role: staff.role,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all staff members
// @route   GET /api/admin/staff
// @access  Private (Admin)
const getAllStaff = async (req, res) => {
    try {
        const staff = await User.find({ role: 'staff' }).select('-password');
        res.json(staff);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete staff member
// @route   DELETE /api/admin/staff/:id
// @access  Private (Admin)
const deleteStaff = async (req, res) => {
    try {
        const staff = await User.findById(req.params.id);

        if (!staff) {
            return res.status(404).json({ message: 'Staff not found' });
        }

        if (staff.role !== 'staff') {
            return res.status(400).json({ message: 'Can only delete staff members' });
        }

        await User.findByIdAndDelete(req.params.id);

        res.json({ message: 'Staff member removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get dashboard analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin)
const getAnalytics = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Total bookings today
        const totalBookingsToday = await Booking.countDocuments({
            bookedAt: { $gte: today },
        });

        // Active tokens
        const activeTokens = await Booking.countDocuments({
            status: { $in: ['pending', 'serving'] },
        });

        // Served tokens today
        const servedToday = await Booking.countDocuments({
            status: 'served',
            servedAt: { $gte: today },
        });

        // Cancelled bookings today
        const cancelledToday = await Booking.countDocuments({
            status: 'cancelled',
            cancelledAt: { $gte: today },
        });

        // Total students
        const totalStudents = await User.countDocuments({ role: 'student' });

        // Total staff
        const totalStaff = await User.countDocuments({ role: 'staff' });

        // Calculate total revenue from served bookings today
        const servedBookings = await Booking.find({
            status: 'served',
            servedAt: { $gte: today },
        }).populate('items.menuItemId', 'price');

        let totalRevenue = 0;
        servedBookings.forEach(booking => {
            booking.items.forEach(item => {
                totalRevenue += item.menuItemId.price * item.quantity;
            });
        });

        res.json({
            totalBookingsToday,
            activeTokens,
            servedToday,
            cancelledToday,
            totalStudents,
            totalStaff,
            totalRevenue,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get slot-wise booking data
// @route   GET /api/admin/analytics/slot-wise
// @access  Private (Admin)
const getSlotWiseData = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const slotData = await Booking.aggregate([
            {
                $match: {
                    bookedAt: { $gte: today },
                },
            },
            {
                $group: {
                    _id: '$slotId',
                    totalBookings: { $sum: 1 },
                    pending: {
                        $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
                    },
                    serving: {
                        $sum: { $cond: [{ $eq: ['$status', 'serving'] }, 1, 0] },
                    },
                    served: {
                        $sum: { $cond: [{ $eq: ['$status', 'served'] }, 1, 0] },
                    },
                },
            },
        ]);

        // Populate slot names
        const slots = await Slot.find({});
        const result = slotData.map((data) => {
            const slot = slots.find((s) => s._id.toString() === data._id.toString());
            return {
                slotName: slot ? slot.name : 'Unknown',
                ...data,
            };
        });

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get staff performance metrics
// @route   GET /api/admin/analytics/staff-performance
// @access  Private (Admin)
const getStaffPerformance = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // For now, return served tokens count
        // In a real app, you'd track which staff member served which token
        const servedCount = await Booking.countDocuments({
            status: 'served',
            servedAt: { $gte: today },
        });

        const staffCount = await User.countDocuments({ role: 'staff' });

        res.json({
            totalServed: servedCount,
            staffCount,
            averagePerStaff: staffCount > 0 ? Math.round(servedCount / staffCount) : 0,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerStaff,
    getAllStaff,
    deleteStaff,
    getAnalytics,
    getSlotWiseData,
    getStaffPerformance,
};
