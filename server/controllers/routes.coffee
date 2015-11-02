# See documentation on https://github.com/frankrousseau/americano#routes

sharingrule = require './sharingRule'
auth = require './authentication'

module.exports =

    'plug/authenticate': post: auth.fingerprint

    'sharingrule':
        get: sharingrule.all
        post: sharingrule.create

    'sharingrule/:ruleid':
        delete: sharingrule.destroy
