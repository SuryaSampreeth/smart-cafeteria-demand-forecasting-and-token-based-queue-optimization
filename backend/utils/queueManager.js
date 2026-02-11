const Booking = require('../models/Booking');

// Get current queue position for a slot
const getNextQueuePosition = async (slotId) => {
    const maxPosition = await Booking.findOne({
        slotId,
        status: { $in: ['pending', 'serving'] },
    })
        .sort({ queuePosition: -1 })
        .select('queuePosition');

    return maxPosition ? maxPosition.queuePosition + 1 : 1;
};

// Update queue positions after cancellation
const updateQueuePositions = async (slotId, cancelledPosition) => {
    await Booking.updateMany(
        {
            slotId,
            queuePosition: { $gt: cancelledPosition },
            status: { $in: ['pending', 'serving'] },
        },
        {
            $inc: { queuePosition: -1 },
        }
    );
};

// Recalculate queue positions after serving
const recalculateQueueAfterServing = async (slotId) => {
    const pendingBookings = await Booking.find({
        slotId,
        status: 'pending',
    }).sort({ queuePosition: 1 });

    for (let i = 0; i < pendingBookings.length; i++) {
        pendingBookings[i].queuePosition = i + 1;
        await pendingBookings[i].save();
    }
};

module.exports = {
    getNextQueuePosition,
    updateQueuePositions,
    recalculateQueueAfterServing,
};
