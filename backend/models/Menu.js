const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
    slotId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Slot',
        required: true,
    },
    menuItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
    }],
    date: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

// Index for efficient querying
menuSchema.index({ slotId: 1, date: 1 });

module.exports = mongoose.model('Menu', menuSchema);
