// app.js
var express = require('express');
var app = express();
// var db = require('./db');
var Web3 = require('web3');
var contract = require("truffle-contract");
var controllerjson=require('../json/BettingController.json');
var samplejson=require('../json/ETHorse.json');
// console.log(new Web3.providers.HttpProvider("https://ropsten.infura.io/y4sgTWmRT6xvgCrjHmN2").isConnected())
const provider = `wss://ropsten.infura.io/ws`
let web3 = new Web3(new Web3.providers.WebsocketProvider("wss://ropsten.infura.io/ws"))

var contractAddress="0x30D65B119105e5fad531288a05e8f6b00C14F96d";

let contractInstance = new web3.eth.Contract(samplejson.abi, contractAddress);


  contractInstance.getPastEvents('allEvents',
    {fromBlock: 0,  toBlock: 'latest'},
    (error, logs) => {
    if (error) console.error(error);
    logs.forEach(log => {
        // Do something with log
        // console.log(log)
    })
  })

var tempjson={ address: '0x30D65B119105e5fad531288a05e8f6b00C14F96d',
  topics: [ '0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c' ],
  data: '0x000000000000000000000000fda12b99cb2d6cbde6c4054988159308b483ed58000000000000000000000000000000000000000000000000016345785d8a0000',
  blockNumber: 2534603,
  transactionHash: '0x209bfb7ee03fed311ed277ecc5937188a7d69c08035ed880f4e962628417cb36',
  transactionIndex: 8,
  blockHash: '0x75c4b3daea7b7c2a5ba0ddadbfc6e6a42ead5244fda22ed4193745a4b95f89ef',
  logIndex: 2,
  removed: false,
  id: 'log_96312716' }

var toAscii = function(hex) {
    // console.log('ASCII')
    var str = '',
        i = 0,
        l = hex.length;
    if (hex.substring(0, 2) === '0x') {
        i = 2;
    }
    for (; i < l; i+=2) {
        var code = parseInt(hex.substr(i, 2), 16);
        if (code === 0) continue; // this is added
        str += String.fromCharCode(code);
    }
    return str;
};

console.log(toAscii(tempjson.data));

// contractInstance.methods.race_end().call({from:contractAddress},function(error,response){
//         console.log('end');
//         console.log('response: ',response);
//         })

// var options={address:contractAddress};

// var sub = web3.eth.subscribe('logs',options,function(logs){
//     // console.log('Log subscribe',logs);
// });
// sub.on('data',function(result){
// console.log(result)
// console.log(web3.utils.toAscii(result.data));
// });









// var newevent=contractInstance.methods.race_end()

// newevent.watch(function(error,result){
//     if(!error)
//     {
//         console.log(result);
//     }
//     else
//     {
//         console.log('Error',error)
//     }
// })



// var contractController = contract(samplejson);
// // 0x164f38736e38d07e64d2f3a9238db94d8a232a57
// var contractinstance=web3.eth.contract(samplejson.abi)
// var contractAddress="0xdb0f8D94aBd0Af1059771ecfD5d831F49BE52bde";
// var instance=contractinstance.at(contractAddress)
// instance.race_end.call(function(error,response){
//         console.log('end');
//         console.log('response: ',response);
//         })
// // console.log(instance)
// var events=instance.allEvents({fromBlock: 0, toBlock: 'latest'});
// events.get(function(error, logs){
//     console.log(logs);
// });
// var ContractController = require('./contract/ContractController');
// app.use('/contract', ContractController);
module.exports = app;