const CoinUser = require("../models/CoinUser");
var mongoose = require("mongoose");
const getUserByToken = require("../helpers/get-user-by-token");
module.exports = class CoinUserController {
  static async findDenom(req, res) {
    const { denom } = req.query;
    const user = await getUserByToken(req);
    console.log(denom);
    try {
      const obj = await CoinUser.findOne({
        Denom: denom,
        User: { _id: user._id },
      });
      res.status(200).json(obj);
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }
  static async find(req, res) {
    const user = await getUserByToken(req);
    try {
      const obj = await CoinUser.find({
        User: { _id: user._id },
      });
      res.status(200).json(obj);
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }
  static async register(req, res, next) {
    const { denom, amount } = req.body;
    const user = await getUserByToken(req);
    const obj = new CoinUser({
      Amount: amount,
      Denom: denom,
      User: { _id: user._id },
    });
    await obj.save();
  }
};
