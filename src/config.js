const db = "mongodb://127.0.0.1:27017/cex";

const pricesServer =
  "http://localhost:1317/terra/oracle/v1beta1/denoms/tobin_taxes"; //https://bombay-fcd.terra.dev/v1/txs/gas_prices
const lcdClientUrl = "http://localhost:1317";
const chainID = "localterra";
const nameAcc = "cex01";
const mnemonic =
  "neither flight wisdom surround runway soon east utility proof anchor picnic unable mobile armed produce creek report goat melt jewel cream plug gallery decade";
const accAddress = "terra1e0gnsneylaav9hf9lunt9lpsljh2j4dzw7vcqv";
corsOrigin = "http://localhost:3000";
module.exports = {
  db,
  mnemonic,
  pricesServer,
  lcdClientUrl,
  chainID,
  accAddress,
  corsOrigin,
};
