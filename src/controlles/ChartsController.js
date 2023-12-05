const { Market } = require("../models/Market");
var mongoose = require("mongoose");
module.exports = class ChartsController {
  static async candlestick(req, res) {
    const { symbol, interval } = req.query;
    try {
      const obj = await Market.candlestick(symbol, interval);

      res.status(200).json(obj);
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }
  static async candlestickLimit(req, res) {
    const { symbol, interval } = req.query;
    try {
      const obj = await Market.candlestickLimit(symbol, interval, 1);

      res.status(200).json(obj);
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }
};
//https://www.mongodb.com/developer/products/mongodb/time-series-candlestick/
//https://stackoverflow.com/questions/51401813/mongodb-candlestick-query
//https://blog.davidesteban.dev/managing-price-data-on-mongo-db
