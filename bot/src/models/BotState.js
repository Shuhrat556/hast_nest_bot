const mongoose = require('mongoose');

const botStateSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.BotState || mongoose.model('BotState', botStateSchema);
