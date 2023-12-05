const mongoose = require("../db/conn");
const { Schema } = mongoose;
const User = mongoose.model(
  "User",
  new Schema(
    {
      Email: { type: String, require: true },
      Password: { type: String, require: true },
      DateTime: { type: Date, require: true },
      Name: { type: String, require: true },
      Memo: { type: String },
    },
    { timestamps: true }
  )
);
module.exports = User;
