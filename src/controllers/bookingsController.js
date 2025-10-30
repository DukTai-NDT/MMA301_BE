const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const SubPitch = require("../models/SubPitch");
const SlotReservation = require("../models/SlotReservation");

const createBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { subPitchId, date, startTime, endTime, paymentOption } = req.body;

    if (!subPitchId || !date || !startTime || !endTime || !paymentOption) {
      throw new Error("Missing required fields");
    }

    // 1️⃣ Kiểm tra sân con tồn tại
    const subPitch = await SubPitch.findById(subPitchId).session(session);
    if (!subPitch) throw new Error("SubPitch not found");

    const slotLabel = `${startTime}-${endTime}`;

    // 2️⃣ Kiểm tra xung đột đặt sân
    const conflict = await SlotReservation.findOne({
      subPitchId,
      date,
      startTime,
      endTime,
      status: { $in: ["booked", "hold"] },
    }).session(session);

    if (conflict) {
      throw new Error("Time slot already booked or held by another user");
    }

    // 3️⃣ Lấy giá từ blockPrices
    const price = subPitch.blockPrices?.[slotLabel];
    if (!price) throw new Error(`No price found for slot ${slotLabel}`);

    // 4️⃣ Tạo SlotReservation (booked)
    const [reservation] = await SlotReservation.create(
      [
        {
          subPitchId,
          date,
          startTime,
          endTime,
          status: "booked",
        },
      ],
      { session }
    );

    // 5️⃣ Tạo Booking
    const [booking] = await Booking.create(
      [
        {
          subPitchId,
          reservationId: reservation._id,
          date,
          startTime,
          endTime,
          totalPrice: price,
          paymentOption,
          status: paymentOption === "cash" ? "confirmed" : "pending_payment",
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("❌ Error creating booking:", err);
    res.status(400).json({ message: err.message });
  }
};

module.exports = { createBooking };
