const SlotReservation = require("../models/SlotReservation");

// Helper để chuyển giờ -> phút
function hhmmToMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

// POST /holds
const createHold = async (req, res) => {
  try {
    const { subPitchId, date, startTime, endTime, slotIndex } = req.body;

    // Nếu không có slotIndex thì tự tính từ startTime
    const finalSlotIndex =
      slotIndex !== undefined
        ? slotIndex
        : Math.floor(hhmmToMinutes(startTime) / 30);

    const hold = await SlotReservation.create({
      subPitchId,
      date,
      slotIndex: finalSlotIndex,
      status: "hold",
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // TTL 10 phút
    });

    res.status(201).json(hold);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /holds/:id
const deleteHold = async (req, res) => {
  try {
    const deleted = await SlotReservation.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Hold not found" });

    res.json({ message: "Hold canceled" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createHold, deleteHold };
