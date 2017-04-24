//var americano = require('americano');
cozydb = require('cozydb');

module.exports = Rule = cozydb.getModel('rule', {
      "id": String,
      "docType": String,
      "docAttr": String,
      "docVal" :String,
      "subAttr": String,
      "subVal": String,
});

var createRule = module.exports.createRule = function(params, callback) {
    Rule.create(params, function(err, result) {
        callback(err, result)
    });
};
