
americano = require "americano"

module.exports = Contacts = americano.getModel('Contact', {
      "id"         : String,
      "fn"         : String,
      "n"          : String,
      "datapoints" : (x) -> return x,
      "note"       : String,
      "shared"     : Boolean
})

#Defining shared request
mapSharedDoc = (doc) ->
    if doc.shared
        emit(doc._id, doc)
    return

do createRequest = ->
    console.log('request creation')
    Contacts.defineRequest("shared", mapSharedDoc, (err) -> 
        if err
            console.log(err)
    )


module.exports.deleteAll = (callback) ->
    Contacts.requestDestroy("all", (err) ->
        return callback(err)
    )

module.exports.createContacts = (nDocs, baseName, callback) ->
    ids = []
    cpt = 0
    createSingleContact(baseName, (err, result) ->
        if err
            callback(err)
        ids.push result.id
        #this is necessary to return the ids list to plugDB
        if cpt is nDocs
            callback(null, ids)
    ) for i in [0 .. nDocs] 

module.exports.createSingleContact = (baseName, callback) ->
    Contacts.create({fn: baseName}, (err, result) ->
        callback(err, result.id)
    )

module.exports.getSharedContacts = (callback) ->
    Contacts.request("shared", (err, results) ->
        if results
            getIds = (res.id for res in results)
            callback(err, getIds)
        else
            callback(err)
    )




