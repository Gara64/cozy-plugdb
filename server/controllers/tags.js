Tags = require('../models/tag')
cozydb = require('cozydb');

module.exports.listSensitiveTags = function(req, res, next) {
    Tags.getSensitiveDocs(function(err, tags) {
        if(err) {
            return next(err)
        }
        var t = []
        tags.forEach(function(tag) {
            t.push(tag.id)
        });
        //console.log("\n\ntags : " + JSON.stringify(t));
        res.send(t);
    });
}
