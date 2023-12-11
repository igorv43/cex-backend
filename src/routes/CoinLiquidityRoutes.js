const router = require("express").Router();
const CoinLiquidityController = require("../controlles/CoinLiquidityController");
const verifyToken = require("../helpers/verify-token");

router.post("/swap", verifyToken, CoinLiquidityController.swap);
module.exports = router;
