var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());


var Web3 = require('web3');
var contract = require("truffle-contract");
var controllerjson=require('../..//json/BettingController.json');
var samplejson=require('../../json/ETHorse.json');
const provider = `wss://ropsten.infura.io/ws`
// let web3 = new Web3(new Web3.providers.WebsocketProvider("wss://ropsten.infura.io/ws"))
let web3 = new Web3(new Web3.providers.WebsocketProvider("ws://192.168.0.112:8546"))
// var Contract = require('./Contract/Contract');
var contractAddress="0xacadf60516a37402bedf03e37cd3fccef9078524";

let contractInstance = new web3.eth.Contract(controllerjson, contractAddress);
var options={address:contractAddress,topics:['0xbb72155379e773b51e75e9105a92b43c2b89e37a51b13c2780ae34929b89457d']};

var sub = web3.eth.subscribe('logs',options,function(logs){
});
sub.on('data',function(result){
    
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
storeContract(contractdetails);
});






var Contract = require('./Contract');

var storeContract= function(contractdetails)
    {

    console.log(contractdetails)
    Contract.create({
            contractid : contractdetails._address,
            date : contractdetails._time
    });
    }


router.post('/', function (req, res) {
    console.log(req.body)
    Contract.create({
            contractid : req.body.contractid,
            date : req.body.date
        }, 
        function (err, contract) {
            console.log(contract);
            if (err) return res.status(500).send("There was a problem adding the information to the database.");
            res.status(200).send(contract);
    });
});

router.get('/', function (req, res) {

    Contract.find({}, function (err, contracts) {
        if (err) return res.status(500).send("There was a problem finding the contracts.");
        res.status(200).send(contracts);
    });

});


module.exports = router;
// module.exports = storeContract;