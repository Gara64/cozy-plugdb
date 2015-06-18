
americano = require "americano"

module.exports = Contacts = americano.getModel('Contact', {
      "id"         : String,
      "fn"         : String,
      "n"          : String,
      "datapoints" : (x) -> return x,
      "note"       : String,
      "shared"     : Boolean
})

createRequest = ->
    Contacts.defineRequest("shared", mapSharedDoc, (err) -> 
        if err
            console.log(err)
    )

#Defining shared request
mapSharedDoc = (doc) ->
    if doc.shared
        emit(doc._id, null)
    return


module.exports.deleteAll = (callback) ->
    contacts.requestDestroy("all", (err) ->
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
    contacts.create({fn: baseName}, (err, result) ->
        callback(err, result.id)
    )

module.exports.getIdsSharedContacts = (callback) ->
    contacts.request("shared", (err, results) ->
        console.log "ids shared contacts : " + results
        callback(err, results)
    )