americano = require('americano');
cozydb = require('cozydb');

module.exports = {
    contacts: {
        all: americano.defaultRequests.all
    },
    files: {
        all: cozydb.defaultRequests.all
        byTag: cozydb.defaultRequests.tags
    }
};
