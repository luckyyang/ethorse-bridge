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

var contractAddress="0xacadf60516a37402bedf03e37cd3fccef9078524";

let contractInstance = new web3.eth.Contract(controllerjson, contractAddress);


  contractInstance.getPastEvents('allEvents',
    {fromBlock: 0,  toBlock: 'latest'},
    (error, logs) => {
    if (error) console.error(error);
    logs.forEach(log => {
        // Do something with log
        // console.log(log)
    })
  })


// contractInstance.methods.race_end().call({from:contractAddress},function(error,response){
//         console.log('end');
//         console.log('response: ',response);
//         })

var options={address:contractAddress};

var sub = web3.eth.subscribe('logs',options,function(logs){
});
sub.on('data',function(result){
    console.log(result)
let contractdetails=(web3.eth.abi.decodeLog([
            {
                "indexed": false,
                "name": "_address",
                "type": "address"
            },
            
            {
                "indexed": false,
                "name": "_owner",
                "type": "address"
            },
            
            
            {
                "indexed": false,
                "name": "_time",
                "type": "uint256"
            }
        ],result.data,result.topics));
});









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