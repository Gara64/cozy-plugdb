Tags = require('../models/tag')
cozydb = require('cozydb');

module.exports.listSensitiveTags = function(req, res, next) {
    Tags.getSensitiveDocs(function(err, tags) {
        if(err) {
            return next(err)
        }
        console.log("\n\ntags : " + JSON.stringify(tags));

        res.send(tags);
    });
}
