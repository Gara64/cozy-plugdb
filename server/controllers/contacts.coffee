contacts = require '../models/contacts'

module.exports.list = (req, res, next) ->
    contacts.request('all', (error, contacts)->
        if error
            return next(error)
        res.send(contacts)
    )

module.exports.get = (req, res, next) ->
    contacts.find(req.params.id, (error, contact)->
        if error
            return next(error)
        res.send(contact)
    )

module.exports.change = (req, res, next) ->
    console.log 'log1'
    contacts.find(req.params.id, (error, contact)->
        console.log 'log2', req.body, error
        if error
            return next(error)
        contact.updateAttributes(req.body,(error,contact) ->
            console.log 'log3', contact
            if error
                return next(error)
            res.send contact
        )
    )






