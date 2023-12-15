const MarketExecution = require("../models/MarketExecution");
const mongoose = require("mongoose");
module.exports = class MarketExecutionController {
  static async findIdMarket(req, res) {
    const { id } = req.query;
    const IdMaket = new mongoose.Types.ObjectId(id);
    try {
      const obj = await MarketExecution.find({
        "Market._id": IdMaket,
      });

      res.status(200).json(obj);
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }
};
