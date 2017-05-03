//var americano = require('americano');
var cozydb = require('cozydb');
var client = require('../lib/client')
module.exports = Tags = cozydb.getModel('tags', {
      "id": String,
});

/* This creates a global view on the db to index all the documents
    which contain a tags array.
    We cannot use cozydb for that, because:
      * The 'getCozyTags' api only returns the actual tags
      * The 'defineRequest' automatically adds a check on the 'tags' doctype
      * The already 'all' view defined on tags from the DS somehow doesn't work

*/
(createTagsRequest = function() {
    console.log('go create tag request')
    var map = function (doc) {
        var _ref = doc.tags;
        return _ref != null ? typeof _ref.forEach === "function" ?
            _ref.forEach(function(tag) {
                return emit(tag, null);
            }) : void 0 : void 0;
    };
    view = {
      reduce: void 0,
      map: map.toString()
    };
    path = "request/tags/alltags/";
    return client.put(path, view, function(error, response, body) {
       if(error) {
           console.log('error : ', error);
       }
       else {
           console.log('body : ', body)
       }
    });
})();

module.exports.getSensitiveDocs = function(callback) {
    var params = {
        include_docs: true,
        key: 'sensitive'
    };

    Tags.rawRequest("alltags", params, function(err, tags) {
        callback(err, tags);
    });
}

//TODO test this later: it returns [ { key: null, value: true } ]
module.exports.getTagged2 = function(callback) {
    var params = {
        reduce: true
    };

    path = "request/tags/all/";
    return client.post(path, params, function(error, response, body) {
       if(error) {
           console.log('error : ', error);
       }
       else {
           console.log('body : ', body)
       }
    });
}
