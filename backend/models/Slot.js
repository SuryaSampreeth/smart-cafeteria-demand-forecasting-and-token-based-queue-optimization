const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        enum: ['Breakfast', 'Lunch', 'Snacks', 'Dinner'],
    },
    startTime: {
        type: String,
        required: true,
    },
    endTime: {
        type: String,
        required: true,
    },
    capacity: {
        type: Number,
        required: true,
        default: 50,
    },
    currentBookings: {
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Slot', slotSchema);
