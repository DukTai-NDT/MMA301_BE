const Venue = require("../models/Venue");
const SubPitch = require("../models/SubPitch");


const listVenues = async (req, res) => {
  try {
    const { search, type, lat, lng, radius, minPrice, maxPrice, minRating } = req.query;

    const query = { status: "active" };

    // 🔍 Text search
    if (search) query.$text = { $search: search };

    // ⭐ Lọc theo rating
    if (minRating) query.ratingAvg = { $gte: Number(minRating) };

    // 🌍 Lọc theo vị trí (geo query)
    if (lat && lng && radius) {
      query.location = {
        $geoWithin: {
          $centerSphere: [
            [parseFloat(lng), parseFloat(lat)],
            parseFloat(radius) / 6378.1, // km → radians
          ],
        },
      };
    }

    // Lấy danh sách sân
    const venues = await Venue.find(query).lean();

    // Nếu không có sân → trả luôn rỗng
    if (!venues.length) return res.json([]);

    // Tính dải giá từ SubPitch
    const venueIds = venues.map((v) => v._id);
    const subPitches = await SubPitch.aggregate([
      { $match: { venueId: { $in: venueIds } } },
      { $project: { venueId: 1, prices: { $objectToArray: "$blockPrices" } } },
      { $unwind: "$prices" },
      {
        $group: {
          _id: "$venueId",
          minPrice: { $min: "$prices.v" },
          maxPrice: { $max: "$prices.v" },
        },
      },
    ]);

    const priceMap = Object.fromEntries(subPitches.map((sp) => [sp._id.toString(), sp]));

    let result = venues.map((v) => ({
      ...v,
      minPrice: priceMap[v._id.toString()]?.minPrice || 0,
      maxPrice: priceMap[v._id.toString()]?.maxPrice || 0,
    }));

    // Lọc theo khoảng giá (nếu có)
    if (minPrice || maxPrice) {
      const min = minPrice ? Number(minPrice) : 0;
      const max = maxPrice ? Number(maxPrice) : Infinity;
      result = result.filter((v) => v.maxPrice >= min && v.minPrice <= max);
    }

    res.json(result);
  } catch (err) {
    console.error("Error in listVenues:", err);
    res.status(500).json({ message: err.message });
  }
};


const getVenue = async (req, res) => {
  try {
    const { venueId } = req.params;
    const venue = await Venue.findById(venueId).lean();

    if (!venue) {
      return res.status(404).json({ message: "Venue not found" });
    }

    // Lấy danh sách sub-pitch của venue này
    const subPitches = await SubPitch.find({ venueId }).lean();

    res.json({
      ...venue,
      subPitches: subPitches || [],
    });
  } catch (err) {
    console.error("Error in getVenue:", err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { listVenues, getVenue };
