const express = require('express');
const router = express.Router();
const {
    getAllSlots,
    createSlot,
    updateSlot,
    getAllMenuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    getMenuForSlot,
    assignMenuToSlot,
} = require('../controllers/menuController');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

// Public routes
router.get('/slots', getAllSlots);
router.get('/items', getAllMenuItems);
router.get('/slot/:slotId', getMenuForSlot);

// Admin only routes
router.post('/slots', protect, checkRole('admin'), createSlot);
router.put('/slots/:id', protect, checkRole('admin'), updateSlot);
router.post('/items', protect, checkRole('admin'), addMenuItem);
router.put('/items/:id', protect, checkRole('admin'), updateMenuItem);
router.delete('/items/:id', protect, checkRole('admin'), deleteMenuItem);
router.post('/slot/:slotId', protect, checkRole('admin'), assignMenuToSlot);

module.exports = router;
