const CoinUser = require("../models/CoinUser");
const Coin = require("../models/Coin");
const CoinLiquidityHistory = require("../models/CoinLiquidityHistory");
const CoinLiquidity = require("../models/CoinLiquidity");
var mongoose = require("mongoose");
const getUserByToken = require("../helpers/get-user-by-token");
module.exports = class CoinLiquidityController {
  static async swap(req, res, next) {
    const { offerDenom, offerAmount, askDenom } = req.body;

    if (offerDenom === "" || askDenom === "" || offerAmount === null) {
      res.status(422).json({ message: "Error try later." });
      return;
    }
    try {
      const user = await getUserByToken(req);

      if (askDenom === "USDT") {
        const priceMarket = await CoinLiquidityController.#PriceMarket(
          offerDenom
        );
        if (priceMarket) {
          const amount = offerAmount * priceMarket.Price;

          CoinLiquidityController.#SaveCoinUser(amount, askDenom, user, "+");
          CoinLiquidityController.#SaveCoinUser(
            offerAmount,
            offerDenom,
            user,
            "-"
          );
          CoinLiquidityController.#SaveLiquidity(offerAmount, offerDenom, "+");
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
        const priceMarket = await CoinLiquidityController.#PriceMarket(
          askDenom
        );
        if (priceMarket) {
          const amount = offerAmount / priceMarket.Price;
          const coinLiquidity = await CoinLiquidity.findOne({
            Denom: askDenom,
          });
          if (!coinLiquidity) {
            res
              .status(422)
              .json({ message: "Denom not Liquidity :" + askDenom });
            return;
          } else if (coinLiquidity.Amount < amount) {
            res
              .status(422)
              .json({ message: "Denom not Liquidity :" + askDenom });
            return;
          }
          CoinLiquidityController.#SaveCoinUser(amount, askDenom, user, "+");
          CoinLiquidityController.#SaveCoinUser(
            offerAmount,
            offerDenom,
            user,
            "-"
          );
          CoinLiquidityController.#SaveLiquidity(amount, askDenom, "-");
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
    } catch (e) {
      res.status(500).json({ message: e });
    }
  }
  static async #PriceMarket(denom) {
    return await Coin.findOne({ Denom: denom + "/USDT" });
  }
  static async #SaveCoinUser(amount, denom, user, operator) {
    const coinUser = await CoinUser.findOne({
      Denom: denom,
      User: { _id: user._id },
    });
    if (coinUser) {
      if (operator === "+") {
        coinUser.Amount = coinUser.Amount + parseFloat(amount);
      } else {
        coinUser.Amount = coinUser.Amount - parseFloat(amount);
      }
      await CoinUser.updateOne({ _id: coinUser._id }, coinUser);
    } else {
      const obj = new CoinUser({
        Amount: parseFloat(amount),
        Denom: denom,
        User: { _id: user._id },
      });
      obj.save();
    }
  }
  static async #SaveLiquidity(amount, denom, operator) {
    const coinLiquidity = await CoinLiquidity.findOne({ Denom: denom });
    const obj = new CoinLiquidity({
      Amount: parseFloat(amount),
      Denom: denom,
    });
    if (!coinLiquidity) {
      obj.save();
    } else {
      if (operator === "+") {
        coinLiquidity.Amount = coinLiquidity.Amount + parseFloat(amount);
      } else {
        coinLiquidity.Amount = coinLiquidity.Amount - parseFloat(amount);
      }

      await CoinLiquidity.updateOne({ _id: coinLiquidity._id }, coinLiquidity);
    }
  }
};
