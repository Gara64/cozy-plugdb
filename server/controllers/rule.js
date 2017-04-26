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
    var docTypeDocPred = 'doc.docType == "'+body.docType+'"';
    var docAttrPred ='', subAttrPred = '';
    if(body.docAttr) {
         docAttrPred = ' && doc.'+body.docAttr+'.indexOf("'+body.docVal+'") > -1';
    }
    var docTypeSubPred = 'doc.docType == "contacts"';
    if(body.subAttr) {
         subAttrPred = ' && doc.'+body.subAttr+'.indexOf("'+body.subVal+'") > -1';
    }

    var docPred = docTypeDocPred + docAttrPred;
    var subPred = docTypeSubPred + subAttrPred;

    var docRule = {
        rule: docPred
    };
    var subRule = {
        rule: subPred
    }
    params = {
        filterDoc: docRule,
        filterUser: subRule
    }
    console.log('create rule ', params)
    Rule.create(params, function(err, rule) {
        if(err) {
            res.send(500, err);
        }
        else {
            console.log("rule : ", rule);
            res.send(200, "Ok");
        }
    });
    next()

}
