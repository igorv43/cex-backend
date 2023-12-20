const db = "mongodb://127.0.0.1:27017/cex";

const pricesServer =
  "http://localhost:1317/terra/oracle/v1beta1/denoms/tobin_taxes"; //https://bombay-fcd.terra.dev/v1/txs/gas_prices
const lcdClientUrl = "http://localhost:1317";
const chainID = "localterra";
const mnemonic =
  "attitude produce horn voice congress kiwi post day busy rebel enlist final swap dial risk avoid prevent flight wet roof usual game tragic problem";
const accAddress = "terra19mtam7fcwxn0w05hhyyjv7dzqj68yq850wuh5q";
corsOrigin = "http://localhost:3000";
const accIdCEX = "6579dad12bcff7117f7356d8";
module.exports = {
  db,
  mnemonic,
  pricesServer,
  lcdClientUrl,
  chainID,
  accAddress,
  corsOrigin,
  accIdCEX,
};
