const express = require("express");
const cors = require("cors");
const app = express();
const http = require("http");
const socket = require("socket.io");
const Coin = require("./src/models/Coin");
const { Market } = require("./src/models/Market");
const { corsOrigin } = require("./src/config");
app.use(express.json());
app.use(cors({ credentials: true, origin: corsOrigin }));
app.use(express.static("public"));

const CoinRoutes = require("./src/routes/CoinRoutes");
app.use("/coin", CoinRoutes);
const UserRoutes = require("./src/routes/UserRouter");
app.use("/user", UserRoutes);
utes = require("./src/routes/UserRouter");
const MarketRoutes = require("./src/routes/MarketRoutes");
app.use("/market", MarketRoutes);
const CoinUserRoutes = require("./src/routes/CoinUserRoutes");
app.use("/coinUser", CoinUserRoutes);

const ChartsRoutes = require("./src/routes/ChartsRoutes");
app.use("/charts", ChartsRoutes);
const BankRoutes = require("./src/routes/BankRoutes");
app.use("/bank", BankRoutes);
const CoinLiquidityRoutes = require("./src/routes/CoinLiquidityRoutes");
app.use("/coinLiquidity", CoinLiquidityRoutes);
const MarketExecution = require("./src/models/MarketExecution");

const httpServer = http.createServer(app);
const io = socket(httpServer, {
  cors: {
    origin: corsOrigin,
    // or with an array of origins
    // origin: ["https://my-frontend.com", "https://my-other-frontend.com", "http://localhost:3000"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  // socket.use(([event, ...args], next) => {
  //   if (isUnauthorized(event)) {
  //     return next(new Error("unauthorized event"));
  //   }
  //   next();
  // });

  socket.on("price_LUNC/USDT", async (data) => {
    const coin = await Coin.findOne({ Denom: data.Denom });
    io.emit("price_LUNC/USDT", coin);
  });
  socket.on("market_LUNC/USDT", async (data) => {
    const market = await Market.Model.find({ Denom: data.Denom })
      .sort({ createdAt: -1 })
      .limit(15);
    io.emit("market_LUNC/USDT", market);
  });

  socket.on("alertUser", (idUser) => {
    if (idUser != null) {
      console.log("acchou id", idUser);
      socket.join(idUser);

      io.to(idUser).emit("alertUser", {
        type: "market",
        data: { message: "chegou ok." },
      });
    }
  });
  socket.on("candlestick", async (data) => {
    const { Denom, Interval } = data;

    global.candlestick = data;
    socket.join("candlestick_" + Denom + "_" + Interval);

    const market = await Market.candlestick(Denom, Interval);
    io.to("candlestick_" + Denom + "_" + Interval).emit(
      "candlestick",
      market,
      Denom,
      Interval
    );
  });
  socket.on("uncandlestick", async (data) => {
    const { Denom, Interval } = data;
    socket.leave("candlestick_" + Denom + "_" + Interval);
  });

  socket.on("error", (err) => {
    if (err && err.message === "unauthorized event") {
      socket.disconnect();
    }
  });
});
global._io = io;

httpServer.listen(5000);
