const router = require("express").Router();
const BankController = require("../controlles/BankController");
const verifyToken = require("../helpers/verify-token");
router.post("/deposit", BankController.Deposit);
router.post("/withdraw", verifyToken, BankController.Withdraw);
module.exports = router;
