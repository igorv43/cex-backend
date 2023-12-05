const mongoose = require("../db/conn");
const { Schema } = mongoose;
const MarketModel = mongoose.model(
  "Market",
  new Schema(
    {
      Amount: { type: Number, require: true },
      Denom: { type: String, require: true },
      Type: { type: String, require: true },
      Price: { type: Number, require: true },
      Status: { type: String, require: true }, //Registered,Executed/Running /Cancel
      AmountExecuted: { type: Number },
      MarketPrice: { type: Boolean },
      User: Object,
    },
    { timestamps: true }
  )
);
const Market = class Business {
  static get Model() {
    return MarketModel;
  }
  static async candlestick(symbol, interval) {
    const str = interval.split("_");
    const unit = str[1];
    const binSize = parseInt(str[0]);
    const obj = await this.Model.aggregate([
      {
        $match: {
          Denom: symbol,
        },
      },
      {
        $group: {
          _id: {
            Denom: "$Denom",
            time: {
              $dateTrunc: {
                date: "$createdAt",
                unit: unit,
                binSize: binSize,
              },
            },
          },
          high: { $max: "$Price" },
          low: { $min: "$Price" },
          open: { $first: "$Price" },
          close: { $last: "$Price" },
        },
      },
      {
        $sort: {
          "_id.time": 1,
        },
      },
    ]);

    return obj;
  }
  static async candlestickLimit(symbol, interval, limit) {
    const str = interval.split("_");
    const unit = str[1];
    const binSize = parseInt(str[0]);
    const obj = await this.Model.aggregate([
      {
        $match: {
          Denom: symbol,
        },
      },
      {
        $group: {
          _id: {
            Denom: "$Denom",
            time: {
              $dateTrunc: {
                date: "$createdAt",
                unit: unit,
                binSize: binSize,
              },
            },
          },
          high: { $max: "$Price" },
          low: { $min: "$Price" },
          open: { $first: "$Price" },
          close: { $last: "$Price" },
        },
      },
      {
        $sort: {
          "_id.time": -1,
        },
      },
    ]);

    return obj.slice(0, 1);
  }
};
module.exports = { Market };
