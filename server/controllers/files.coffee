cozydb = require 'cozydb'
File = require '../models/file'
feed = require '../lib/feed'

baseController = new cozydb.SimpleController
    model: File
    reqProp: 'file'
    reqParamID: 'fileid'


module.exports.fetch = (req, res, next, id) ->
    File.request 'all', key: id, (err, file) ->
        if err or not file or file.length is 0
            unless err?
                err = new Error 'File not found'
                err.status = 404
                err.template =
                    name: '404'
                    params:
                        localization: require '../lib/localization_manager'
                        isPublic: req.url.indexOf('public') isnt -1
            next err
        else
            req.file = file[0]
            next()


module.exports.find = (req, res, next) ->
    File.find req.params.fileid, (error, file)->
        if error
            return next(error)
        # console.log 'file : ', file

        res.send(file)

module.exports.all = baseController.listAll

# Perform download as an inline attachment.
sendBinary = baseController.sendBinary
    filename: 'file'

module.exports.getAttachment = (req, res, next) ->
    # Prevent server from stopping if the download is very slow.
    isDownloading = true
    do keepAlive = ->
        if isDownloading
            feed.publish 'usage.application', 'files'
            setTimeout keepAlive, 60 * 1000

    # Configure headers so clients know they should read and not download.
    encodedFileName = encodeURIComponent req.name
    res.setHeader 'Content-Disposition', """
        inline; filename*=UTF8''#{encodedFileName}
    """

    # Tell when the download is over in order to stop the keepAlive mechanism.
    res.on 'close', -> isDownloading = false
    res.on 'finish', -> isDownloading = false

    sendBinary req, res, next
