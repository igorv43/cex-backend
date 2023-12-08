const mongoose = require("../db/conn");
const { Schema } = mongoose;
const CoinLiquidity = mongoose.model(
  "CoinLiquidity",
  new Schema(
    {
      Amount: { type: Number, require: true },
      Denom: { type: String, require: true },
    },
    { timestamps: true }
  )
);
module.exports = CoinLiquidity;
