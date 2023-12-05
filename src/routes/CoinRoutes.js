const router = require("express").Router();
const CoinController = require("../controlles/CoinController");
router.post("/register", CoinController.register);
module.exports = router;
