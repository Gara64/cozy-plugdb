//americano = require('americano');
cozydb = require('cozydb');

module.exports = {
    contacts: {
        all: cozydb.defaultRequests.all
    },
    tags: {
        alltags: cozydb.defaultRequests.tags
    }
};
