// ./src/routes/withdrawal.js
const express = require("express");
const router = express.Router();
const withdrawal = require("../controllers/withdrawalController");

// === THAY ĐỔI TẠI ĐÂY ===
// Import từ file middleware hiện có của bạn
const { checkAuth, checkRole } = require("../middleware/auth");
// ========================

// --- Owner Routes ---
// (Owner) Xem số dư
router.get(
  "/owner/balance",
  checkAuth,
  checkRole(["owner"]), // Sử dụng checkRole
  withdrawal.getOwnerBalance
);
// (Owner) Gửi yêu cầu rút tiền
router.post(
  "/owner/request",
  checkAuth,
  checkRole(["owner"]), // Sử dụng checkRole
  withdrawal.requestWithdrawal
);
// (Owner) Xem lịch sử rút tiền
router.get(
  "/owner/history",
  checkAuth,
  checkRole(["owner"]), // Sử dụng checkRole
  withdrawal.getOwnerWithdrawals
);

// --- Admin Routes ---
// (Admin) Xem danh sách yêu cầu
router.get(
  "/admin/list",
  checkAuth,
  checkRole(["admin"]), // Sử dụng checkRole
  withdrawal.getAdminWithdrawals
);
// (Admin) Chấp thuận yêu cầu
router.post(
  "/admin/approve/:id",
  checkAuth,
  checkRole(["admin"]), // Sử dụng checkRole
  withdrawal.approveWithdrawal
);
// (Admin) Từ chối yêu cầu
router.post(
  "/admin/reject/:id",
  checkAuth,
  checkRole(["admin"]), // Sử dụng checkRole
  withdrawal.rejectWithdrawal
);

module.exports = router;