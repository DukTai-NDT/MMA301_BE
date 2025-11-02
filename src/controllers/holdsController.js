const SlotReservation = require("../models/SlotReservation");

// 🟢 Tạo Hold (giữ slot tạm thời 10 phút)
exports.createHold = async (req, res) => {
  try {
    const { subPitchId, date, slotIndex } = req.body;

    //  Kiểm tra đầu vào
    if (!subPitchId || !date || slotIndex === undefined) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    //  Kiểm tra trùng lặp
    const existed = await SlotReservation.findOne({
      subPitchId,
      date,
      slotIndex,
      status: { $in: ["hold", "booked"] },
    });

    if (existed) {
      return res.status(400).json({ message: "Slot đã được giữ hoặc đặt" });
    }

    //  Tạo mới record hold (10 phút TTL)
    const hold = await SlotReservation.create({
      subPitchId,
      date,
      slotIndex,
      status: "hold",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    console.log("✅ Đã tạo hold:", hold._id);

    return res.status(201).json({
      message: "✅ Giữ chỗ thành công (hiệu lực 10 phút)",
      hold,
    });
  } catch (err) {
    console.error("❌ createHold error:", err);
    return res.status(500).json({ message: err.message });
  }
};

// Hủy hold thủ công (nếu cần)
exports.deleteHold = async (req, res) => {
  try {
    const deleted = await SlotReservation.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Không tìm thấy hold" });
    }
    return res.json({ message: "🗑️ Đã hủy giữ chỗ", hold: deleted });
  } catch (err) {
    console.error("❌ deleteHold error:", err);
    return res.status(500).json({ message: err.message });
  }
};
