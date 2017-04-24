var cozydb = require('cozydb');

module.exports = Binary = cozydb.getModel('Binary', {});

Binary.getBinary = function(id, callback) {
    Binary.find(id, function(err, ret) {
        if(err)
            console.log(err);
        else{
            callback(ret);
        }
    });
};
