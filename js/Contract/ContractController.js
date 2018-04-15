var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

// var Contract = require(__dirname+'/Contract');
var KovanContract = require(__dirname+'/KovanContract');
var MainContract = require(__dirname+'/MainContract');
var Users = require(__dirname+'/Users');
var Participated = require(__dirname+'/Participated');
var KovanCounter = require(__dirname+'/../Counter/KovanCounter');
var MainCounter = require(__dirname+'/../Counter/MainCounter');
const ipCountry = require('ip-country')

var Web3 = require('web3');
var controllerjson = require(__dirname+'/../../json/BettingController.json');
var betting_abi = require(__dirname+'/../../json/Betting.json');
var ethorsejson = require(__dirname+'/../../json/ETHorse.json');
var providerLink = ethorsejson.providerLink;
const ProviderEngine = require('../../index.js')
const ZeroClientProvider = require('../../zero.js')
const MMDBPath = __dirname+"/../../db/GeoLite2/GeoLite2-Country.mmdb";

//Kovan Connection
const kovanEngine = ZeroClientProvider({
    getAccounts: function(){},
    rpcUrl: providerLink,
})

var kovanWeb3 = new Web3(kovanEngine);

var contractAddress = ethorsejson.address;
var kovanContract = kovanWeb3.eth.contract(controllerjson);
var kovanContractInstance = kovanContract.at(contractAddress);
var raceContractAbi = kovanWeb3.eth.contract(betting_abi);
var options = {address:contractAddress};

var storeContract= function(contractdetails,networkContract) {
    KovanCounter.findByIdAndUpdate({_id: 'entityId'}, {$inc: { seq: 1} }, {new: true, upsert: true}).then(function(count) {
        networkContract.create({
            contractid : contractdetails._address,
            date : contractdetails._time,
            race_duration:contractdetails._raceDuration,
            betting_duration:contractdetails._bettingDuration,
            end_time:parseInt(contractdetails._time)+parseInt(contractdetails._raceDuration)+parseInt(contractdetails._bettingDuration),
            race_number:count.seq
        });
    })
}

//Mainnet Connection
// const mainEngine = ZeroClientProvider({
//   getAccounts: function(){},
//   rpcUrl: ethorsejson.mainnetProviderLink,
// })
//
//
// var mainWeb3 = new Web3(mainEngine);
//
// var mainContractAddress=ethorsejson.mainnetAddress;
//
// var mainContract = mainWeb3.eth.contract(controllerjson);
// var mainContractInstance = mainContract.at(mainContractAddress);
// var mainnetOptions={address:mainContractAddress};



function fetchBetLogs(contractAddress){
    kovanWeb3.eth.getBlockNumber(function(error, blocknumber){
        var raceContractInstance = raceContractAbi.at(contractAddress);
        raceContractInstance.Deposit({},{fromBlock:blocknumber-17280 , toBlock: 'latest'}).get(function(error,result){
            var betsArray = new Array();
            var bulk_user = Users.collection.initializeUnorderedBulkOp({useLegacyOps: true});
            var bulk_participated = Participated.collection.initializeUnorderedBulkOp({useLegacyOps: true});
            var userinfo;

            if(!error) {
                result.forEach(function (bet){
                    userinfo = {
                        userid: bet.args._from,
                        race: bet.address,
                        horse: kovanWeb3.toAscii(bet.args._horse).replace(/\u0000/g, ''),
                        value: kovanWeb3.fromWei(bet.args._value.toNumber(), "ether"),
                        date: bet.args._date.toNumber()
                    }
                    participatedinfo = {
                        participated_userid: bet.args._from,
                        participated_race: bet.address,
                        participated_date: bet.args._date.toNumber()
                    }
                    bulk_user.insert(userinfo);
                    bulk_participated.insert(participatedinfo);
                    // betsArray.push(temp_bets);
                });
                bulk_user.execute(function(err,result) {
                   if (err) {
                     // console.error(err);
                   }
               });
               bulk_participated.execute(function(err,result) {
                  if (err) {
                    // console.error(err);
                  }
              });
           }
       });
   });
}

function pastcontracts(){
    //Kovan Listener
    kovanWeb3.eth.getBlockNumber(function(error, result){
        var controllerRaceDeployed = kovanContractInstance.RaceDeployed({},{fromBlock:result-17280 , toBlock: 'latest'});
        controllerRaceDeployed.watch(function(error, contractresult){
            // console.log(contractresult);
            // console.log(contractresult.args._address);
            KovanContract.findOneAndUpdate({'contractid':contractresult.args._address}, {}, {}, function(error, result) {
                if (!error) {
                    // If the document doesn't exist
                    if (!result) {
                        // Create it
                        storeContract(contractresult.args,KovanContract)
                    }
                }
            });
        });
        var raceBettingClose = kovanContractInstance.RemoteBettingCloseInfo({},{fromBlock:result-17280 , toBlock: 'latest'});
        raceBettingClose.watch(function (error, result) {
            if(!error) {
                // console.log(result.args._race);
                fetchBetLogs(result.args._race);
            }
        })

    })

    //Main Listener
    // mainWeb3.eth.getBlockNumber(function(error, result){
    //     var myEvent = mainContractInstance.RaceDeployed({},{fromBlock:result-17280 , toBlock: 'latest'});
    //
    //     myEvent.watch(function(error, contractresult){
    //        MainContract.findOneAndUpdate({'contractid':contractresult.args._address}, {}, {}, function(error, result) {
    //                 if (!error) {
    //                     // If the document doesn't exist
    //                     if (!result) {
    //                         // Create it
    //                         storeContract(contractresult.args,MainContract)
    //                     }
    //                 }
    //             });
    //     });
    //  })
}

pastcontracts();
// setInterval(pastcontracts,1800000);

// router.use((req, res, next) => {
//   // res.locals.ip = req.connection.remoteAddress; // Russian IP address.
//   // res.locals.ip = "162.219.178.82"; // Russian IP address.
//   res.locals.ip = "88.150.137.130"; // Russian IP address.
//   next()
// });

router.use(ipCountry.setup({
  mmdb: MMDBPath,
  fallbackCountry: ''
}));

router.get('/', function (req, res) {
    KovanContract.find({'date':{'$gte':req.headers.from,'$lte':req.headers.to}}).sort('-date').exec(function (err, contracts) {
        var returnResult=[]
        if(err)
        return res.status(500).send("There was a problem finding the contracts.");
        else if(contracts.length>0){
            contracts.forEach(contractRecord=>{
                var tempjson=JSON.parse(JSON.stringify(contractRecord))
                if((parseInt(tempjson.date)+parseInt(tempjson.betting_duration))<=req.headers.currenttime && (parseInt(tempjson.end_time))>=req.headers.currenttime)
                {
                    tempjson['active']='Race in progress';
                }
                else if(parseInt(tempjson.date)<=req.headers.currenttime && (parseInt(tempjson.date)+parseInt(tempjson.betting_duration))>=req.headers.currenttime){
                    tempjson['active']='Open for bets';
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

router.get('/getActiveRaces', function(req, res) {
    var currenttime = Date.now()/1000;
    var result=[];
    KovanContract.find().sort('-date').limit(10).exec(function (err, contracts) {
        if(err)
        return res.status(500).send("There was a problem finding the contracts.");
        contracts.forEach(contractRecord=>{
            var tempjson=JSON.parse(JSON.stringify(contractRecord));

            // TODO: refactor the if clause logic.
            if((parseInt(tempjson.date)+parseInt(tempjson.betting_duration))<=currenttime && (parseInt(tempjson.end_time))>=currenttime){
                tempjson['active']='Race in progress';
                if(tempjson.contractid!==undefined)
                result.push(tempjson);
            } else if(parseInt(tempjson.date)<=currenttime && (parseInt(tempjson.date)+parseInt(tempjson.betting_duration))>=currenttime){
                tempjson['active']='Open for bets';
                if(tempjson.contractid!==undefined)
                result.push(tempjson);
            }
        });
        return res.status(200).send(result);
    });
});

router.get('/getParticipatedRaces', function(req, res) {
    var currenttime = Date.now()/1000;
    var slacktime = 2592000;
    Participated.find({participated_userid: req.headers.userid , 'participated_date':{'$gte': currenttime-slacktime,'$lte': currenttime}})
    .sort('-participated_date')
    .exec(function (err,contractlist){
        console.log(contractlist);
        contractlist = contractlist.map(a => a.participated_race);
        KovanContract.find({'contractid':contractlist}).sort('-date').exec(function (err, contracts) {
            var returnResult=[];
            if(err)
            return res.status(500).send("There was a problem finding the contracts.");
            else if(contracts.length>0){
                contracts.forEach(contractRecord=>{
                    var tempjson=JSON.parse(JSON.stringify(contractRecord))
                    if((parseInt(tempjson.date)+parseInt(tempjson.betting_duration))<=currenttime && (parseInt(tempjson.end_time))>=currenttime)
                    {
                        tempjson['active']='Race in progress';
                    }
                    else if(parseInt(tempjson.date)<=currenttime && (parseInt(tempjson.date)+parseInt(tempjson.betting_duration))>=currenttime){
                        tempjson['active']='Open for bets';
                    }
                    else
                    {
                        tempjson['active']='Closed';
                        if(tempjson.contractid!==undefined)
                        returnResult.push(tempjson);
                    }
                })
                res.status(200).send(returnResult);
            }
            else{
                return res.status(204).send([]);
            }
        })
        // res.status(200).send(contractlist);
    });
});

router.get('/getNonParticipatedRaces', function(req, res) {
    var currenttime = Date.now()/1000;
    var slacktime = 2592000;
    Participated.find({participated_userid: req.headers.userid , 'participated_date':{'$gte': currenttime-slacktime,'$lte': currenttime}})
    .sort('-participated_date')
    .exec(function (err,contractlist){
        contractlist = contractlist.map(a => a.participated_race);
        console.log(contractlist);
        KovanContract.find({'date':{'$gte':currenttime-slacktime,'$lte':currenttime},'contractid':{'$nin':contractlist}}).sort('-date').exec(function (err, contracts) {
            console.log(contracts);
            var returnResult=[];
            if(err) return res.status(500).send("There was a problem finding the contracts.");
            else if(contracts.length>0){
                contracts.forEach(contractRecord=>{
                    var tempjson=JSON.parse(JSON.stringify(contractRecord))
                    if((parseInt(tempjson.date)+parseInt(tempjson.betting_duration))<=currenttime && (parseInt(tempjson.end_time))>=currenttime)
                    {
                        // tempjson['active']='Race in progress';
                    }
                    else if(parseInt(tempjson.date)<=currenttime && (parseInt(tempjson.date)+parseInt(tempjson.betting_duration))>=currenttime){
                        // tempjson['active']='Open for bets';
                    }
                    else
                    {
                        tempjson['active']='Closed';
                        if(tempjson.contractid!==undefined)
                        returnResult.push(tempjson);
                    }
                })
                res.status(200).send(returnResult);
            }
            else{
                return res.status(204).send([]);
            }
        })
        // res.status(200).send(contractlist);
    });
});

router.get('/getNextRace', function (req, res) {
    KovanContract.find({race_duration:req.headers.duration}).sort('-date').limit(1).exec(function(err,contract){
        race1_interval = 21600;
        race2_interval = 43200;
        if (req.headers.duration == 3600) {
            race_interval = race1_interval;
        } else {
            race_interval = race2_interval;
        }
        if(err) return res.status(500).send("There was a problem finding the latest contract");
        if(contract.length == 0 || ((parseInt(contract[0].date)+race_interval)-parseInt(req.headers.currenttime))<0){
            return res.status(204).send([]);
        }
        else{
            nextrace = [{'raceDate':(parseInt(contract[0].date)+race_interval),'time_remaining':((parseInt(contract[0].date)+race_interval)-parseInt(req.headers.currenttime))*1000,'status':'Upcoming'}]
            res.status(200).send(nextrace);
        }
    })
});


// Now, you can use exposed details.
router.get('/detect', (req, res) => {
    console.log("Real ip: ",req.get['x-real-ip']);
    console.log("forwarded ip: ",req.get['x-forwarded-for']);
    res.locals.ip = req.get['x-forwarded-for'];
    console.log(res.locals.country); // RU (detected using IP from `res.locals.ip`)
    console.log(res.locals.ip); // RU (detected using IP from `res.locals.ip`)

    res.send({"country":res.locals.country});
})

module.exports = router;
