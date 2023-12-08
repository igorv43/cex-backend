const mongoose = require("../db/conn");
const { Schema } = mongoose;
const CoinLiquidityHistory = mongoose.model(
  "CoinLiquidityHistory",
  new Schema(
    {
      OfferCoin: {
        Amount: { type: Number, require: true },
        Denom: { type: String, require: true },
      },
      AskCoin: {
        Amount: { type: Number, require: true },
        Denom: { type: String, require: true },
      },
      User: Object,
    },
    { timestamps: true }
  )
);
module.exports = CoinLiquidityHistory;
