const { Market } = require("../models/Market");
const Coin = require("../models/Coin");
const CoinUser = require("../models/CoinUser");
const MarketExecution = require("../models/MarketExecution");
const getUserByToken = require("../helpers/get-user-by-token");
const { CommentsDisabledOutlined } = require("@mui/icons-material");
module.exports = class MarketController {
  static async buy(req, res, next) {
    MarketController.#execute(req, res, "buy");
  }
  static async sell(req, res, next) {
    MarketController.#execute(req, res, "sell");
  }
  static async find(req, res) {
    const user = await getUserByToken(req);
    // console.log(user);
    try {
      const obj = await Market.Model.find({
        User: { _id: user._id },
        Status: { $in: ["Executed", "Canceled"] },
      }).sort({
        createdAt: -1,
      });
      // console.log(obj);
      res.status(200).json(obj);
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }
  static async findOpenOrders(req, res) {
    const user = await getUserByToken(req);

    try {
      const obj = await Market.Model.find({
        $and: [
          { User: { _id: user._id } },
          { Status: { $in: ["Registered", "Running"] } },
        ],
      }).sort({
        createdAt: -1,
      });
      // console.log(obj);
      res.status(200).json(obj);
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }
  static async #execute(req, res, type) {
    const { denom, amount, price } = req.body;

    if (!amount) {
      res.status(422).json({ message: "Amount requirid" });
      return;
    } else {
      if (parseFloat(amount) <= 0) {
        res.status(422).json({ message: "Amount requirid" });
        return;
      }
    }

    try {
      const user = await getUserByToken(req);
      const obj = new Market.Model({
        Denom: denom,
        Price: price,
        Amount: amount,
        AmountExecuted: 0,
        Type: type,
        Status: "Registered",
        User: { _id: user._id },
      });

      if (obj.Price == undefined) {
        const coin = await MarketController.#CalculateMarketPrice(
          obj,
          res,
          true
        );
        obj.Price = coin.Price;
        obj.MarketPrice = true;
      }
      if (type == "buy") {
        obj.Amount = obj.Amount / obj.Price;
      }

      const pair = denom.split("/");
      const denom1 = pair[0];
      const denom2 = pair[1];

      const newMarket = await obj.save();
      global._io
        .to(user._id.toString())
        .emit("alertUser", { type: "market", data: newMarket });

      if (type == "sell") {
        MarketController.#SaveDenomUserPair(amount, denom1, false, {
          _id: obj.User._id,
        });
      } else {
        MarketController.#SaveDenomUserPair(amount, denom2, false, {
          _id: obj.User._id,
        });
      }

      MarketController.#calculateLiquidity(type, denom, newMarket, res);
      const listMarket = await Market.Model.find({ _id: newMarket._id });
      global._io.emit("market_" + denom, listMarket);
      res.status(200).json({ message: "creatd", newMarket });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }

  static async #calculateLiquidity(type, denom, objMarket, res) {
    let listMarket = null;
    const typeDb = type == "sell" ? "buy" : "sell";
    const coinObj = await Coin.findOne({ Denom: denom });
    // if (type == "sell") {
    //   listMarket = await Market.Model.find({
    //     $and: [
    //       { Type: typeDb },
    //       { Denom: denom },
    //       { Status: { $in: ["Registered", "Running"] } },
    //       {
    //         $or: [
    //           { Price: { $gte: objMarket.Price } },
    //           {
    //             $and: [
    //               { Price: { $eq: objMarket.Price } },
    //               { MarketPrice: true },
    //             ],
    //           },
    //         ],
    //       },
    //     ],
    //   })
    //     .sort({ createdAt: 1 })
    //     .limit(100);
    // } else {
    //   listMarket = await Market.Model.find({
    //     $and: [
    //       { Type: typeDb },
    //       { Denom: denom },
    //       { Status: { $in: ["Registered", "Running"] } },
    //       {
    //         $or: [
    //           { Price: { $lte: objMarket.Price } },
    //           {
    //             $and: [
    //               { Price: { $eq: objMarket.Price } },
    //               { MarketPrice: true },
    //             ],
    //           },
    //         ],
    //       },
    //     ],
    //   })
    //     .sort({ createdAt: 1 })
    //     .limit(100);
    // }
    listMarket = await Market.Model.find({
      $and: [
        { Type: "sell" },
        { Denom: denom },
        { Status: { $in: ["Registered", "Running"] } },
        {
          $or: [
            { Price: { $lte: objMarket.Price } },
            {
              $and: [
                { Price: { $eq: objMarket.Price } },
                { MarketPrice: true },
              ],
            },
          ],
        },
      ],
    })
      .sort({ createdAt: 1 })
      .limit(100);
    let CountAmount =
      objMarket.AmountExecuted == 0
        ? objMarket.Amount
        : objMarket.Amount - objMarket.AmountExecuted;
    for (let i = 0; i < listMarket.length; i++) {
      if (listMarket[i].Amount - listMarket[i].AmountExecuted >= CountAmount) {
        const market01 = await Market.Model.findById(objMarket._id);

        if (CountAmount >= market01.Amount) {
          market01.AmountExecuted = market01.Amount;
        } else {
          market01.AmountExecuted = market01.AmountExecuted + CountAmount;
        }
        if (market01.Amount == market01.AmountExecuted) {
          market01.Status = "Executed";
        }
        await Market.Model.updateOne({ _id: market01._id }, market01);
        global._io
          .to(market01.User._id.toString())
          .emit("alertUser", { type: "market", data: market01 });
        await MarketController.#SaveToMarketExecution(
          market01,
          CountAmount,
          res
        );

        if (CountAmount >= listMarket[i].Amount) {
          listMarket[i].AmountExecuted = listMarket[i].Amount;
        } else {
          listMarket[i].AmountExecuted =
            listMarket[i].AmountExecuted + CountAmount;
        }
        if (listMarket[i].Amount == listMarket[i].AmountExecuted) {
          listMarket[i].Status = "Executed";
        }
        await Market.Model.updateOne({ _id: listMarket[i]._id }, listMarket[i]);
        global._io
          .to(listMarket[i].User._id.toString())
          .emit("alertUser", { type: "market", data: listMarket[i] });
        await MarketController.#SaveToMarketExecution(
          listMarket[i],
          CountAmount,
          res
        );
        break;
      } else {
        if (objMarket.Amount === objMarket.AmountExecuted) {
          break;
        } else {
          const market01 = await Market.Model.findById(objMarket._id);

          const toAmountExecuted01 =
            listMarket[i].Amount - listMarket[i].AmountExecuted;
          const toAmountExecuted =
            toAmountExecuted01 + listMarket[i].AmountExecuted;
          if (toAmountExecuted == listMarket[i].Amount) {
            listMarket[i].Status = "Executed";
          } else {
            listMarket[i].Status = "Running";
          }
          listMarket[i].AmountExecuted = toAmountExecuted;
          await Market.Model.updateOne(
            { _id: listMarket[i]._id },
            listMarket[i]
          );
          global._io
            .to(listMarket[i].User._id.toString())
            .emit("alertUser", { type: "market", data: listMarket[i] });
          await MarketController.#SaveToMarketExecution(
            listMarket[i],
            toAmountExecuted01,
            res
          );
          market01.AmountExecuted =
            toAmountExecuted01 + market01.AmountExecuted;
          if (market01.Amount == market01.AmountExecuted) {
            market01.Status = "Executed";
          } else {
            market01.Status = "Running";
          }
          await Market.Model.updateOne({ _id: market01._id }, market01);
          global._io
            .to(market01.User._id.toString())
            .emit("alertUser", { type: "market", data: market01 });
          await MarketController.#SaveToMarketExecution(
            market01,
            market01.AmountExecuted,
            res
          );
        }
      }
    }
  }
  static async #SaveToMarketExecution(objMarket, CountAmount, res) {
    const coinExecute1 = await MarketController.#CalculateMarketPrice(
      { Denom: objMarket.Denom, CountAmount, Type: objMarket.Type },
      res,
      false
    );
    const marketExecution = new MarketExecution({
      Amount: CountAmount,
      Price: coinExecute1.Price,
      Market: {
        _id: objMarket._id,
        Amount: objMarket.Amount,
        Denom: objMarket.Denom,
        Type: objMarket.Type,
        Price: objMarket.Price,
      },
    });

    await marketExecution.save();

    MarketController.#SaveDenomUser(
      objMarket.Type,
      objMarket.Denom,
      { Amount: CountAmount, Price: coinExecute1.Price },
      { _id: objMarket.User._id }
    );
  }
  static async #SaveDenomUser(type, denom, market, user) {
    //Exemple LUNC/USDT
    const pair = denom.split("/");
    const denom1 = pair[0];
    const denom2 = pair[1];

    if (type === "sell") {
      //Exemple USDT
      const total = market.Amount * market.Price;
      MarketController.#SaveDenomUserPair(total, denom2, true, user);
    } else {
      //Exemple LUNC
      const total = market.Amount / market.Price;
      MarketController.#SaveDenomUserPair(total, denom1, true, user);
    }
  }
  static async #SaveDenomUserPair(amount, denom, add, user) {
    const obj = new CoinUser({
      Amount: amount,
      Denom: denom,
      User: { _id: user._id },
    });

    const coinUserDenom = await CoinUser.findOne({
      Denom: denom,
      User: obj.User,
    });

    if (coinUserDenom) {
      if (add) {
        const amountx = obj.Amount + coinUserDenom.Amount;
        obj.Amount = amountx;
      } else {
        const amountx = coinUserDenom.Amount - obj.Amount;
        obj.Amount = amountx;
      }

      coinUserDenom.Amount = obj.Amount;
      await CoinUser.updateOne({ _id: coinUserDenom._id }, coinUserDenom);
    } else {
      await obj.save();
    }
  }
  static async #CalculateMarketPrice(obj, res, updated) {
    const coin = await Coin.findOne({ Denom: obj.Denom });
    if (!coin) {
      res.status(422).json({ message: "Denom requirid :" + obj.Denom });
      return;
    } else {
      const totalPrice = coin.Price * obj.Amount;
      if (obj.Type == "buy") {
        coin.TotalBuy = coin.TotalBuy + obj.Amount;
        coin.TotalPriceBuy = coin.TotalPriceBuy + totalPrice;
        if (coin.TotalSell >= obj.Amount) {
          coin.TotalSell = coin.TotalSell - obj.Amount;
        }
        if (coin.TotalPriceSell >= totalPrice) {
          coin.TotalPriceSell = coin.TotalPriceSell - totalPrice;
        }
      } else if (obj.Type == "sell") {
        coin.TotalSell = coin.TotalSell + obj.Amount;
        coin.TotalPriceSell = coin.TotalPriceSell + totalPrice;
        coin.TotalBuy = coin.TotalBuy - obj.Amount;
        coin.TotalPriceBuy = coin.TotalPriceBuy - totalPrice;
      }

      coin.Price = coin.TotalPriceBuy / coin.Supply;
    }
    if (updated) {
      await Coin.updateOne({ _id: coin._id }, coin);

      global._io.emit("price_" + obj.Denom, coin);

      await MarketController.#emitCandle(obj.Denom);
    }

    return coin;
  }
  static async #emitCandle(Denom) {
    const timeList = ["1_minute", "15_minute", "30_minute", "1_hour", "1_day"];

    for (let index = 0; index < timeList.length; index++) {
      const market = await Market.candlestick(Denom, timeList[index]);

      global._io
        .to("candlestick_" + Denom + "_" + timeList[index])
        .emit("candlestick", market, Denom, timeList[index]);
    }
  }
};

//https://dev.to/sama/react-with-websockets-254e
//https://codesandbox.io/s/orderbook-m7883?file=/src/OrderBook.js
//https://stackoverflow.com/questions/75615207/i-am-try-to-finish-my-order-book-code-i-cant-figure-out-how-summaries-objects
//https://stackoverflow.com/questions/62578473/coin-base-pro-web-socket-current-copy-of-order-book-level-2
