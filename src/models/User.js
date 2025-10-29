const mongoose = require("mongoose");

const emailRegex = /^.+@.+\..+$/;

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: emailRegex,
    },
    phone: { type: String, trim: true },
    passHash: { type: String, required: true },
    roles: {
      type: [
        {
          type: String,
          enum: ["customer", "owner", "admin"],
          required: true,
        },
      ],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: "At least one role is required",
      },
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "banned"],
      default: "active",
      required: true,
    },
  },
  { collection: "users", timestamps: true }
);

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ phone: 1 }, { unique: true, sparse: true });
UserSchema.index({ roles: 1 });

module.exports = mongoose.model("User", UserSchema);
