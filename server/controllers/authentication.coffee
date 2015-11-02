Client = require('request-json').JsonClient
dsHost = 'localhost'
dsPort = '9101'
clientDS = new Client "http://#{dsHost}:#{dsPort}/"

if process.env.NODE_ENV is "production" or process.env.NODE_ENV is "test"
    clientDS.setBasicAuth process.env.NAME, process.env.TOKEN

isAuth = false

module.exports.fingerprint = (req, res, next) ->
    clientDS.post "fingerprint/", null, (err, result, body) =>
        if err? or result.statusCode is 500
            res.send 500
        else if res.statusCode is 401
            res.send 401
        else
            isAuth = true
            res.send 200

module.exports.isAuth = ->
    return isAuth
