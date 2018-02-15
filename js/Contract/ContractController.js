var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

var Contract = require(__dirname+'/Contract');
var Web3 = require('web3');
var controllerjson=require(__dirname+'/../../json/BettingController.json');
var samplejson=require(__dirname+'/../../json/ETHorse.json');
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
  rpcUrl: 'https://mainnet.infura.io/',
})


var web3 = new Web3(engine);


var contractAddress="0x908B3c90f8ba8E7A5a4815707cD6717181B23CB9";

var MyContract = web3.eth.contract(controllerjson);
var contractInstance = MyContract.at(contractAddress);

var options={address:contractAddress};

function pastcontracts(){
web3.eth.getBlockNumber(function(error, result){
    var myEvent = contractInstance.RaceDeployed({},{fromBlock:result-17280 , toBlock: 'latest'});

    myEvent.watch(function(error, contractresult){
        console.log(contractresult)
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
}

pastcontracts();
// setInterval(pastcontracts,1800000);





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
    console.log('request')
    Contract.find({'date':{'$gte':req.headers.from,'$lte':req.headers.to}}).sort('-date').exec(function (err, contracts) {
        var returnResult=[]
        if(err)
            return res.status(500).send("There was a problem finding the contracts.");

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
        res.status(200).send(returnResult);
    });

});
router.get('/getNextDayRace', function (req, res) {
    Contract.find({race_duration:'86400'}).sort('-date').limit(1).exec(function(err,contract){
        race1_interval=43200;
        race2_interval=86400;
        if(err)
            return res.status(500).send("There was a problem finding the latest contract");
        if(contract.length==0)
            return res.status(500).send({});
        nextrace={'race1':parseInt(contract[0].date)+race1_interval,'race2':parseInt(contract[0].date)+race2_interval}
        res.status(200).send(nextrace);

    })
    });
router.get('/getNextHourRace', function (req, res) {
    Contract.find({race_duration:'3600'}).sort('-date').limit(1).exec(function(err,contract){
        race1_interval=28800;
        race2_interval=57600;
        if(err)
        return res.status(500).send("There was a problem finding the latest contract");
        if(contract.length==0)
            return res.status(500).send({});
        nextrace={'race1':parseInt(contract[0].date)+race1_interval,'race2':parseInt(contract[0].date)+race2_interval}
        res.status(200).send(nextrace);
    })
    });


module.exports = router;
