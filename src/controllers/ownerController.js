const mongoose = require("mongoose");
const { Venue, SubPitch, Booking, Payment, Review } = require("../models");

/**
 * Lấy ngày bắt đầu và kết thúc (mặc định 30 ngày qua)
 * @param {object} query - req.query
 * @returns {object} { from, to }
 */
const getSafeDateRange = (query) => {
  // Mặc định 30 ngày qua
  const defaultTo = new Date();
  const defaultFrom = new Date();
  defaultFrom.setDate(defaultTo.getDate() - 30);

  let from = query.from ? new Date(query.from) : defaultFrom;
  let to = query.to ? new Date(query.to) : defaultTo;

  if (isNaN(from.getTime())) from = defaultFrom;
  if (isNaN(to.getTime())) to = defaultTo;

  // Đảm bảo 'to' là cuối ngày
  to.setHours(23, 59, 59, 999);

  return { from, to };
};

/**
 * UC-OWN-DASH-01: Lấy thống kê dashboard cho chủ sân (owner)
 * GET /owner/dashboard?from=&to=
 */
exports.getDashboard = async (req, res) => {
  try {
    const ownerId = req.user.sub; // Lấy từ middleware checkAuth
    const { from, to } = getSafeDateRange(req.query);

    // 1. Tìm tất cả các SubPitch ID thuộc về Owner này
    const venues = await Venue.find({ ownerId }).select("_id").lean();
    const venueIds = venues.map((v) => v._id);

    const subPitches = await SubPitch.find({ venueId: { $in: venueIds } })
      .select("_id")
      .lean();
    const subPitchIds = subPitches.map((sp) => sp._id);

    if (subPitchIds.length === 0) {
      // Trả về cấu trúc dữ liệu rỗng thay vì chỉ message
      return res.json({
        dateRange: { from: from.toISOString(), to: to.toISOString() },
        kpis: {
          totalRevenue: 0,
          totalBookings: 0,
          bookingStatusCounts: [],
        },
        revenueChartData: [],
        recentReviews: [],
        message: "Chủ sân này chưa có sân con nào.",
      });
    }

    // 2. Lấy Booking IDs của các sân con này
    // (Chúng ta cần điều này để lọc Payments)
    const ownerBookings = await Booking.find({
      subPitchId: { $in: subPitchIds },
    })
      .select("_id")
      .lean();
    const ownerBookingIds = ownerBookings.map((b) => b._id);
    // --- CÁC TÍNH TOÁN THỐNG KÊ ---

    // A. Thống kê doanh thu (theo ngày) từ Payment
    const revenueChart = await Payment.aggregate([
      {
        $match: {
          bookingId: { $in: ownerBookingIds },
          status: "paid", // Chỉ tính thanh toán đã thành công
          createdAt: { $gte: from, $lte: to },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          dailyRevenue: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: "$_id",
          revenue: "$dailyRevenue",
          _id: 0,
        },
      },
    ]);

    const totalRevenue = revenueChart.reduce(
      (acc, curr) => acc + curr.revenue,
      0
    );

    // B. Thống kê tỷ lệ lấp đầy (đếm số booking)
    const bookingStats = await Booking.aggregate([
      {
        $match: {
          subPitchId: { $in: subPitchIds },
          // === ✅ THAY ĐỔI Ở ĐÂY ===
          // Thêm 'pending_payment' và 'cancelled' vào mảng $in
          status: {
            $in: ["confirmed", "completed", "pending_payment", "cancelled"],
          },
          // =======================
          createdAt: { $gte: from, $lte: to }, // Lọc theo ngày tạo booking
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Biến totalBookings này giờ sẽ là TỔNG của cả 4 trạng thái
    const totalBookings = bookingStats.reduce(
      (acc, curr) => acc + curr.count,
      0
    );

    // C. Xem đánh giá và bình luận (20 đánh giá mới nhất)
    const reviews = await Review.find({
      subPitchId: { $in: subPitchIds },
    })
      .populate("userId", "name") // Lấy tên người đánh giá
      .populate("subPitchId", "name") // Lấy tên sân con
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    // Trả về kết quả
    res.json({
      dateRange: { from: from.toISOString(), to: to.toISOString() },
      kpis: {
        totalRevenue,
        totalBookings, // Đây là tổng của 4 trạng thái
        bookingStatusCounts: bookingStats, // Đây là chi tiết 4 trạng thái
      },
      revenueChartData: revenueChart,
      recentReviews: reviews,
    });
  } catch (err) {
    console.error("getOwnerDashboard error:", err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};
