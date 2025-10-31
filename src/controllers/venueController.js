// src/controllers/venueController.js
const Venue = require('../models/Venue.js'); 
const mongoose = require('mongoose');

// @desc    Lấy tất cả venues của owner đang đăng nhập (giả lập)
// @route   GET /owner/venues
const getMyVenues = async (req, res) => {
  try {
    // req.user._id được cung cấp bởi middleware 'protect' giả lập
    const venues = await Venue.find({ ownerId: req.user._id });
    res.json(venues);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Tạo một venue mới
// @route   POST /owner/venues
const createVenue = async (req, res) => {
  try {
    const files = req.files;
    let imageUrls = [];
    if (files && files.length > 0) {
      // 'file.path' là đường dẫn mà Multer lưu file
      // Ví dụ: "uploads/abc123xyz.jpg"
      // (Xem lưu ý bên dưới)
      imageUrls = files.map(file => file.path);
    }
    const venueData = {
      ...req.body,
      images: imageUrls,
      ownerId: req.user._id, // Tự động gán ownerId là user đang đăng nhập (giả lập)
    };
    
    const newVenue = new Venue(venueData);
    const savedVenue = await newVenue.save(); 
    res.status(201).json(savedVenue);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Cập nhật thông tin venue
// @route   PUT /owner/venues/:id
const updateVenue = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid Venue ID' });
  }

  try {
    const updateData = { ...req.body };
    if (req.files && req.files.length > 0) {
      // TRƯỜNG HỢP 1: Có ảnh mới (Gửi bằng FormData)

      // 2a. Lấy link ảnh MỚI từ Cloudinary (req.files)
      const newImageUrls = req.files.map(file => file.path);

      // 2b. Lấy link ảnh CŨ từ req.body.existingImages (frontend gửi)
      let existingImageUrls = [];
      if (req.body.existingImages) {
        // Đảm bảo nó luôn là mảng, dù frontend gửi 1 hay nhiều link
        existingImageUrls = Array.isArray(req.body.existingImages)
          ? req.body.existingImages
          : [req.body.existingImages];
      }

      // 2c. Gộp 2 mảng ảnh lại và GHI ĐÈ vào 'images' trong updateData
      updateData.images = [...existingImageUrls, ...newImageUrls];
      
      // Xóa key 'existingImages' thừa (không bắt buộc nhưng nên làm)
      delete updateData.existingImages; 

    } else {
      // TRƯỜNG HỢP 2: Không có ảnh mới (Gửi bằng JSON)
      // Không cần làm gì cả. 
      // 'updateData.images' đã là mảng ảnh cũ chính xác từ req.body
    }



    const updatedVenue = await Venue.findOneAndUpdate(
      { _id: id, ownerId: req.user._id }, // Kiểm tra ID và ownerId (giả lập)
      { $set: updateData }, 
      { new: true, runValidators: true } 
    );

    if (!updatedVenue) {
      return res.status(404).json({ message: 'Venue not found or you are not the owner' });
    }
    res.json(updatedVenue);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Ẩn/hiện venue (cập nhật status)
// @route   PATCH /owner/venues/:id/status
const updateVenueStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid Venue ID' });
  }
  if (!['active', 'hidden'].includes(status)) {
    return res.status(400).json({ message: "Invalid status. Must be 'active' or 'hidden'." });
  }

  try {
    const updatedVenue = await Venue.findOneAndUpdate(
      { _id: id, ownerId: req.user._id }, // Kiểm tra ID và ownerId (giả lập)
      { $set: { status: status } },     
      { new: true }                     
    );

    if (!updatedVenue) {
      return res.status(404).json({ message: 'Venue not found or you are not the owner' });
    }
    res.json(updatedVenue);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getMyVenues,
  createVenue,
  updateVenue,
  updateVenueStatus,
};