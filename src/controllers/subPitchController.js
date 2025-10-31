const Joi = require("joi");
const SubPitch = require("../models/SubPitch");
const Review = require("../models/Review");
const SlotReservation = require("../models/SlotReservation");

const getSubPitches = async (req, res) => {
  try {
    const schema = Joi.object({ venueId: Joi.string().length(24).required() });
    const { error } = schema.validate(req.params);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const subs = await SubPitch.find({ venueId: req.params.venueId });
    res.json(subs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getReviews = async (req, res) => {
  try {
    const schema = Joi.object({ id: Joi.string().length(24).required() });
    const { error } = schema.validate(req.params);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const reviews = await Review.find({ subPitchId: req.params.id })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAvailableSlots = async (req, res) => {
  try {
    const schemaParams = Joi.object({ id: Joi.string().length(24).required() });
    const schemaQuery = Joi.object({
      date: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .required(),
    });

    const { error: errP } = schemaParams.validate(req.params);
    if (errP) return res.status(400).json({ message: errP.details[0].message });
    const { error: errQ } = schemaQuery.validate(req.query);
    if (errQ) return res.status(400).json({ message: errQ.details[0].message });

    const subPitch = await SubPitch.findById(req.params.id);
    if (!subPitch) return res.status(404).json({ message: "SubPitch not found" });

    const reserved = await SlotReservation.find({
      subPitchId: req.params.id,
      date: req.query.date,
    });

    const reservedIndexes = reserved.map((r) => r.slotIndex);
    const available = subPitch.bookableBlocks.filter(
      (_, i) => !reservedIndexes.includes(i)
    );

    res.json({ date: req.query.date, available });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getSubPitches, getReviews, getAvailableSlots };
