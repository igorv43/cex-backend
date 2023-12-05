const mongoose = require("../db/conn");
const { Schema } = mongoose;
const Bank = mongoose.model(
  "Bank",
  new Schema(
    {
      Amount: { type: Number, require: true },
      Denom: { type: String, require: true },
      Wallet: { type: String, require: true },
      Memo: { type: String },
      Type: { type: String, require: true }, //Deposit or Withdraw
      Status: { type: String, require: true }, //Cancel, proccess, ok
      txhash: { type: String, require: true },
      User: Object,
    },
    { timestamps: true }
  )
);
module.exports = Bank;
