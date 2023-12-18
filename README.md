# cex-backend

ATTENTION: This code is exclusive to the entire community and cannot be copied or sold for purposes that do not align with the interests of the Terra Classic community. ALL RIGHTS ARE RESERVED FOR THE TERRA CLASSIC COMMUNITY. Developers can contribute improvements for the benefit of the Terra Classic community.

CEX EXCLUSIVE TESTNET is a system designed to simulate transactions akin to buying and selling Terra tokens. It assists in understanding token behavior, enabling us to test a potential peg at an opportune moment. Moreover, it facilitates testing for the potential listing of a new token and effectively assesses the market module's behavior concerning arbitrage. This module is fully integrated with the Terra Classic blockchain, allowing seamless transactions between the CEX and the blockchain. Below, we'll explain how to install and compile the code, enabling everyone to contribute to the success of our Terra Classic blockchain.

Starting off requires installing MongoDB in a Linux environment. Follow the link: https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/. Additionally, familiarity with React, Material UI, Socket.io, and Node.js (TypeScript, JavaScript) is necessary.
Install Node.js,VSCode

Download the repository: git clone https://github.com/igorv43/cex-backend.git, then follow these commands:
cd cex-backend
npm install
code .

Edit: src/config.js

Modify the configuration file by updating the MongoDB database path according to your setup, along with the settings for the configured blockchain on your local machine. It's crucial not to forget configuring the 'corsOrigin' path where the frontend will run.

const db = "mongodb://127.0.0.1:27017/cex";
const pricesServer = "http://localhost:1317/terra/oracle/v1beta1/denoms/tobin_taxes";
const lcdClientUrl = "http://localhost:1317";
const chainID = "localterra";
const mnemonic ="neither flight wisdom surround runway soon east utility proof anchor picnic unable mobile armed produce creek report goat melt jewel cream plug gallery decade";
const accAddress = "terra1e0gnsneylaav9hf9lunt9lpsljh2j4dzw7vcqv";
corsOrigin = "http://localhost:3000";
const accIdCEX = "6579dad12bcff7117f7356d8";

In the case of 'accIdCEX,' a detailed explanation will be provided shortly. This account is exclusively designated for CEX, where all transaction fees will be deposited.

After completing all these configurations, enter the following command:

npm run start
