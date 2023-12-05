const MicroCoins = {
  LUNC: "uluna",
  USTC: "uusd",
};
const Coins = {
  uluna: "LUNC",
  uusd: "USTC",
};
const deconvertMicroAmount = (str) => {
  str = padTo6Digits(str);
  return parseFloat(
    str.substring(0, str.length - 6) + "." + str.substring(str.length - 6)
  );
};
const convertMicroAmount = (str) => {
  return str.replace(".", "") + "000000";
};
function padTo6Digits(num) {
  return String(num).padStart(6, "0");
}
module.exports = {
  MicroCoins,
  Coins,
  deconvertMicroAmount,
  convertMicroAmount,
};
