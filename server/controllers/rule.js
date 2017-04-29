Rule = require('../models/rule')
Tags = require('../models/tags')
request = require('request-json')
cozydb = require('cozydb');

module.exports.list = function(req, res, next) {
    Rule.request('all', function(err, rules) {
        if(err) {
            return next(err)
        }
        console.log('list rules', JSON.stringify(rules))
        res.send(rules)
    });
}

module.exports.create = function(req, res, next) {
    //TODO add auth pludb check

    var body = req.body;
    params = {
        filterDoc: body.filterDoc,
        filterUser: body.filterUser
    }
    console.log('create rule ', params)
    Rule.create(params, function(err, rule) {
        if(err) {
            res.send(500, err);
        }
        else {
            console.log("rule : ", rule);
            res.send(rule);
        }
    });
}

module.exports.remove = function(req, res, next) {
    id = req.params.id
    Rule.destroy(id, function(err) {
        if(err) {
            res.send(500, err)
        }
        else {
            res.send({success: true})
        }
    });
}

module.exports.get = function(req, res, next) {
    Rule.find(req.params.id, function(err, rule){
        if(err) {
            res.send(500, err)
        }
        else {
            res.send(rule)
        }
    });
}
