// var test = require('~/playground/dev-bridge/js/Contract/KovanContract');
var KovanContract = require(__dirname+'/KovanContract');
var Participated = require(__dirname+'/Participated');
//console.log(KovanContract)
// KovanContract.find({"contractid":{"$exists":true}}).exec(function(err,data){
var currenttime = Date.now()/1000;
var slacktime = 2592000;
Participated.find({participated_userid: "0xa1e6b54b616fa65490ffa227b6cb10f00ac9717c" , 'participated_date':{'$gte': currenttime-slacktime,'$lte': currenttime}},function(err, contractlist){
    KovanContract.find({'date':{'$gte':currenttime-slacktime,'$lte':currenttime}}).where('contractid').ne(contractlist).sort('-date').exec(function (err, contracts) {
        console.log(contracts);
        // data.forEach(val=>{
        //     console.log(val)
        // })
    });
});
