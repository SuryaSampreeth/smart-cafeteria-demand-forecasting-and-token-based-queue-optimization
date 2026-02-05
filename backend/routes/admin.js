const express = require('express');
const router = express.Router();
const {
    registerStaff,
    getAllStaff,
    deleteStaff,
    getAnalytics,
    getSlotWiseData,
    getStaffPerformance,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

// All routes require authentication and admin role
router.use(protect);
router.use(checkRole('admin'));

router.post('/staff', registerStaff);
router.get('/staff', getAllStaff);
router.delete('/staff/:id', deleteStaff);
router.get('/analytics', getAnalytics);
router.get('/analytics/slot-wise', getSlotWiseData);
router.get('/analytics/staff-performance', getStaffPerformance);

module.exports = router;
