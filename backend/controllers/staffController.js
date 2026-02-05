const Booking = require('../models/Booking');
const { recalculateQueueAfterServing } = require('../utils/queueManager');

// @desc    Get queue for a slot
// @route   GET /api/staff/queue/:slotId
// @access  Private (Staff)
const getQueueForSlot = async (req, res) => {
    try {
        const { slotId } = req.params;

        const bookings = await Booking.find({
            slotId,
            status: { $in: ['pending', 'serving'] },
        })
            .populate('studentId', 'name email registrationNumber')
            .populate('items.menuItemId', 'name category')
            .sort({ queuePosition: 1 });

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Call next token in queue
// @route   POST /api/staff/call-next/:slotId
// @access  Private (Staff)
const callNextToken = async (req, res) => {
    try {
        const { slotId } = req.params;

        // Find the first pending booking
        const nextBooking = await Booking.findOne({
            slotId,
            status: 'pending',
        })
            .sort({ queuePosition: 1 })
            .populate('studentId', 'name email')
            .populate('items.menuItemId', 'name');

        if (!nextBooking) {
            return res.status(404).json({ message: 'No pending tokens in queue' });
        }

        // Mark as serving
        nextBooking.status = 'serving';
        await nextBooking.save();

        res.json(nextBooking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark token as serving
// @route   PUT /api/staff/mark-serving/:bookingId
// @access  Private (Staff)
const markAsServing = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.bookingId);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.status !== 'pending') {
            return res.status(400).json({
                message: 'Can only mark pending bookings as serving'
            });
        }

        booking.status = 'serving';
        await booking.save();

        const updatedBooking = await Booking.findById(booking._id)
            .populate('studentId', 'name email')
            .populate('items.menuItemId', 'name');

        res.json(updatedBooking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark token as served
// @route   PUT /api/staff/mark-served/:bookingId
// @access  Private (Staff)
const markAsServed = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.bookingId);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.status !== 'serving') {
            return res.status(400).json({
                message: 'Can only mark serving bookings as served'
            });
        }

        booking.status = 'served';
        booking.servedAt = new Date();
        await booking.save();

        // Recalculate queue positions for remaining pending tokens
        await recalculateQueueAfterServing(booking.slotId);

        res.json({ message: 'Token marked as served', booking });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getQueueForSlot,
    callNextToken,
    markAsServing,
    markAsServed,
};
