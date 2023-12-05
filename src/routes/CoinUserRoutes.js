const router = require("express").Router();
const CoinUserController = require("../controlles/CoinUserController");
const verifyToken = require("../helpers/verify-token");
router.get("/findDenom", verifyToken, CoinUserController.findDenom);
router.get("/find", verifyToken, CoinUserController.find);
router.post("/register", verifyToken, CoinUserController.register);

module.exports = router;
