americano = require "americano-cozy"
cozydb = require 'cozydb'

module.exports = SharingRule = cozydb.getModel('sharingRule', {
    "id"         : String,
    "name"       : String,
    "filterDoc"  : Object,
    "filterUser" : Object
})


SharingRule.all = (params, callback) ->
    SharingRule.request "all", params, callback
