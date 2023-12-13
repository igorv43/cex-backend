const router = require("express").Router();
const CoinController = require("../controlles/CoinController");
router.post("/register", CoinController.register);
router.get("/find", CoinController.find);
router.put("/updateSupply", CoinController.updateSupply);
module.exports = router;
