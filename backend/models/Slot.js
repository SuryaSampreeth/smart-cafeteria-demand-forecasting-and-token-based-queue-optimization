const mongoose = require('mongoose');

/*
 * This Schema defines the time slots for meals.
 * Examples: Breakfast (7:00-9:00), Lunch (12:00-2:00).
 */
const slotSchema = new mongoose.Schema({
    // Name of the meal slot (breakfast, lunch, snacks, dinner)
    name: {
        type: String,
        required: true,
        enum: ['Breakfast', 'Lunch', 'Snacks', 'Dinner'],
    },
    // Starting time of the slot
    startTime: {
        type: String,
        required: true,
    },
    // Ending time of the slot
    endTime: {
        type: String,
        required: true,
    },
    // Maximum number of users allowed in this slot
    capacity: {
        type: Number,
        required: true,
        default: 50,
    },
    // Current number of active bookings for this slot
    currentBookings: {
        type: Number,
        default: 0,
    },
    // Whether this slot is currently active or disabled (disabled if the max capacity is reached)
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Slot', slotSchema);
