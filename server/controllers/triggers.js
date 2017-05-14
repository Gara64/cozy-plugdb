Trigger = require('../models/trigger')
request = require('request-json')
cozydb = require('cozydb');

module.exports.list = function(req, res, next) {
    Trigger.request('all', function(err, triggers) {
        if(err) {
            return next(err)
        }
        console.log("list triggers : ", triggers);
        res.send(triggers)
    });
}

module.exports.create = function(req, res, next) {
    //TODO add auth pludb check

    var body = req.body;
    Trigger.create(body, function(err, trigger) {
        if(err) {
            res.send(500, err);
        }
        else {
            console.log("created trigger : ", trigger);
            res.send(trigger);
        }
    });
}

module.exports.change = function(req, res, next) {
    Trigger.find(req.params.id, function(err, trigger) {
        if(err) {
            return next(err)
        }
        Trigger.updateAttributes(req.params.id, req.body, function(err, newTrigger) {
            if(err) {
                return next(err)
            }
            res.send(newTrigger)
        });
    });
}


module.exports.remove = function(req, res, next) {
    id = req.params.id
    Trigger.destroy(id, function(err) {
        if(err) {
            res.send(500, err)
        }
        else {
            res.send({success: true})
        }
    });
}

module.exports.get = function(req, res, next) {
    Trigger.find(req.params.id, function(err, trigger){
        if(err) {
            res.send(500, err)
        }
        else {
            res.send(trigger)
        }
    });
}
