const mongoose = require("../db/conn");
const { Schema } = mongoose;
const CoinUser = mongoose.model(
  "CoinUser",
  new Schema(
    {
      Amount: { type: Number, require: true },
      Denom: { type: String, require: true },
      User: Object,
    },
    { timestamps: true }
  )
);
module.exports = CoinUser;
