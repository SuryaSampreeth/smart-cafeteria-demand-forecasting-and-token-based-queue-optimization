const Booking = require('../models/Booking');
const Slot = require('../models/Slot');
const { generateTokenNumber } = require('../utils/tokenGenerator');
const { getNextQueuePosition, updateQueuePositions } = require('../utils/queueManager');
const { calculateWaitingTime } = require('../utils/waitingTime');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private (Student)
const createBooking = async (req, res) => {
    try {
        const { slotId, items } = req.body;

        // Check slot availability
        const slot = await Slot.findById(slotId);
        if (!slot) {
            return res.status(404).json({ message: 'Slot not found' });
        }

        if (slot.currentBookings >= slot.capacity) {
            return res.status(400).json({ message: 'Slot is full' });
        }

        // Generate token number
        const tokenNumber = await generateTokenNumber(slotId, slot.name);

        // Get queue position
        const queuePosition = await getNextQueuePosition(slotId);

        // Calculate waiting time
        const estimatedWaitTime = calculateWaitingTime(queuePosition);

        // Create booking
        const booking = await Booking.create({
            studentId: req.user._id,
            slotId,
            tokenNumber,
            items,
            queuePosition,
            estimatedWaitTime,
        });

        // Update slot bookings count
        slot.currentBookings += 1;
        await slot.save();

        // Populate booking details
        const populatedBooking = await Booking.findById(booking._id)
            .populate('slotId', 'name startTime endTime')
            .populate('items.menuItemId', 'name price imageUrl');

        res.status(201).json(populatedBooking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all active tokens for student
// @route   GET /api/bookings/my-tokens
// @access  Private (Student)
const getMyTokens = async (req, res) => {
    try {
        const bookings = await Booking.find({
            studentId: req.user._id,
            status: { $in: ['pending', 'serving'] },
        })
            .populate('slotId', 'name startTime endTime')
            .populate('items.menuItemId', 'name price imageUrl')
            .sort({ bookedAt: -1 });

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get specific booking
// @route   GET /api/bookings/:id
// @access  Private (Student)
const getBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('slotId', 'name startTime endTime')
            .populate('items.menuItemId', 'name price imageUrl category');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check if booking belongs to user
        if (booking.studentId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Modify booking
// @route   PUT /api/bookings/:id
// @access  Private (Student)
const modifyBooking = async (req, res) => {
    try {
        const { items } = req.body;

        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check ownership
        if (booking.studentId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Check if booking can be modified
        if (booking.status !== 'pending') {
            return res.status(400).json({
                message: 'Cannot modify booking. Status: ' + booking.status
            });
        }

        // Update items
        const oldItems = JSON.stringify(booking.items);
        booking.items = items;
        booking.modificationHistory.push({
            modifiedAt: new Date(),
            changes: `Items changed from ${oldItems} to ${JSON.stringify(items)}`,
        });

        await booking.save();

        const updatedBooking = await Booking.findById(booking._id)
            .populate('slotId', 'name startTime endTime')
            .populate('items.menuItemId', 'name price imageUrl');

        res.json(updatedBooking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cancel booking
// @route   DELETE /api/bookings/:id
// @access  Private (Student)
const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check ownership
        if (booking.studentId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Check if booking can be cancelled
        if (booking.status !== 'pending') {
            return res.status(400).json({
                message: 'Cannot cancel booking. Status: ' + booking.status
            });
        }

        // Update booking status
        booking.status = 'cancelled';
        booking.cancelledAt = new Date();
        await booking.save();

        // Update slot capacity
        const slot = await Slot.findById(booking.slotId);
        if (slot) {
            slot.currentBookings = Math.max(0, slot.currentBookings - 1);
            await slot.save();
        }

        // Update queue positions
        await updateQueuePositions(booking.slotId, booking.queuePosition);

        res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all bookings for student (including past)
// @route   GET /api/bookings/all
// @access  Private (Student)
const getAllMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({
            studentId: req.user._id,
        })
            .populate('slotId', 'name startTime endTime')
            .populate('items.menuItemId', 'name price imageUrl')
            .sort({ bookedAt: -1 });

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createBooking,
    getMyTokens,
    getBooking,
    modifyBooking,
    cancelBooking,
    getAllMyBookings,
};
