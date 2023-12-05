const Coin = require("../models/Coin");
module.exports = class CoinController {
  // static createCoin(req, res) {
  //   res.render("coin/create");
  // }
  static async register(req, res) {
    const {
      supply,
      denom,
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

// http://localhost:5000/coin/register
//   {

//     "denom": "LUNC/USDT",
//       "price": 5.00,
//       "supply": 10000,
//       "totalBuy": 5000,
//       "totalSell": 0,
//       "totalPriceBuy": 50000,
//       "totalPriceSell": 0
// }
