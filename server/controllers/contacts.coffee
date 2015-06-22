contacts = require '../models/contacts'
request = require 'request-json'
plug = require './plug'

module.exports.list = (req, res, next) ->
    contacts.request('all', (error, contacts) ->
        if error
            return next(error)
        plug.filterContactsPlug(contacts, (err, filteredContacts) ->
            if err
                return next(error)
            res.send(filteredContacts)    
        )
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





###  function(nDocs, baseName, callback) {
    var ids = [];
    var cpt = 0;
    for(var i=0; i<nDocs; i++) {
        createCozyContact(baseName, function(id) {
            ids.push(id);
            cpt++;
            console.log('id' + id + ' in array - cpt = ' + cpt + ' (ndocs = ' + nDocs);
            if(cpt == nDocs ){
                console.log('done');
                callback(ids);
            }
        });
    }
    };
    



var createCozyContact = function(baseName, callback) {
    var datapoint = new Array();
    Contact.create({fn: baseName, datapoints: datapoint }, function(err, contact) {
        if(err)
            callback(err);

        else{
            log.raw('contact created : ' + contact.id);
            callback(contact.id);
        }
    });
    };
    ###
