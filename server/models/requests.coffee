americano = require 'americano-cozy'
cozydb = require 'cozydb'

module.exports =
    sharingRule:
        all: cozydb.defaultRequests.all
