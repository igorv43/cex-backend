const mongoose = require("../db/conn");
const { Schema } = mongoose;
const MarketExecution = mongoose.model(
  "MarketExecution",
  new Schema(
    {
      Amount: { type: Number },
      Price: { type: Number },
      Market: Object,
    },
    { timestamps: true }
  )
);
module.exports = MarketExecution;
