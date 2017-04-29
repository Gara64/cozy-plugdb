cozydb = require 'cozydb'

module.exports = File = cozydb.getModel 'File',
    path: String
    name: String
    docType: String
    mime: String
    creationDate: String
    lastModification: String
    class: String
    size: Number
    binary: Object
    checksum: String
    modificationHistory: Object
    clearance: cozydb.NoSchema
    tags: [String]
    uploading: Boolean

File.all = (params, callback) ->
    File.request "all", params, callback
