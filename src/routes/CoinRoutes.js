const router = require("express").Router();
const CoinController = require("../controlles/CoinController");
const verifyToken = require("../helpers/verify-token");
router.post("/register", verifyToken, CoinController.register);
router.get("/find", CoinController.find);
router.get("/findToDenom", CoinController.findToDenom);
router.put("/updateSupply", CoinController.updateSupply);
module.exports = router;
