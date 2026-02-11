const express = require('express');
const router = express.Router();
const {
    getQueueForSlot,
    callNextToken,
    markAsServing,
    markAsServed,
} = require('../controllers/staffController');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

// All routes require authentication and staff role
router.use(protect);
router.use(checkRole('staff'));

router.get('/queue/:slotId', getQueueForSlot);
router.post('/call-next/:slotId', callNextToken);
router.put('/mark-serving/:bookingId', markAsServing);
router.put('/mark-served/:bookingId', markAsServed);

module.exports = router;
