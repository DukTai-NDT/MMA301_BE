// src/controllers/subPitchController.js
const SubPitch = require('../models/SubPitch.js');
const Venue = require('../models/Venue.js'); // Cần để kiểm tra owner
const mongoose = require('mongoose');

/**
 * Kiểm tra xem owner (đã auth) có sở hữu venue này không
 * @param {string} venueId - ID của venue
 * @param {string} ownerId - ID của user (từ req.user._id)
 * @returns {Promise<boolean>} - Trả về true nếu
 */
const checkVenueOwnership = async (venueId, ownerId) => {
  if (!mongoose.Types.ObjectId.isValid(venueId)) return false;
  
  const venue = await Venue.findOne({ _id: venueId, ownerId: ownerId });
  return !!venue; // Trả về true nếu tìm thấy venue (tức là owner sở hữu)
};

// @desc    Lấy danh sách sub-pitch của 1 venue
// @route   GET /owner/venues/:venueId/sub-pitches
const getSubPitchesByVenue = async (req, res) => {
  try {
    const { venueId } = req.params;
    const ownerId = req.user._id;

    // 1. Kiểm tra owner có sở hữu venue này không
    const isOwner = await checkVenueOwnership(venueId, ownerId);
    if (!isOwner) {
      return res.status(403).json({ message: 'Forbidden: You do not own this venue' });
    }

    // 2. Lấy danh sách sub-pitch
    const subPitches = await SubPitch.find({ venueId: venueId });
    res.json(subPitches);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Tạo sub-pitch mới cho 1 venue
// @route   POST /owner/venues/:venueId/sub-pitches
const createSubPitch = async (req, res) => {
  try {
    const { venueId } = req.params;
    const ownerId = req.user._id;

    // 1. Kiểm tra owner có sở hữu venue này không
    const isOwner = await checkVenueOwnership(venueId, ownerId);
    if (!isOwner) {
      return res.status(403).json({ message: 'Forbidden: You do not own this venue' });
    }

    // 2. Tạo sub-pitch
    const subPitchData = {
      ...req.body,
      venueId: venueId, // Gán venueId từ URL
    };

    const newSubPitch = new SubPitch(subPitchData);
    await newSubPitch.save();
    res.status(201).json(newSubPitch);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Hàm helper để kiểm tra owner của 1 sub-pitch (cho update/delete)
const checkSubPitchOwnership = async (subPitchId, ownerId) => {
  if (!mongoose.Types.ObjectId.isValid(subPitchId)) return null;
  
  const subPitch = await SubPitch.findById(subPitchId);
  if (!subPitch) return null; // Không tìm thấy sub-pitch

  const isOwner = await checkVenueOwnership(subPitch.venueId, ownerId);
  return isOwner ? subPitch : null; // Trả về subPitch nếu là owner,
};

// @desc    Cập nhật 1 sub-pitch
// @route   PUT /owner/sub-pitches/:id
const updateSubPitch = async (req, res) => {
  try {
    const { id } = req.params; // id của sub-pitch
    const ownerId = req.user._id;

    // 1. Kiểm tra owner có sở hữu sub-pitch này không
    const subPitch = await checkSubPitchOwnership(id, ownerId);
    if (!subPitch) {
      return res.status(403).json({ message: 'Forbidden: Sub-pitch not found or you do not own it' });
    }

    // 2. Cập nhật
    const updatedSubPitch = await SubPitch.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    res.json(updatedSubPitch);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Xóa 1 sub-pitch
// @route   DELETE /owner/sub-pitches/:id
const deleteSubPitch = async (req, res) => {
  try {
    const { id } = req.params; // id của sub-pitch
    const ownerId = req.user._id;

    // 1. Kiểm tra owner có sở hữu sub-pitch này không
    const subPitch = await checkSubPitchOwnership(id, ownerId);
    if (!subPitch) {
      return res.status(403).json({ message: 'Forbidden: Sub-pitch not found or you do not own it' });
    }

    // 2. Xóa
    await SubPitch.findByIdAndDelete(id);
    
    // (Bạn có thể thêm logic xóa Bookings, SlotReservations... liên quan ở đây)

    res.json({ message: 'Sub-pitch deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getSubPitchesByVenue,
  createSubPitch,
  updateSubPitch,
  deleteSubPitch,
};