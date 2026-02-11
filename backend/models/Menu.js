const mongoose = require('mongoose');

/*
 * This schema is used to map menu items to a specific time slot.
 * It defines which food items are available for each meal slot.
 */
const menuSchema = new mongoose.Schema({
    // Reference to the slot (for example: breakfast or lunch)
    slotId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Slot',
        required: true,
    },
    // List of menu items available in this slot
    menuItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
    }],
    // Date on which this menu is applicable
    date: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

// Index added to quickly fetch menu by slot and date
menuSchema.index({ slotId: 1, date: 1 });

module.exports = mongoose.model('Menu', menuSchema);
