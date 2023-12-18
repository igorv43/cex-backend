const mongoose = require("mongoose");
const { db } = require("../config");
async function main() {
  await mongoose.connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("connect db...");
}
main().catch((err) => console.log(err));
module.exports = mongoose;
//https://www.ultimateakash.com/blog-details/IiwzQGAKYAo=/How-to-implement-Transactions-in-Mongoose-&-Node.Js-(Express)
