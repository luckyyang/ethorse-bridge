var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

var Contract = require('./Contract');

router.post('/', function (req, res) {
    console.log(req.body)
    Contract.create({
            contractid : req.body.contractid,
            date : req.body.date
        }, 
        function (err, contract) {
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