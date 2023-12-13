const Coin = require("../models/Coin");
const LCDClient = require("../utils/LCDClient");
module.exports = class CoinController {
  static async find(req, res) {
    try {
      const obj = await Coin.find();
      res.status(200).json(obj);
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }
  static async updateSupply(req, res) {
    try {
      const obj = await Coin.find();
      obj.map(async (k) => {
        await LCDClient.get(
          `cosmos/bank/v1beta1/supply/by_denom?denom=${k.MicroCoin}`
        ).then(async (response) => {
          k.Supply = response.amount.amount;
          await Coin.updateOne({ _id: k._id }, k);
        });
      });
      res.status(200).json(obj);
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }

  static async register(req, res) {
    const {
      supply,
      denom,
      microCoin,
      fee,
      totalBuy,
      totalSell,
      price,
      totalPriceBuy,
      totalPriceSell,
    } = req.body;
    if (!supply) {
      res.status(422).json({ message: "supply requirid" + supply });
      return;
    }
    const denomExists = await Coin.findOne({ Denom: denom });
    if (denomExists) {
      res.status(422).json({ message: "demom is Exists" });
      return;
    }

    const coin = new Coin({
      Denom: denom,
      MicroCoin: microCoin,
      Fee: fee,
      Price: price,
      Supply: supply,
      TotalBuy: totalBuy,
      TotalSell: totalSell,
      TotalPriceBuy: totalPriceBuy,
      TotalPriceSell: totalPriceSell,
    });
    try {
      const newCoin = await coin.save();
      res.status(200).json({ message: "creatd", newCoin });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }
};
