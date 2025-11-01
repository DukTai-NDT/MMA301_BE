// src/routes/holds.js
const express = require("express");
const Joi = require("joi");
const { createHold, deleteHold } = require("../controllers/holdsController");

const router = express.Router();

const holdSchema = Joi.object({
  subPitchId: Joi.string().length(24).required(),
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  slotIndex: Joi.number().integer().min(0).required(),
});

// POST /api/holds
router.post("/", async (req, res) => {
  const { error } = holdSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  return createHold(req, res);
});

// DELETE /api/holds/:id
router.delete("/:id", async (req, res) => {
  const idSchema = Joi.object({ id: Joi.string().length(24).required() });
  const { error } = idSchema.validate(req.params);
  if (error) return res.status(400).json({ message: error.details[0].message });
  return deleteHold(req, res);
});

module.exports = router;
