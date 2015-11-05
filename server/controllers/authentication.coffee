Client = require('request-json').JsonClient
dsHost = 'localhost'
dsPort = '9101'
clientDS = new Client "http://#{dsHost}:#{dsPort}/"

if process.env.NODE_ENV is "production" or process.env.NODE_ENV is "test"
    clientDS.setBasicAuth process.env.NAME, process.env.TOKEN

module.exports.fingerprint = (req, res, next) ->
    clientDS.post "fingerprint/", null, (err, result, body) ->

        if result.statusCode is 500
            res.send 500
        else if result.statusCode is 401
            res.send 401
        else
            res.send 200, 'ok'


###
module.exports.isAuth = (req, res, next) ->
    clientDS.get "fingerprint/", null, (err, res, body) ->
        if result.statusCode is 500 or not body.isInit?
            res.send 500
        else
            res.send 200, body.isInit
###

module.exports.isAuth = (callback) ->
    clientDS.get "fingerprint/", null, (err, result, body) ->
        callback err, body.isAuth
