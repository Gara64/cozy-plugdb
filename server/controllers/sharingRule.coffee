SharingRule = require '../models/sharingRule.coffee'
auth = require './authentication.coffee'

module.exports.all = (req, res, next) ->
    auth.isAuth (err, isAuth) ->
        console.log 'is auth : ' + isAuth
        unless isAuth
            return res.send 401

        SharingRule.all (err, rules) ->
            return next err if err
            res.send 200, rules


module.exports.create = (req, res, next) ->
    auth.isAuth (err, isAuth) ->
        unless isAuth
            return res.send 401
        SharingRule.create req.body, (err, rule) ->
            return next err if err
            res.send 200, rule

module.exports.destroy = (req, res, next) ->
    auth.isAuth (err, isAuth) ->
        unless isAuth
            return res.send 401
        SharingRule.find req.params.ruleid, (err, rule) ->
            return res.error 500, 'An error occured', err if err
            return res.error 404, 'Rule not found' if not rule

            req.rule = rule
            req.rule.destroy (err) ->
                return next err if err
                res.send 200, success: 'Rule successfuly deleted'
