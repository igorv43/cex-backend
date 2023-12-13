const axios = require("axios");
const { lcdClientUrl } = require("../config");
const LCDClient = axios.create({
  baseURL: lcdClientUrl,
});
module.exports = LCDClient;
