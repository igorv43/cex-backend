const mongoose = require("../db/conn");
const { Schema } = mongoose;
const Coin = mongoose.model(
  "Coin",
  new Schema(
    {
      Supply: { type: Number, require: true },
      Denom: { type: String, require: true },
      TotalBuy: { type: Number },
      TotalSell: { type: Number },
      TotalPriceBuy: { type: Number },
      TotalPriceSell: { type: Number },
      Price: { type: Number },
    },
    { timestamps: true }
  )
);
module.exports = Coin;
