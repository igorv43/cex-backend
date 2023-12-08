const CoinUser = require("../models/CoinUser");
const Coin = require("../models/Coin");
const CoinLiquidityHistory = require("../models/CoinLiquidityHistory");
const CoinLiquidity = require("../models/CoinLiquidity");
var mongoose = require("mongoose");
const getUserByToken = require("../helpers/get-user-by-token");
module.exports = class CoinLiquidityController {
  static async swap(req, res, next) {
    const { offerDenom, offerAmount, askDenom } = req.body;

    const user = await getUserByToken(req);

    if (askDenom === "USDT") {
      const priceMarket = await CoinLiquidityController.#PriceMarket(
        offerDenom
      );
      if (priceMarket) {
        const amount = priceMarket * offerAmount;
        const coinLiquidity = await CoinLiquidity.findOne({
          Denom: offerDenom,
        });
        if (!coinLiquidity) {
          res
            .status(422)
            .json({ message: "Denom not Liquidity :" + offerDenom });
          return;
        } else if (coinLiquidity.Amount < amount) {
          res
            .status(422)
            .json({ message: "Denom not Liquidity :" + offerDenom });
          return;
        }
        CoinLiquidityController.#SaveCoinUser(amount, askDenom, "+");
        CoinLiquidityController.#SaveCoinUser(offerAmount, offerDenom, "-");
        CoinLiquidityController.#SaveLiquidity(offerAmount, offerDenom, "-");
        const objHist = new CoinLiquidityHistory({
          OfferCoin: {
            Amount: offerAmount,
            Denom: offerDenom,
          },
          AskCoin: {
            Amount: amount,
            Denom: askDenom,
          },
        });
        objHist.save();
      }
    } else {
      const priceMarket = await CoinLiquidityController.#PriceMarket(askAmount);
      if (priceMarket) {
        const amount = priceMarket / offerAmount;
        CoinLiquidityController.#SaveCoinUser(amount, askDenom, "+");
        CoinLiquidityController.#SaveCoinUser(offerAmount, offerDenom, "-");
        CoinLiquidityController.#SaveLiquidity(amount, askDenom, "+");
        const objHist = new CoinLiquidityHistory({
          OfferCoin: {
            Amount: offerAmount,
            Denom: offerDenom,
          },
          AskCoin: {
            Amount: amount,
            Denom: askDenom,
          },
        });
        objHist.save();
      }
    }
    res.status(200).json({
      message: "exchange carried out successfully",
      data: { offerDenom, offerAmount, askDenom },
    });
  }
  static async #PriceMarket(denom) {
    return await Coin.findOne({ Denom: denom + "/USDT" });
  }
  static async #SaveCoinUser(amount, denom, user, operator) {
    const coinUser = await CoinUser.findOne({ Denom: denom });
    if (operator === "+") {
      amount = coinUser.Amount + amount;
    } else {
      amount = coinUser.Amount - amount;
    }

    const obj = new CoinUser({
      Amount: amount,
      Denom: denom,
      User: { _id: user._id },
    });
    obj.save();
  }
  static async #SaveLiquidity(amount, denom, operator) {
    const coinLiquidity = await CoinLiquidity.findOne({ Denom: denom });
    const obj = new CoinLiquidity({
      Amount: offerAmount,
      Denom: offerDenom,
    });
    if (!coinLiquidity) {
      obj.save();
    } else {
      if (operator === "+") {
        obj.Amount = coinLiquidity.Amount + amount;
      } else {
        obj.Amount = coinLiquidity.Amount - amount;
      }

      await CoinLiquidity.updateOne({ _id: coinLiquidity._id }, obj);
    }
  }
};
