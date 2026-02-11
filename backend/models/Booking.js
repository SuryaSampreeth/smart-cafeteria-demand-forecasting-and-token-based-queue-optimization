const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    slotId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Slot',
        required: true,
    },
    tokenNumber: {
        type: String,
        required: true,
    },
    items: [{
        menuItemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MenuItem',
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
    }],
    queuePosition: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'serving', 'served', 'cancelled'],
        default: 'pending',
    },
    estimatedWaitTime: {
        type: Number, // in minutes
        default: 0,
    },
    bookedAt: {
        type: Date,
        default: Date.now,
    },
    servedAt: {
        type: Date,
    },
    cancelledAt: {
        type: Date,
    },
    modificationHistory: [{
        modifiedAt: Date,
        changes: String,
    }],
}, {
    timestamps: true,
});

// Indexes for efficient querying
bookingSchema.index({ studentId: 1, status: 1 });
bookingSchema.index({ slotId: 1, status: 1, queuePosition: 1 });
bookingSchema.index({ tokenNumber: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
