const Bank = require("../models/Bank");
const CoinUser = require("../models/CoinUser");
const mongoose = require("mongoose");
const getUserByToken = require("../helpers/get-user-by-token");
const {
  MicroCoins,
  Coins,
  deconvertMicroAmount,
  convertMicroAmount,
} = require("../helpers/MicroCoins");

const {
  mnemonic,
  pricesServer,
  lcdClientUrl,
  chainID,
  accAddress,
} = require("../config");
const {
  LCDClient,
  MnemonicKey,
  MsgSend,
  TxAPI,
} = require("@terraclassic-community/terra.js");
const { Note } = require("@mui/icons-material");

module.exports = class BankController {
  static async historic(req, res) {
    const user = await getUserByToken(req);
    try {
      const obj = await Bank.find({ User: { _id: user._id } });

      res.status(200).json(obj);
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }
  static async Deposit(req, res) {
    //http://localhost:1317/cosmos/tx/v1beta1/txs?events=transfer.recipient%3D'terra1e0gnsneylaav9hf9lunt9lpsljh2j4dzw7vcqv'&pagination.offset=1&pagination.limit=100&order_by=ORDER_BY_DESC
    const { denom, amount, wallet, memo, txhash } = req.body;
    let amountConvert = 0;
    const session = await mongoose.connection.startSession();
    try {
      session.startTransaction();
      amountConvert = deconvertMicroAmount(amount);

      const ExistsBank = await Bank.findOne({ txhash: txhash });
      let coin = "";

      switch (denom) {
        case MicroCoins.LUNC:
          coin = Coins.uluna;
          break;
        case MicroCoins.USTC:
          coin = Coins.uusd;
          break;
        default:
          coin = Coins.uluna;
      }
      const IdUser = new mongoose.Types.ObjectId(memo);
      if (!ExistsBank) {
        let calc = 0;
        const coinUser = await CoinUser.findOne({
          User: { _id: IdUser },
          Denom: coin,
        });

        if (!coinUser) {
          const obj = new CoinUser({
            Amount: amountConvert,
            Denom: coin,
            User: { _id: IdUser },
          });
          calc = amountConvert;
          await obj.save();
        } else {
          calc = parseFloat(coinUser.Amount) + parseFloat(amountConvert);

          coinUser.Amount = calc;
          await CoinUser.updateOne({ _id: coinUser._id }, coinUser);
        }

        if (calc >= -1) {
          console.log(
            "preencher",
            coin,
            amountConvert,
            wallet,
            memo,
            txhash,
            IdUser
          );
          const objBank = new Bank({
            Denom: coin,
            Amount: amountConvert,
            Type: "Deposit",
            Status: "OK",
            Wallet: wallet,
            Memo: memo,
            txhash: txhash,
            User: { _id: IdUser },
          });

          const bankObjc = await objBank.save();
          session.startTransaction();
          //global._io.emit("candlestick_"+coin+"/USDT", market);
          res.status(200).json({ message: "success", data: bankObjc });
        } else {
          await session.abortTransaction();
          res.status(500).json({ message: "insufficient amount" });
        }
      } else {
        session.startTransaction();
        res.status(200).json({ message: "success" });
      }
    } catch (error) {
      await session.abortTransaction();
      res.status(500).json({ message: error });
    }
    session.endSession();
  }
  static async #TranferTerra(amount, denom, accAddressTo) {
    //https://terra-money.github.io/terra.js/
    const mk = new MnemonicKey({
      mnemonic: mnemonic,
    });
    //const gasPrices = await (await fetch(pricesServer)).json();
    //const gasPricesCoins = new Coins(gasPrices);
    const lcd = new LCDClient({
      URL: lcdClientUrl,
      chainID: chainID,
      //gasPrices: "803650uluna", //"0.15uluna",
      //gasAdjustment: 1.4,
      isClassic: true,
    });
    const walletTerra = lcd.wallet(mk);

    let denomAmount = {};
    if (denom === "LUNC") {
      denomAmount = { uluna: parseInt(convertMicroAmount(amount)) };
    }

    const send = new MsgSend(
      walletTerra.key.accAddress,
      accAddressTo,
      denomAmount
    );

    walletTerra
      .createAndSignTx({
        msgs: [send],
        memo: "test from terra.js!",
      })
      .then((tx) => lcd.tx.broadcast(tx))
      .then((result) => {
        console.log("TX hash:", result);
      });
  }
  static async Withdraw(req, res) {
    const user = await getUserByToken(req);
    const { denom, amount, wallet, memo } = req.body;
    if (!denom) {
      res.status(500).json({ message: "denom is requerid" });
    }
    if (!amount) {
      res.status(500).json({ message: "amount is requerid" });
    }
    if (!wallet) {
      res.status(500).json({ message: "wallet is requerid" });
    }
    try {
      const coinUser = await CoinUser.findOne({
        User: { _id: user._id },
        Denom: denom,
      });

      const calc = coinUser.Amount - parseFloat(amount);

      if (calc >= 0) {
        const obj = new Bank({
          Denom: denom,
          Amount: amount,
          Type: "Withdraw",
          Status: "OK",
          Wallet: wallet,
          Memo: memo,
          User: { _id: user._id },
        });
        await obj.save();
        coinUser.Amount = calc;
        await CoinUser.updateOne({ _id: coinUser._id }, coinUser);
        console.log("amount", amount);
        const data = BankController.#TranferTerra(amount, denom, wallet);
        res.status(200).json({ message: "success", data: data });
      } else {
        res.status(500).json({ message: "insufficient amount" });
      }
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }
};
