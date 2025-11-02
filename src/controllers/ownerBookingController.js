// controllers/ownerBookingController.js
const Booking = require("../models/Booking");

exports.listOwnerBookings = async (req, res) => {
    try {
        const { from, to, status, paymentOption } = req.query;

        // ownerId lấy từ token (middleware auth đã gắn vào req.user)
        const ownerId = req.user._id;

        const filter = {};

        // chỉ lấy booking thuộc các sân nhỏ của owner đó
        filter.ownerId = ownerId;

        if (status) filter.status = status;
        if (paymentOption) filter.paymentOption = paymentOption;

        if (from || to) {
            filter.createdAt = {};
            if (from) filter.createdAt.$gte = new Date(from);
            if (to) filter.createdAt.$lte = new Date(to);
        }

        const bookings = await Booking.find(filter)
            .populate("subPitchId", "name")
            .populate("userId", "name email")
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (err) {
        console.error("Owner bookings fetch error:", err.message);
        res.status(500).json({ message: err.message });
    }
};
