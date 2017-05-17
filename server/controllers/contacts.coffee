contacts = require '../models/contacts'
request = require 'request-json'
plug = require './plug'

baseController = new cozydb.SimpleController
    model      : contacts
    reqParamID : 'id'
    reqProp : 'contact'

module.exports.list = (req, res, next) ->
    contacts.request('all', (error, contacts) ->
        if error
            return next(error)
        # TODO remove comments when done with tests
        ###
        plug.filterContactsPlug(contacts, (err, filteredContacts) ->
            if err
                return next(error)
            res.send(filteredContacts)
        )
        ###
        #console.log('list contacts', JSON.stringify(contacts))
        res.send(contacts)
    )

module.exports.get = (req, res, next) ->
    contacts.find(req.params.id, (error, contact)->
        if error
            return next(error)
        res.send(contact)
    )

module.exports.change = (req, res, next) ->
    contacts.find(req.params.id, (error, contact)->
        if error
            return next(error)
        contact.updateAttributes(req.body,(error,contact) ->
            if error
                return next(error)
            res.send contact
        )
    )


# Perform download as an inline attachment.
sendBinary = baseController.sendAttachment
    filename: 'picture'

module.exports.picture = (req, res, next) ->
    sendBinary req, res, next


###
var getIdsContacts = function(callback) {
    // Getting request results
    Contact.request("all", function (err, contacts) {
        if(err){
            console.error(err);
            return;
        }
        else{
            var ids = [];
            for(var i=0;i<contacts.length;i++){
                console.log("contact : " + contacts[i]);
                if(contacts[i].shared)
                    ids.push(contacts[i].id);
            }
            callback(ids);
        }
    });
};
###
