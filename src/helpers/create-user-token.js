const { useRadioGroup } = require("@mui/material");
const jwt = require("jsonwebtoken");
const createUserToken = async (user, req, res) => {
  const token = jwt.sign(
    {
      name: user.name,
      id: user._id,
    },
    "nossosecret"
  );
  res.status(200).json({
    massage: "is authenticad",
    token: token,
    name: user.name,
    userId: user._id,
  });
};
module.exports = createUserToken;
