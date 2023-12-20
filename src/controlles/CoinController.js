const Coin = require("../models/Coin");
const LCDClient = require("../utils/LCDClient");
const { accIdCEX } = require("../config");
const getUserByToken = require("../helpers/get-user-by-token");
module.exports = class CoinController {
  static async find(req, res) {
    try {
      const obj = await Coin.find();
      res.status(200).json(obj);
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }
  static async findToDenom(req, res) {
    const { symbols } = req.query;
    const array = symbols.split(",");
    try {
      const obj = await Coin.aggregate([
        {
          $match: {
            Denom: { $in: array },
          },
        },
        {
          $project: {
            _id: 0,
            price: "$Price",
            symbol: "$Denom",
          },
        },
      ]);
      // const obj = await Coin.find({ Denom: { $in: array } }).aggregate([
      //   {
      //     $project: {
      //       _id: 0,
      //       Price: "$Price",
      //       Denom: "$Denom",
      //     },
      //   },
      // ]);

      res.status(200).json(obj);
    } catch (error) {
      console.log(error);
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
    const user = await getUserByToken(req);
    if (accIdCEX !== user._id) {
      res.status(401).json({ message: "access denied!" });
      return;
    }
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
