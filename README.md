# MultiSig
Simple implementation of an Ethereum multi-signature N/M wallet, with truffle tests

## Testing
1) Download nodejs
2) Install truffle via npm: ```npm install -g truffle```
3) Start truffle: ```truffle init```
4) Edit truffle-config.js, uncomment and set version to the same version as the smart contract to be tested, e.g. "0.7.0"
5) Install openzeppelin test-helpers in the truffle_folder: ```npm install @openzeppelin/test-helpers```
6) Move the testing smart contract to truffle_folder/contracts/
7) Test: ```truffle test```
