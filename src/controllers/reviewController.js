// src/controllers/reviewController.js
const Review = require("../models/Review");
const Booking = require("../models/Booking");
const SubPitch = require("../models/SubPitch");
const Venue = require("../models/Venue");

exports.submitReview = async (req, res) => {
    try {
        const { bookingId, rating, comment } = req.body;
        const userId = req.user.id;

        // 1️⃣ Kiểm tra booking hợp lệ và đã hoàn thành
        const booking = await Booking.findOne({
            _id: bookingId,
            userId,
            status: "completed",
        }).populate({
            path: "subPitchId",
            populate: { path: "venueId" },
        });

        if (!booking) {
            return res.status(403).json({
                error: "Không thể đánh giá: Booking không hợp lệ hoặc chưa hoàn thành",
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: "Điểm đánh giá phải từ 1 đến 5" });
        }

        const subPitchId = booking.subPitchId._id;
        const venueId = booking.subPitchId.venueId._id;

        // 2️⃣ Kiểm tra đã review chưa
        const existing = await Review.findOne({ bookingId, userId });
        if (existing) {
            return res.status(400).json({ error: "Bạn đã đánh giá cho booking này rồi!" });
        }

        // 3️⃣ Tạo review mới
        const review = new Review({
            bookingId,
            subPitchId,
            userId,
            rating,
            comment: comment?.trim(),
        });
        await review.save();

        // 4️⃣ Tính lại rating trung bình cho venue
        const stats = await Review.aggregate([
            {
                $lookup: {
                    from: "sub_pitches",
                    localField: "subPitchId",
                    foreignField: "_id",
                    as: "subPitch",
                },
            },
            { $unwind: "$subPitch" },
            { $match: { "subPitch.venueId": venueId } },
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: "$rating" },
                    count: { $sum: 1 },
                },
            },
        ]);

        const avg = stats[0]?.avgRating || 0;
        const count = stats[0]?.count || 0;

        // 5️⃣ Cập nhật rating venue
        await Venue.findByIdAndUpdate(venueId, {
            ratingAvg: Number(avg.toFixed(1)),
            ratingCount: count,
        });

        res.status(201).json({
            success: true,
            message: "Cảm ơn bạn đã đánh giá!",
            data: {
                ratingAvg: avg.toFixed(1),
                ratingCount: count,
            },
        });
    } catch (error) {
        console.error("Submit review error:", error);
        res.status(500).json({ error: "Lỗi server" });
    }
};


// LẤY DANH SÁCH REVIEW CỦA MỘT SÂN
exports.getReviewsByVenue = async (req, res) => {
    try {
        const { venueId } = req.params;

        // 🔹 B1: Lấy danh sách _id của các sân con thuộc venue này
        const subPitches = await SubPitch.find({ venueId }).select("_id");

        // Nếu không có sân con thì trả về mảng rỗng để frontend vẫn render được
        if (!subPitches.length) {
            return res.json([]);
        }

        const subPitchIds = subPitches.map(sp => sp._id);

        // 🔹 B2: Lấy danh sách review theo các subPitch này
        const reviews = await Review.find({ subPitchId: { $in: subPitchIds } })
            .populate({
                path: "userId",
                select: "name", // frontend cần hiển thị tên người dùng
            })
            .populate({
                path: "subPitchId",
                select: "name", // frontend cần hiển thị tên sân con
            })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean(); // tăng hiệu suất (convert sang plain object)

        // 🔹 B3: Trả dữ liệu
        res.status(200).json(reviews);
    } catch (error) {
        console.error("Lỗi khi lấy review theo venue:", error);
        res.status(500).json({ error: "Lỗi server, không thể lấy danh sách review." });
    }
};
