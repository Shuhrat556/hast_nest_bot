const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      maxlength: 200,
    },
    capacity: {
      type: Number,
      required: true,
      min: 0,
      max: 1_000_000,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Room || mongoose.model('Room', roomSchema);
