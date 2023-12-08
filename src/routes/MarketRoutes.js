const router = require("express").Router();
const MarketController = require("../controlles/MarketController");
const verifyToken = require("../helpers/verify-token");
router.post("/sell", verifyToken, MarketController.sell);
router.post("/buy", verifyToken, MarketController.buy);
router.get("/find", verifyToken, MarketController.find);
router.get("/findOpenOrders", verifyToken, MarketController.findOpenOrders);

module.exports = router;
