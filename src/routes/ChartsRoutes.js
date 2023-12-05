const router = require("express").Router();
const ChartsController = require("../controlles/ChartsController");
router.get("/candlestick", ChartsController.candlestick);
router.get("/candlestickLimit", ChartsController.candlestickLimit);
module.exports = router;
