const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    category: {
        type: String,
        enum: ['veg', 'non-veg', 'beverage', 'dessert'],
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    imageUrl: {
        type: String,
        default: 'https://via.placeholder.com/150',
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
