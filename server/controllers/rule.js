Rule = require('../models/rule')
request = require('request-json')

module.exports.create = function(req, res) {
    //TODO add pludb check

    var body = req.body;
    console.log("body : ", body)

    Rule.createRule(body, function(err, res) {
        console.log("result rule : ", res);
    });
    res.send(200, "Ok");
}
