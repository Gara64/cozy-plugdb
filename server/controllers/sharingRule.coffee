SharingRule = require '../models/sharingRule.coffee'
auth = require './authentication.coffee'

module.exports.all = (req, res, next) ->
    console.log 'is auth : ' + auth.isAuth
    if auth.isAuth
        SharingRule.all (err, rules) ->
            return next err if err
            res.send 200, rules
    else
        res.send 401

module.exports.create = (req, res, next) ->
    if auth.isAuth
        SharingRule.create req.body, (err, rule) ->
            return next err if err
            res.send 200, rule
    else
        res.send 401

module.exports.destroy = (req, res, next) ->
    if auth.isAuth
        SharingRule.find req.params.ruleid, (err, rule) ->
            return res.error 500, 'An error occured', err if err
            return res.error 404, 'Rule not found' if not rule

            req.rule = rule
            req.rule.destroy (err) ->
                return next err if err
                res.send 200, success: 'Rule successfuly deleted'
    else
        res.send 401
