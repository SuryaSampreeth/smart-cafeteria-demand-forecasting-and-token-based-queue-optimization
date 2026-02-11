const express = require('express');
const router = express.Router();
const {
    createBooking,
    getMyTokens,
    getBooking,
    modifyBooking,
    cancelBooking,
    getAllMyBookings,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

// All routes require authentication and student role
router.use(protect);
router.use(checkRole('student'));

router.post('/', createBooking);
router.get('/my-tokens', getMyTokens);
router.get('/all', getAllMyBookings);
router.get('/:id', getBooking);
router.put('/:id', modifyBooking);
router.delete('/:id', cancelBooking);

module.exports = router;
