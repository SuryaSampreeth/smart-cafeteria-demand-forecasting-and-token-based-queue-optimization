const Booking = require('../models/Booking');

// Generate unique token number for a slot
const generateTokenNumber = async (slotId, slotName) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Count bookings for this slot today
    const count = await Booking.countDocuments({
        slotId,
        bookedAt: { $gte: today },
    });

    // Generate token: B001, L001, S001, D001
    const prefix = slotName.charAt(0).toUpperCase();
    const number = String(count + 1).padStart(3, '0');

    return `${prefix}${number}`;
};

module.exports = { generateTokenNumber };
