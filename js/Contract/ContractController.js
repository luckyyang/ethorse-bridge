var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

var Contract = require('./Contract');
var Web3 = require('web3');
var controllerjson=require('../..//json/BettingController.json');
var samplejson=require('../../json/ETHorse.json');
var providerLink="wss://kovan.infura.io/ws";
const ProviderEngine = require('../../index.js')
const ZeroClientProvider = require('../../zero.js')



var storeContract= function(contractdetails)
    {
    Contract.create({
            contractid : contractdetails._address,
            date : contractdetails._time,
            race_duration:contractdetails._raceDuration,
            betting_duration:contractdetails._bettingDuration,
            end_time:parseInt(contractdetails._time)+parseInt(contractdetails._raceDuration)+parseInt(contractdetails._bettingDuration)
    });
    }

const engine = ZeroClientProvider({
  getAccounts: function(){},
  rpcUrl: 'https://kovan.infura.io/',
})


var web3 = new Web3(engine);


var contractAddress="0x7058f5d8ad7b6403737d06f4c4b49a49e6cc86a8";

var MyContract = web3.eth.contract(controllerjson);
var contractInstance = MyContract.at(contractAddress);

var options={address:contractAddress};

web3.eth.getBlockNumber(function(error, result){
    var myEvent = contractInstance.RaceDeployed({},{fromBlock:result-17280 , toBlock: 'latest'});

    myEvent.watch(function(error, contractresult){
       Contract.findOneAndUpdate({'contractid':contractresult.args._address}, {}, {}, function(error, result) {
                if (!error) {
                    // If the document doesn't exist
                    if (!result) {
                        // Create it
                        storeContract(contractresult.args)
                    }
                }
            });
    });


 })






router.post('/', function (req, res) {
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
    Contract.find({'date':{'$gte':req.headers.from,'$lte':req.headers.to}}).sort('-date').exec(function (err, contracts) {
        var returnResult=[]
        contracts.forEach(contractRecord=>{
            var tempjson=JSON.parse(JSON.stringify(contractRecord))
            if(parseInt(tempjson.end_time)>=req.headers.currenttime)
                {
                tempjson['active']='Active';
                }
            else
                {
                tempjson['active']='Closed';
                }
            if(tempjson.contractid!==undefined)
                returnResult.push(tempjson);

        })
        if (err) return res.status(500).send("There was a problem finding the contracts.");
        res.status(200).send(returnResult);
    });

});
router.get('/getNextRace', function (req, res) {
    Contract.find({}).sort('-date').limit(1).exec(function(err,contract){
        nextrace={'date':parseInt(contract[0].date)+57600}
        if (err) return res.status(500).send("There was a problem finding the latest contract");
        res.status(200).send(nextrace);
    })
    });

router.get('/contractsInvolved',function(req,res){
    // contractInstance.
})

module.exports = router;
