//var americano = require('americano');
cozydb = require('cozydb');

module.exports = Rule = cozydb.getModel('sharingrule', {
      "id": String,
      "filterDoc": Object,
      "filterUser": Object,
      "docIDs": [Object],
      "userIDs": [Object]
});

var createRule = module.exports.createRule = function(params, callback) {
    Rule.create(params, function(err, result) {
        callback(err, result)
    });
};
