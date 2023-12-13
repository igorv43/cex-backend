const axios = require("axios");
const { cexClientUrl } = require("../config");
const CEXClient = axios.create({
  baseURL: cexClientUrl,
});
module.exports = CEXClient;
