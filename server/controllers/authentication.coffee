Client = require('request-json').JsonClient
dsHost = 'localhost'
dsPort = '9101'
clientDS = new Client "http://#{dsHost}:#{dsPort}/"

if process.env.NODE_ENV is "production" or process.env.NODE_ENV is "test"
    clientDS.setBasicAuth process.env.NAME, process.env.TOKEN

module.exports.fingerprint = (req, res, next) ->
    clientDS.post "fingerprint/", null, (err, result, body) ->
        if err? or result.statusCode is 500
            console.log 'fail :/'
        else if res.statusCode is 401
            console.log 'auth nok'
        else
            console.log 'yeah'
