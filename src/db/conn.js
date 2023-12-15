const mongoose = require("mongoose");
async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/cex", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("connect db...");
}
main().catch((err) => console.log(err));
module.exports = mongoose;
//https://www.ultimateakash.com/blog-details/IiwzQGAKYAo=/How-to-implement-Transactions-in-Mongoose-&-Node.Js-(Express)
