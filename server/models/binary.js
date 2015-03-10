var americano = require('americano-cozy');

module.exports = Binary = americano.getModel('Binary', {});

Binary.getBinary = function(id, callback) {
    Binary.find(id, function(err, ret) {
        if(err)
            console.log(err);
        else{
            callback(ret);
        }
    });
};