const express = require("express");
const Joi = require("joi");
const { createHold, deleteHold } = require("../controllers/holdController");

const router = express.Router();

// Schema validate cho body POST /holds
const holdSchema = Joi.object({
  subPitchId: Joi.string().length(24).required(),
  date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required(),
  slotIndex: Joi.number().integer().min(0),
  startTime: Joi.string().pattern(/^\d{2}:\d{2}$/),
  endTime: Joi.string().pattern(/^\d{2}:\d{2}$/),
}).xor("slotIndex", "startTime"); // phải có 1 trong 2

// POST /holds
router.post("/", async (req, res) => {
  const { error } = holdSchema.validate(req.body);
  if (error)
    return res.status(400).json({ message: error.details[0].message });
  await createHold(req, res);
});

// DELETE /holds/:id
const idSchema = Joi.object({
  id: Joi.string().length(24).required(),
});

router.delete("/:id", async (req, res) => {
  const { error } = idSchema.validate(req.params);
  if (error)
    return res.status(400).json({ message: error.details[0].message });
  await deleteHold(req, res);
});

module.exports = router;
