const jwt = require("jsonwebtoken");
const User = require("../models/User");
const getToken = require("./get-token");
const getUserByToken = async (req) => {
  const token = getToken(req);
  if (!token) {
    return res.status(401).json({ message: "access denied" });
  }
  const decoded = jwt.verify(token, "nossosecret");
  const user = await User.findById(decoded.id).select("-password");
  return user;
};
module.exports = getUserByToken;
