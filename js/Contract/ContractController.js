var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

var Contract = require(__dirname+'/Contract');
var Web3 = require('web3');
var controllerjson=require(__dirname+'/../../json/BettingController.json');
var ethorsejson=require(__dirname+'/../../json/ETHorse.json');
var providerLink=ethorsejson.providerLink;
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
  rpcUrl: providerLink,
})


var web3 = new Web3(engine);


var contractAddress=ethorsejson.address;

var MyContract = web3.eth.contract(controllerjson);
var contractInstance = MyContract.at(contractAddress);

var options={address:contractAddress};

function pastcontracts(){
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
}

pastcontracts();
// setInterval(pastcontracts,1800000);


router.get('/', function (req, res) {
    Contract.find({'date':{'$gte':req.headers.from,'$lte':req.headers.to}}).sort('-date').exec(function (err, contracts) {
        var returnResult=[]
        if(err)
            return res.status(500).send("There was a problem finding the contracts.");
        else if(contracts.length>0){
        contracts.forEach(contractRecord=>{
            var tempjson=JSON.parse(JSON.stringify(contractRecord))
            if((parseInt(tempjson.date)+parseInt(tempjson.betting_duration))<=req.headers.currenttime && (parseInt(tempjson.end_time))>=req.headers.currenttime)
                {
                tempjson['active']='Active';
                }
            else if(parseInt(tempjson.date)<=req.headers.currenttime && (parseInt(tempjson.date)+parseInt(tempjson.betting_duration))>=req.headers.currenttime){
                tempjson['active']='Betting Open';
            }
            else
                {
                tempjson['active']='Closed';
                }
            if(tempjson.contractid!==undefined)
                returnResult.push(tempjson);

        })
        res.status(200).send(returnResult);
        }
        else{
            return res.status(204).send([]);
        }
    });

});
router.get('/getNextRace', function (req, res) {
    Contract.find({race_duration:req.headers.duration}).sort('-date').limit(1).exec(function(err,contract){
        race1_interval=43200;
        race2_interval=86400;
        if(err)
            return res.status(500).send("There was a problem finding the latest contract");
        if(contract.length==0 || ((parseInt(contract[0].date)+race1_interval)-parseInt(req.headers.currenttime))<0){
            return res.status(204).send([]);}
        else{
        nextrace=[{'raceDate':(parseInt(contract[0].date)+race1_interval),'time_remaining':((parseInt(contract[0].date)+race1_interval)-parseInt(req.headers.currenttime))*1000,'status':'Upcoming'}]
        res.status(200).send(nextrace);
        }

    })
    });


module.exports = router;
