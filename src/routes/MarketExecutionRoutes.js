const router = require("express").Router();
const MarketExecutionController = require("../controlles/MarketExecutionController");
const verifyToken = require("../helpers/verify-token");
router.get(
  "/findIdMarket",
  verifyToken,
  MarketExecutionController.findIdMarket
);
module.exports = router;
